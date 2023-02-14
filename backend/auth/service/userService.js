import { verify } from "jsonwebtoken";
import bcrypt from "bcrypt";
import jsonwebtoken from "jsonwebtoken";
import Users from "../models/userModel.js";
import MailService from "../service/mailService.js";
import Auth from "../models/authModel.js";

const { sign } = jsonwebtoken;

const userService = {
  async create(username, password, email) {
    const encodedPassword = await bcrypt.hash(password, 10);
    const newUser = new Users({
      username,
      email,
      password: encodedPassword,
      role: 0,
    });
    const createdUser = await Users.create(newUser);
    return createdUser;
  },
  async createAuthNumber(email) {
    const verifyNumber = Math.floor(Math.random() * 888888) + 111111;
    const createdAuth = await Auth.create(new Auth({ email, verifyNumber }));
    console.log("userCreated: " + email + "/" + createdAuth);
    return verifyNumber;
  },
  async verify(email) {
    const updatedUser = await Users.updateMany({ email }, { verfield: true });
    console.log("user verified :", updatedUser);
  },
  async remove(email) {
    let Userscheck = await Users.findOne().where("email").equals(email);
    if (!Userscheck) return false;
    else {
      Users.remove(Userscheck).then(() => {});
      await Auth.remove({ email });
      await Auth.find({ email });
    }
    return true;
  },
};

export default userService;
