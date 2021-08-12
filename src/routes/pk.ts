import { Request, Response } from "express";
import { getPublicKey } from "../tokens.js";

/* Get public key */
export default function (_req: Request, res: Response): void {
  res.send(getPublicKey());
}
