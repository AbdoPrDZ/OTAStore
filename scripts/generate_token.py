"""Create (or verify) an AES token matching the app's decodeToken scheme.

Scheme (keep in sync with src/utils/token.ts and scripts/generate-token.js):
- AES-256 in ECB mode, PKCS7 padding
- key = SHA-256 of the AES_KEY string (from .env / --key)
- token = base64(ciphertext)

Usage:
    py scripts/generate_token.py "my secret"                # encrypt, reads AES_KEY from .env
    py scripts/generate_token.py "my secret" --key <key>    # explicit key
    py scripts/generate_token.py --verify <token>           # decrypt and print
"""

import argparse
import base64
import os
import sys
from pathlib import Path

try:
    from Crypto.Cipher import AES
    from Crypto.Hash import SHA256
    from Crypto.Util.Padding import pad, unpad
except ImportError:
    sys.exit("PyCryptodome is required: pip install pycryptodome")


ENV_PATH = Path(__file__).resolve().parent.parent / ".env"


def load_key(cli_key):
    if cli_key:
        return cli_key
    if os.environ.get("AES_KEY"):
        return os.environ["AES_KEY"]
    if ENV_PATH.is_file():
        for line in ENV_PATH.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if line.startswith("AES_KEY="):
                return line.partition("=")[2].strip()
    sys.exit(
        "AES_KEY not found (pass --key, set AES_KEY env, or configure .env)"
    )


def derive_key(key_string):
    return SHA256.new(key_string.encode("utf-8")).digest()


def encrypt(plaintext, key_string):
    cipher = AES.new(derive_key(key_string), AES.MODE_ECB)
    ciphertext = cipher.encrypt(pad(plaintext.encode("utf-8"), AES.block_size))
    return base64.b64encode(ciphertext).decode("ascii")


def decrypt(token, key_string):
    cipher = AES.new(derive_key(key_string), AES.MODE_ECB)
    plaintext = unpad(
        cipher.decrypt(base64.b64decode(token.encode("ascii"))),
        AES.block_size,
    )
    return plaintext.decode("utf-8")


def main():
    parser = argparse.ArgumentParser(
        description="Create or verify an AES token for the app."
    )
    parser.add_argument("text", nargs="?", help="Plaintext to encrypt (or token with --verify)")
    parser.add_argument("--key", help="AES_KEY secret string (defaults to .env)")
    parser.add_argument("--verify", action="store_true", help="Decrypt the token given as `text`")
    args = parser.parse_args()

    key_string = load_key(args.key)

    if args.verify:
        if not args.text:
            sys.exit("--verify requires the token as the positional argument")
        print(decrypt(args.text, key_string))
        return

    if not args.text:
        args.text = input("Plaintext: ")
    print(encrypt(args.text, key_string))


if __name__ == "__main__":
    main()