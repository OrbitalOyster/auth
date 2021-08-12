import { Model, Document } from "mongoose";

export type IRefreshTokenModel = Model<IRefreshToken, IRefreshTokenModel>;

export interface IRefreshToken extends Document {
  content: string;
}
