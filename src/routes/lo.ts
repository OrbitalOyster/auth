import { Request, Response } from "express";
import { getCookie, clearCookie } from "../cookies.js";
import { refreshTokenRequiredMsg, userNotFoundMsg } from "../msg.js";
import {
  getRefreshTokenCookieName,
  removeRefreshToken,
  getAccessTokenCookieName,
} from "../tokens.js";

/* Remove refresh token from DB (log out) */
export default async function (req: Request, res: Response): Promise<void> {
  const refreshToken = getCookie(req, getRefreshTokenCookieName());
  /* No token */
  if (!refreshToken) {
    res.status(403).json(refreshTokenRequiredMsg);
    return;
  }
  const removed = await removeRefreshToken(refreshToken);
  if (removed) {
    clearCookie(res, getRefreshTokenCookieName());
    clearCookie(res, getAccessTokenCookieName());
    res.sendStatus(200);
  } else res.status(404).json(userNotFoundMsg);
}
