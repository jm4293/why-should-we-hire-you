import CryptoJS from "crypto-js";

// 브라우저 고유값 기반 암호화 키 생성
function getEncryptionKey(): string {
  const base = [
    typeof window !== "undefined" ? window.location.hostname : "localhost",
    "why-we-hire-you",
  ].join("::");
  return CryptoJS.SHA256(base).toString();
}

export function encrypt(text: string): string {
  return CryptoJS.AES.encrypt(text, getEncryptionKey()).toString();
}

export function decrypt(cipherText: string): string {
  try {
    const bytes = CryptoJS.AES.decrypt(cipherText, getEncryptionKey());
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch {
    return "";
  }
}
