#!/usr/bin/env node
/**
 * Creates (or verifies) an AES token matching the app's decodeToken scheme.
 *
 * Scheme (keep in sync with src/utils/token.ts):
 *   - AES-256 in ECB mode, PKCS7 padding
 *   - key = SHA-256 of the AES_KEY string (from .env / --key)
 *   - token = base64(ciphertext)
 *
 * Usage:
 *   npm run gen:token -- "my secret"                # encrypt, reads AES_KEY from .env
 *   npm run gen:token -- "my secret" --key <key>    # explicit key
 *   npm run gen:token -- --verify <token>           # decrypt and print
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const ENV_PATH = path.join(__dirname, '..', '.env');

function loadKey(cliKey) {
  if (cliKey) {
    return cliKey;
  }
  if (process.env.AES_KEY) {
    return process.env.AES_KEY;
  }
  if (fs.existsSync(ENV_PATH)) {
    const match = fs.readFileSync(ENV_PATH, 'utf8').match(/^AES_KEY\s*=\s*(.+)\s*$/m);
    if (match) {
      return match[1];
    }
  }
  console.error('AES_KEY not found (pass --key, set AES_KEY env, or configure .env)');
  process.exit(1);
}

const deriveKey = (keyString) => crypto.createHash('sha256').update(keyString, 'utf8').digest();

function encrypt(plaintext, keyString) {
  const cipher = crypto.createCipheriv('aes-256-ecb', deriveKey(keyString), null);
  return Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]).toString('base64');
}

function decrypt(token, keyString) {
  const decipher = crypto.createDecipheriv('aes-256-ecb', deriveKey(keyString), null);
  return Buffer.concat([
    decipher.update(Buffer.from(token, 'base64')),
    decipher.final(),
  ]).toString('utf8');
}

const args = process.argv.slice(2);
const verifyIndex = args.indexOf('--verify');
const verify = verifyIndex !== -1;

let cliKey = null;
const keyIndex = args.indexOf('--key');
if (keyIndex !== -1) {
  cliKey = args[keyIndex + 1];
  args.splice(keyIndex, 2);
}
if (verifyIndex !== -1) {
  args.splice(verifyIndex, 1);
}

const text = args.join(' ');
const keyString = loadKey(cliKey);

try {
  if (verify) {
    if (!text) {
      console.error('--verify requires the token as an argument');
      process.exit(1);
    }
    console.log(decrypt(text, keyString));
  } else {
    if (!text) {
      console.error('missing plaintext');
      console.error('usage: npm run gen:token -- "your secret" [--key <key>]');
      process.exit(1);
    }
    console.log('Generating token for:', text, 'with key:', keyString);
    console.log(encrypt(text, keyString));
  }
} catch (error) {
  console.error('Failed:', error.message);
  process.exit(1);
}