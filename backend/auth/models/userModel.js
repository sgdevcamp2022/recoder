import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    maxlength: 50,
  },
  password: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  role: {
    type: Number,
    required: true,
    default: 0,
  },
  verfield: {
    type: Boolean,
    default: false,
  },
});

const Users = mongoose.model("Users", UserSchema);

export default Users;
