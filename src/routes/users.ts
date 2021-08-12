import mongoose from "mongoose";
import { Request, Response } from "express";
import { IUser, IUserModel } from "../../types/users";
import { getCookie } from "../cookies.js";
import {
  privilegedUserRequiredMsg,
  usernameRequiredMsg,
  notEnoughPrivilegeMsg,
  userNotFoundMsg,
  usernamePasswordAndPrivilegeRequiredMsg,
  userIdRequiredMsg,
  usernameTakenMsg,
} from "../msg.js";
import {
  getAccessTokenCookieName,
  getOpenRegistration,
  verifyAccessToken,
} from "../tokens.js";

const User = <IUserModel>mongoose.model("user");

/* Check req headers and return the corresponding user */
export async function getPrivilegedUser(req: Request): Promise<IUser | null> {
  const accessToken = getCookie(req, getAccessTokenCookieName());
  const user = await verifyAccessToken(accessToken);
  if (!user) return null;
  return user;
}

/* List all users */
export async function getUsers(req: Request, res: Response): Promise<void> {
  const privilegedUser = await getPrivilegedUser(req);
  if (!privilegedUser) {
    res.status(403).json(privilegedUserRequiredMsg);
    return;
  }
  const users = await User.find();
  res.json(users);
}

/* Get user by name */
export async function getUserByName(
  req: Request,
  res: Response
): Promise<void> {
  const username = req.params["username"];
  if (!username) {
    res.status(400).json(usernameRequiredMsg);
    return;
  }
  const privilegedUser = await getPrivilegedUser(req);
  if (!privilegedUser) {
    res.status(403).json(privilegedUserRequiredMsg);
    return;
  }
  if (!privilegedUser.allowedToGetUsers()) {
    res.status(403).json(notEnoughPrivilegeMsg);
    return;
  }
  const user = await User.findOne({ username });
  if (!user) {
    res.status(404).json(userNotFoundMsg);
    return;
  }
  res.json(user);
}

/* Register new user */
export async function addUser(req: Request, res: Response): Promise<void> {
  const { username = null, password = null, p = null } = { ...req.body };
  if (!username || !password || !p) {
    res.status(400).json(usernamePasswordAndPrivilegeRequiredMsg);
    return;
  }

  const privilegedUser = await getPrivilegedUser(req);
  if (getOpenRegistration()) {
    /**
     * 1. Anonymous cannot register users with p > 1
     * 2. Privileged users can only operate on lower p
     */
    if (
      (!privilegedUser && p > 1) ||
      (privilegedUser && p >= privilegedUser.p)
    ) {
      res.status(403).json(notEnoughPrivilegeMsg);
      return;
    }
  } else {
    if (!privilegedUser) {
      res.status(403).json(privilegedUserRequiredMsg);
      return;
    }
    if (privilegedUser.p <= p || !privilegedUser.allowedToAddUsers()) {
      res.status(403).json(notEnoughPrivilegeMsg);
      return;
    }
  }

  const newUser = await User.register(username, password, p);
  if (!newUser) {
    res.status(400).json("Username taken");
    return;
  }
  res.json(newUser.id);
}

/* Edit user */
export async function editUser(req: Request, res: Response): Promise<void> {
  const userId = req.params["userId"];
  const { username = null, password = null, p = null } = { ...req.body };
  if (!userId) {
    res.status(400).json(userIdRequiredMsg);
    return;
  }
  const privilegedUser = await getPrivilegedUser(req);
  if (!privilegedUser) {
    res.status(403).json(privilegedUserRequiredMsg);
    return;
  }
  if (
    !privilegedUser.allowedToEditUsers() ||
    (p !== null && privilegedUser.p <= p)
  ) {
    res.status(403).json(notEnoughPrivilegeMsg);
    return;
  }
  const user = await User.findById(userId);
  if (!user) {
    res.status(404).json(userNotFoundMsg);
    return;
  }
  if (await User.usernameTaken(username)) {
    res.status(400).json(usernameTakenMsg);
    return;
  }
  username && (user.username = username);
  password && (await user.setNewPassword(password));
  p && (user.p = p);
  await user.save();
  res.sendStatus(200);
}

/* Remove user */
export async function removeUser(req: Request, res: Response): Promise<void> {
  const userId = req.params["userId"];
  if (!userId) {
    res.status(400).json(userIdRequiredMsg);
    return;
  }
  const privilegedUser = await getPrivilegedUser(req);
  if (!privilegedUser) {
    res.status(403).json(privilegedUserRequiredMsg);
    return;
  }
  const user = await User.findById(userId);
  if (!user) {
    res.status(404).json(userNotFoundMsg);
    return;
  }
  if (privilegedUser.p <= user.p) {
    res.status(403).json(notEnoughPrivilegeMsg);
    return;
  }
  await User.findByIdAndDelete(userId);
  res.sendStatus(200);
}
