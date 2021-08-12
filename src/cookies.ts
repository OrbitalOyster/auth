import { Request, Response } from "express";

export function setCookie(
  res: Response,
  cookieName: string,
  cookieContent: unknown,
  expires: Date
): void {
  res.cookie(cookieName, cookieContent, {
    httpOnly: true,
    secure: true,
    signed: true,
    expires,
  });
}

export function clearCookie(res: Response, cookieName: string): void {
  res.cookie(cookieName, {
    expires: Date.now(),
  });
}

export function getCookie(req: Request, cookieName: string): string {
  return <string>req.signedCookies[cookieName];
}
