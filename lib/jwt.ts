import { SignJWT, jwtVerify, JWTPayload } from "jose";

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET missing");
  return new TextEncoder().encode(secret);
}

export async function signJwt(payload: JWTPayload, expiresIn: string = "7d") {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(getSecret());
}

export async function verifyJwt<T = any>(token: string): Promise<T | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload as T;
  } catch {
    return null;
  }
}
