import CryptoJS from "crypto-js";

const AES_KEY = "ThisIsASecretKey123"; // Must match backend
const AES_IV = "ThisIsAnIV456789";     // Must match backend

// Simple Fernet-like symmetric encryption using browser SubtleCrypto
async function fernetEncrypt(data, key) {
  const enc = new TextEncoder();
  const cryptoKey = await window.crypto.subtle.importKey(
    "raw", enc.encode(key), { name: "AES-CFB", length: 128 }, false, ["encrypt"]
  );
  const encrypted = await window.crypto.subtle.encrypt(
    { name: "AES-CFB", iv: enc.encode(AES_IV) }, cryptoKey, enc.encode(data)
  );
  return new Uint8Array(encrypted);
}

async function fernetDecrypt(data, key) {
  const enc = new TextEncoder();
  const cryptoKey = await window.crypto.subtle.importKey(
    "raw", enc.encode(key), { name: "AES-CFB", length: 128 }, false, ["decrypt"]
  );
  const decrypted = await window.crypto.subtle.decrypt(
    { name: "AES-CFB", iv: enc.encode(AES_IV) }, cryptoKey, data
  );
  return new TextDecoder().decode(decrypted);
}

export async function doubleEncrypt(payload) {
  // First layer: Fernet-like
  const fernetKey = AES_KEY;
  const encrypted1 = await fernetEncrypt(JSON.stringify(payload), fernetKey);
  // Second layer: AES
  const encrypted2 = CryptoJS.AES.encrypt(
    CryptoJS.enc.Utf8.parse(Array.from(encrypted1).join(",")),
    CryptoJS.enc.Utf8.parse(AES_KEY),
    { iv: CryptoJS.enc.Utf8.parse(AES_IV), mode: CryptoJS.mode.CFB }
  ).toString();
  return encrypted2;
}

export async function doubleDecrypt(ciphertext) {
  // Second layer: AES
  const decrypted1 = CryptoJS.AES.decrypt(
    ciphertext,
    CryptoJS.enc.Utf8.parse(AES_KEY),
    { iv: CryptoJS.enc.Utf8.parse(AES_IV), mode: CryptoJS.mode.CFB }
  ).toString(CryptoJS.enc.Utf8);
  // Convert back to Uint8Array
  const bytes = decrypted1.split(",").map(Number);
  // First layer: Fernet-like
  const fernetKey = AES_KEY;
  const decrypted2 = await fernetDecrypt(new Uint8Array(bytes), fernetKey);
  return JSON.parse(decrypted2);
}