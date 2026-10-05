package dz.abdopr.apps.otastore

import android.app.Application
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeApplicationEntryPoint.loadReactNative
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost
import com.facebook.react.defaults.DefaultReactNativeHost
import com.otaclient.ota.OtaBundleProvider

class MainApplication : Application(), ReactApplication {

  private val rnHost = object : DefaultReactNativeHost(this@MainApplication) {

    override fun getUseDeveloperSupport(): Boolean = BuildConfig.DEBUG

    override fun getPackages() = PackageList(this).packages.apply {
      // The JS bundle of this app is not the only thing it installs: the
      // ApkInstaller module downloads and launches the system package installer
      // for apps published on the store.
      add(ApkInstallerPackage())
    }

    override fun getJSMainModuleName(): String = "index"

    // The ota-client integration point. Returns the downloaded bundle when one
    // is active for this runtimeVersion, or null to fall back to the bundle
    // inside the APK (or Metro, in debug).
    override fun getJSBundleFile(): String? =
      OtaBundleProvider.getJSBundleFile(applicationContext)
  }

  override val reactHost: ReactHost by lazy {
    getDefaultReactHost(
      context = applicationContext,
      rnHost,
    )
  }

  override fun onCreate() {
    super.onCreate()
    loadReactNative(this)
  }
}
