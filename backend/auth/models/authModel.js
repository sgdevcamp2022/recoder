import mongoose from "mongoose";

const AuthModel = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  verifyNumber: {
    type: Number,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Auth = mongoose.model("Auth", AuthModel);

export default Auth;
