"""
key_rotation.py: Automated key rotation for all encrypted at-rest files

- Rotates the SECURE_STORAGE_KEY for all .enc files in python_wrapper/
- Decrypts with old key, re-encrypts with new key
- Usage: python key_rotation.py <old_key> <new_key>
- Both keys must be base64-encoded 32 bytes
"""
import os
import sys
import base64
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
import glob
import json

def decrypt_file(path, key):
    with open(path, "rb") as f:
        raw = f.read()
    nonce, ct = raw[:12], raw[12:]
    aesgcm = AESGCM(key)
    return aesgcm.decrypt(nonce, ct, None)

def encrypt_file(path, data, key):
    aesgcm = AESGCM(key)
    nonce = os.urandom(12)
    ct = aesgcm.encrypt(nonce, data, None)
    with open(path, "wb") as f:
        f.write(nonce + ct)

def rotate_keys(directory, old_key, new_key):
    for path in glob.glob(os.path.join(directory, '*.json.enc')):
        print(f"Rotating key for {path}")
        data = decrypt_file(path, old_key)
        encrypt_file(path, data, new_key)
    print("Key rotation complete.")

def main():
    if len(sys.argv) != 3:
        print("Usage: python key_rotation.py <old_key> <new_key>")
        sys.exit(1)
    old_key = base64.urlsafe_b64decode(sys.argv[1])
    new_key = base64.urlsafe_b64decode(sys.argv[2])
    if len(old_key) != 32 or len(new_key) != 32:
        print("Keys must be base64-encoded 32 bytes.")
        sys.exit(1)
    rotate_keys(os.path.dirname(__file__), old_key, new_key)

if __name__ == "__main__":
    main()
