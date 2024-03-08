import type { OtpObject } from "../Pages/Home";

export function parseOTPAuthURL(url: string): OtpObject {
    const urlObject = new URL(url);
    const params = new URLSearchParams(urlObject.search);
  
    const algomap: Record<string, string> = {
      SHA1: "SHA-1",
      SHA256: "SHA-256",
      SHA512: "SHA-512",
    };
  
    let algorithm = params.get("algorithm") || "SHA1";
  
    let otpObject = {
      type: urlObject.pathname.split("/")[2],
      label: urlObject.pathname.split("/")[3],
      issuer: params.get("issuer") || "",
      secret: params.get("secret") || "",
      algorithm: algomap[algorithm],
      digits: params.get("digits") || "6",
      counter: params.get("counter") || "0",
      period: params.get("period") || "30",
    };
  
    if (!otpObject.secret || !otpObject.label) {
      throw new Error("Invalid OTPAuth URL");
    }
  
    return otpObject;
  }
  