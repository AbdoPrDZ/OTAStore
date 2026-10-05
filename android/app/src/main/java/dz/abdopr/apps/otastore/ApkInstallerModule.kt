package dz.abdopr.apps.otastore

import android.content.Intent
import android.content.pm.PackageInfo
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.os.Environment
import android.os.Handler
import android.os.Looper
import android.provider.Settings
import androidx.core.content.FileProvider
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.WritableMap
import java.io.File
import java.net.HttpURLConnection
import java.net.URL
import java.util.concurrent.atomic.AtomicBoolean

/**
 * Downloads an `.apk` in-process and hands it to the system package installer.
 *
 * The download is done here (not with Android's [android.app.DownloadManager])
 * on purpose: DownloadManager runs under the system downloads provider, which
 * neither honours this app's `network_security_config` (so plain-HTTP dev
 * servers are refused) nor can reliably write into the app's private storage.
 *
 * The system install prompt is unavoidable on modern Android; this module only
 * removes the need to leave the app. Callers must hold the
 * `REQUEST_INSTALL_PACKAGES` capability — [isInstallPermissionGranted] reports it
 * and [openInstallSettings] takes the user to the toggle.
 */
class ApkInstallerModule(private val reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  override fun getName(): String = "ApkInstaller"

  @ReactMethod
  fun isInstallPermissionGranted(promise: Promise) {
    promise.resolve(canInstall())
  }

  @ReactMethod
  fun openInstallSettings(promise: Promise) {
    try {
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
        val intent = Intent(
          Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES,
          Uri.parse("package:${reactContext.packageName}"),
        )
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        reactContext.startActivity(intent)
        promise.resolve(true)
      } else {
        promise.resolve(false)
      }
    } catch (error: Exception) {
      promise.reject("E_INSTALL_SETTINGS", error.message, error)
    }
  }

  @ReactMethod
  fun downloadAndInstall(
    url: String,
    fileName: String,
    headers: ReadableMap?,
    promise: Promise,
  ) {
    if (!canInstall()) {
      promise.reject(
        "E_INSTALL_PERMISSION",
        "The app is not allowed to install packages yet.",
      )
      return
    }

    val safeName = if (fileName.endsWith(".apk", true)) fileName else "$fileName.apk"
    val directory = File(
      reactContext.getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS),
      "",
    ).apply { mkdirs() }
    val target = File(directory, safeName)

    if (target.exists()) {
      target.delete()
    }

    val requestHeaders = mutableMapOf<String, String>()
    headers?.let {
      val keys = it.keySetIterator()
      while (keys.hasNextKey()) {
        val key = keys.nextKey()
        it.getString(key)?.let { value ->
          if (value.isNotEmpty()) {
            requestHeaders[key] = value
          }
        }
      }
    }

    Thread {
      val settled = AtomicBoolean(false)
      var connection: HttpURLConnection? = null

      try {
        connection = (URL(url).openConnection() as HttpURLConnection).apply {
          requestMethod = "GET"
          connectTimeout = 15_000
          readTimeout = 60_000
          instanceFollowRedirects = true
          requestHeaders.forEach { (key, value) -> addRequestProperty(key, value) }
        }

        val code = connection.responseCode

        if (code !in 200..299) {
          settled.set(true)
          promise.reject("E_DOWNLOAD", "Server returned HTTP $code.")
          return@Thread
        }

        connection.inputStream.use { input ->
          target.outputStream().use { output -> input.copyTo(output) }
        }

        if (!looksLikeApk(target)) {
          target.delete()
          settled.set(true)
          promise.reject("E_DOWNLOAD", "The downloaded file is not an APK.")
          return@Thread
        }

        Handler(Looper.getMainLooper()).post {
          if (!settled.compareAndSet(false, true)) {
            return@post
          }
          try {
            launchInstaller(target)
            promise.resolve(true)
          } catch (error: Exception) {
            promise.reject("E_INSTALL", error.message, error)
          }
        }
      } catch (error: Exception) {
        if (settled.compareAndSet(false, true)) {
          promise.reject("E_DOWNLOAD", error.message, error)
        }
      } finally {
        connection?.disconnect()
      }
    }.start()
  }

  /** Returns the installed version of one package, or null when not installed. */
  @ReactMethod
  fun getInstalledVersion(packageName: String, promise: Promise) {
    try {
      val info = packageInfo(packageName)
      promise.resolve(if (info == null) null else infoMap(info))
    } catch (error: Exception) {
      promise.reject("E_PACKAGE_INFO", error.message, error)
    }
  }

  /** Batch variant: `{ [package]: { versionName, versionCode } | null }`. */
  @ReactMethod
  fun getInstalledVersions(packages: ReadableArray, promise: Promise) {
    try {
      val result = Arguments.createMap()

      for (index in 0 until packages.size()) {
        val packageName = packages.getString(index) ?: continue
        val info = packageInfo(packageName)

        if (info == null) {
          result.putNull(packageName)
        } else {
          result.putMap(packageName, infoMap(info))
        }
      }

      promise.resolve(result)
    } catch (error: Exception) {
      promise.reject("E_PACKAGE_INFO", error.message, error)
    }
  }

  /** Launches an installed app; resolves false when it has no launcher entry. */
  @ReactMethod
  fun openApp(packageName: String, promise: Promise) {
    try {
      val intent = reactContext.packageManager.getLaunchIntentForPackage(packageName)

      if (intent == null) {
        promise.resolve(false)
        return
      }

      intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
      reactContext.startActivity(intent)
      promise.resolve(true)
    } catch (error: Exception) {
      promise.reject("E_OPEN_APP", error.message, error)
    }
  }

  private fun packageInfo(packageName: String): PackageInfo? = try {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
      reactContext.packageManager.getPackageInfo(
        packageName,
        PackageManager.PackageInfoFlags.of(0),
      )
    } else {
      @Suppress("DEPRECATION")
      reactContext.packageManager.getPackageInfo(packageName, 0)
    }
  } catch (_: PackageManager.NameNotFoundException) {
    null
  }

  private fun infoMap(info: PackageInfo): WritableMap {
    val map = Arguments.createMap()
    map.putString("versionName", info.versionName)

    val code = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
      info.longVersionCode
    } else {
      @Suppress("DEPRECATION")
      info.versionCode.toLong()
    }

    map.putDouble("versionCode", code.toDouble())

    return map
  }

  /** A ZIP/APK starts with the "PK" magic bytes. */
  private fun looksLikeApk(file: File): Boolean {    if (!file.exists() || file.length() < 4) {
      return false
    }

    return try {
      file.inputStream().use { stream ->
        val signature = ByteArray(2)
        stream.read(signature) == 2 && signature[0] == 0x50.toByte() && signature[1] == 0x4B.toByte()
      }
    } catch (_: Exception) {
      false
    }
  }

  private fun launchInstaller(file: File) {
    val uri = FileProvider.getUriForFile(
      reactContext,
      "${reactContext.packageName}.fileprovider",
      file,
    )

    val intent = Intent(Intent.ACTION_VIEW).apply {
      setDataAndType(uri, APK_MIME)
      addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
      addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
    }

    reactContext.startActivity(intent)
  }

  private fun canInstall(): Boolean =
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      reactContext.packageManager.canRequestPackageInstalls()
    } else {
      true
    }

  companion object {
    private const val APK_MIME = "application/vnd.android.package-archive"
  }
}
