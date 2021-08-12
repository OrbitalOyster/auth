import mongoose from "mongoose";
import { IRefreshToken, IRefreshTokenModel } from "../../types/tokens";

/* Schema */
const refreshTokenSchema = new mongoose.Schema<IRefreshToken>({
  content: { type: String, required: true, unique: true },
});

/* Model */
mongoose.model<IRefreshToken, IRefreshTokenModel>(
  "refreshToken",
  refreshTokenSchema
);
