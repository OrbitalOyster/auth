import { Router } from "express";

/* Routes */
import pk from "./pk.js";
import rt from "./rt.js";
import at from "./at.js";
import lo from "./lo.js";
import {
  getUsers,
  getUserByName,
  addUser,
  editUser,
  removeUser,
} from "./users.js";

const router = Router();

/* Get public key */
router.get("/pk", pk);
/* Get refresh token (log in) */
router.post("/rt", rt);
/* Get access token */
router.get("/at", at);
/* Remove refresh token from DB (log out) */
router.post("/lo", lo);
/* User operations */
router.get("/users", getUsers);
router.get("/users/:username", getUserByName);
router.post("/users", addUser);
router.patch("/users/:userId", editUser);
router.delete("/users/:userId", removeUser);

export default router;
