#!/usr/bin/env node
/**
 * Generates a random AES-256 key as a 64-hex-char string for the .env AES_KEY.
 *
 * Usage:
 *   npm run gen:key                 # print a new random key
 *   npm run gen:key -- --env        # also write/update AES_KEY in .env
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const ENV_PATH = path.join(__dirname, '..', '.env');

const writeEnv = process.argv.includes('--env');

const key = crypto.randomBytes(32).toString('hex');

if (!writeEnv) {
  console.log(key);
  process.exit(0);
}

let envContent = '';
if (fs.existsSync(ENV_PATH)) {
  envContent = fs.readFileSync(ENV_PATH, 'utf8');
}

if (/^AES_KEY\s*=/m.test(envContent)) {
  envContent = envContent.replace(/^AES_KEY\s*=.*$/m, `AES_KEY=${key}`);
} else {
  envContent = `${envContent.trim()}\nAES_KEY=${key}\n`.replace(/^\n+/, '') ||
    `AES_KEY=${key}\n`;
}

fs.writeFileSync(ENV_PATH, envContent);
console.log(`AES_KEY written to .env: ${key}`);