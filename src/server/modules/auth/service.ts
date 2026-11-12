import { createHash, timingSafeEqual } from "node:crypto";

const digest = (value: string) => createHash("sha256").update(value).digest();

export function createAuthService({ pin }: { pin: string }) {
  const pinDigest = digest(pin);
  const sessionToken = digest(`session:${pin}`).toString("base64url");

  return {
    sessionToken,
    verifyPin: (candidate: string) => timingSafeEqual(digest(candidate), pinDigest),
    isValidSession: (token: string | null) => token === sessionToken,
  };
}

export type AuthService = ReturnType<typeof createAuthService>;
