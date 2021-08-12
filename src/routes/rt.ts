import mongoose from "mongoose";
import { Request, Response } from "express";
import { setCookie } from "../cookies.js";
import { userAndPasswordRequiredMsg, userNotFoundMsg } from "../msg.js";
import {
  generateRefreshToken,
  getRefreshTokenCookieName,
  getRefreshTokenExpireTime,
} from "../tokens.js";
import { IUserModel } from "../../types/users";

const User = <IUserModel>mongoose.model("user");

/* Login request */
export default async function (req: Request, res: Response): Promise<void> {
  const { username = null, password = null } = { ...req.body };
  if (!username || !password) {
    res.status(400).json(userAndPasswordRequiredMsg);
    return;
  }
  const user = await User.findOne({ username });
  if (!user || !(await user.checkPassword(password))) {
    res.status(404).json(userNotFoundMsg);
    return;
  }
  const newRefreshToken = await generateRefreshToken(user);
  setCookie(
    res,
    getRefreshTokenCookieName(),
    newRefreshToken,
    new Date(Date.now() + getRefreshTokenExpireTime())
  );
  res.sendStatus(200);
}
