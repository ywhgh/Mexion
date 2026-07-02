import crypto from "node:crypto";

const DEV_SECRET_HEX = "000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f";
let warnedDevKey = false;

function keyBytes(): Buffer {
  const value = process.env.MEXION_SECRET_KEY;
  if (!value) {
    if (!warnedDevKey) {
      console.warn("MEXION_SECRET_KEY is not set; using deterministic development encryption key");
      warnedDevKey = true;
    }
    return Buffer.from(DEV_SECRET_HEX, "hex");
  }
  if (!/^[0-9a-fA-F]{64}$/.test(value)) {
    throw new Error("MEXION_SECRET_KEY must be a 32-byte hex string");
  }
  return Buffer.from(value, "hex");
}

export function encryptSecret(plaintext: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", keyBytes(), iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return Buffer.concat([iv, authTag, ciphertext]).toString("base64");
}

export function decryptSecret(ciphertext: string): string {
  const payload = Buffer.from(ciphertext, "base64");
  if (payload.length < 29) {
    throw new Error("Invalid encrypted secret payload");
  }
  const iv = payload.subarray(0, 12);
  const authTag = payload.subarray(12, 28);
  const encrypted = payload.subarray(28);
  const decipher = crypto.createDecipheriv("aes-256-gcm", keyBytes(), iv);
  decipher.setAuthTag(authTag);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8");
}
