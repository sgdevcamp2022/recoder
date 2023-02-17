import mongoose, { model } from "mongoose";

const { Schema } = mongoose;
const KakaoSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    nickname: {
      type: String,
      required: true,
    },
    password: {
      type: String,
    },
    provider: {
      type: String,
    },
    refresh_token: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export default model("Kakao", KakaoSchema);
