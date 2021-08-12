import { Request, Response } from "express";
import { getCookie, setCookie } from "../cookies.js";
import { refreshTokenRequiredMsg, userNotFoundMsg } from "../msg.js";
import {
  verifyRefreshToken,
  generateAccessToken,
  getAccessTokenCookieName,
  getAccessTokenExpireTime,
  getRefreshTokenCookieName,
} from "../tokens.js";

/* Given the refresh token, generate new access token */
export default async function (req: Request, res: Response): Promise<void> {
  const refreshToken = getCookie(req, getRefreshTokenCookieName());
  /* No refresh token */
  if (!refreshToken) {
    res.status(403).json(refreshTokenRequiredMsg);
    return;
  }
  const user = await verifyRefreshToken(refreshToken);
  /* No user */
  if (!user) {
    res.status(404).json(userNotFoundMsg);
    return;
  }
  const accessToken = generateAccessToken(user);
  setCookie(
    res,
    getAccessTokenCookieName(),
    accessToken,
    new Date(Date.now() + getAccessTokenExpireTime())
  );
  res.status(200).json({ username: user.username, p: user.p });
}
