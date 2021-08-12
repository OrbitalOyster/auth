import mongoose from "mongoose";
import fs from "fs";
import jwt, { SignOptions } from "jsonwebtoken";
import { IUser, IUserModel } from "../types/users";
import { IRefreshTokenModel } from "../types/tokens";
import { setCollectionToExpire } from "@orbitaloyster/mongo";

const User = <IUserModel>mongoose.model("user");
const RefreshToken = <IRefreshTokenModel>mongoose.model("refreshToken");

const pathToPrivateKey = "keys/jwtRS256.key";
const pathToPublicKey = "keys/jwtRS256.key.pub";
let privateKey: string;
let publicKey: string;

let refreshTokenCookieName: string;
let accessTokenCookieName: string;
let accessTokenExpireTime: number;
let refreshTokenExpireTime: number;

let openRegistration: boolean;

const accessTokenOptions: SignOptions = {
  algorithm: "RS256",
  expiresIn: "0s",
  noTimestamp: true,
};

export async function init(
  newRefreshTokenCookieName: string,
  newAccessTokenCookieName: string,
  newAccessTokenExpireTime: number,
  newRefreshTokenExpireTime: number,
  newOpenRegistration: boolean
): Promise<void> {
  /* Get keys */
  privateKey = fs.readFileSync(pathToPrivateKey).toString();
  publicKey = fs.readFileSync(pathToPublicKey).toString();
  /* Set cookie names */
  refreshTokenCookieName = newRefreshTokenCookieName;
  accessTokenCookieName = newAccessTokenCookieName;
  /* Set expiration times */
  accessTokenExpireTime = newAccessTokenExpireTime;
  refreshTokenExpireTime = newRefreshTokenExpireTime;
  accessTokenOptions.expiresIn = accessTokenExpireTime + "s";
  /* Registration */
  openRegistration = newOpenRegistration;
  /* Set expiration */
  await setCollectionToExpire(RefreshToken.collection, refreshTokenExpireTime);
}

export function getPublicKey(): string {
  return publicKey;
}

export function generateAccessToken(user: IUser): string {
  const userId = user.id;
  const username = user.username;
  const p = user.p;
  return jwt.sign({ userId, username, p }, privateKey, accessTokenOptions);
}

export function verifyAccessToken(token: string): Promise<IUser | null> {
  return new Promise((resolve) => {
    jwt.verify(token, publicKey, async (err, decoded) => {
      /* Unable to decode */
      if (err || !decoded) {
        resolve(null);
        return;
      }
      const userId = <string>(<never>decoded)["userId"];
      const user = await User.findById(userId);
      resolve(user || null);
    });
  });
}

export async function generateRefreshToken(user: IUser): Promise<string> {
  const userId = user.id;
  const content = jwt.sign({ userId }, privateKey, {
    algorithm: "RS256",
  });
  const newRefreshToken = new RefreshToken({ content });
  await newRefreshToken.save();
  return content;
}

export async function verifyRefreshToken(token: string): Promise<IUser | null> {
  const found = await RefreshToken.findOne({ content: token });
  if (!found) return null;
  return new Promise((resolve) => {
    jwt.verify(found.content, publicKey, async (err, decoded) => {
      /* Unable to decode */
      if (err || !decoded)
        throw Error("Unable to decode refresh token:\n" + found.content);
      const userId = <string>(<never>decoded)["userId"];
      const user = await User.findById(userId);
      resolve(user || null);
    });
  });
}

export async function removeRefreshToken(content: string): Promise<boolean> {
  const removed = await RefreshToken.findOneAndDelete({ content });
  return !!removed;
}

export function getRefreshTokenCookieName(): string {
  return refreshTokenCookieName;
}

export function getAccessTokenCookieName(): string {
  return accessTokenCookieName;
}

export function getAccessTokenExpireTime(): number {
  return accessTokenExpireTime;
}

export function getRefreshTokenExpireTime(): number {
  return refreshTokenExpireTime;
}

export function getOpenRegistration(): boolean {
  return openRegistration;
}
