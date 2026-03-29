import * as jose from "jose";
import config from "@/config";

const getSecret = () => jose.base64url.decode(config.JWT_SECRET);

export interface JwtPayload extends jose.JWTPayload {
  id: number;
  username: string;
  email: string;
}

export const createToken = async (payload: JwtPayload): Promise<string> => {
  const secret = getSecret();
  const jwt = await new jose.EncryptJWT(payload)
    .setProtectedHeader({ alg: config.JWT_ALG, enc: config.JWT_ENC })
    .setExpirationTime(config.JWT_EXP)
    .encrypt(secret);
  return jwt;
};

export const createRefreshToken = async (
  payload: JwtPayload,
): Promise<string> => {
  const secret = getSecret();
  const jwt = await new jose.EncryptJWT(payload)
    .setProtectedHeader({ alg: config.JWT_ALG, enc: config.JWT_ENC })
    .setExpirationTime(config.JWT_EXP_7D)
    .encrypt(secret);
  return jwt;
};

export const verifyToken = async (
  token: string,
): Promise<JwtPayload | null> => {
  try {
    const secret = getSecret();
    const { payload } = await jose.jwtDecrypt(token, secret);
    return payload as JwtPayload;
  } catch {
    return null;
  }
};

export const getTokenExpiration = (token: string): number | null => {
  try {
    const decoded = jose.decodeJwt(token);
    return decoded.exp ?? null;
  } catch {
    return null;
  }
};
