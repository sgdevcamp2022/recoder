import { verify } from "jsonwebtoken";
import bcrypt from "bcrypt";
import jsonwebtoken from "jsonwebtoken";
import Users from "../models/userModel.js";
import MailService from "../service/mailService.js";
import userService from "../service/userService.js";
import Auth from "../models/authModel.js";

const { sign } = jsonwebtoken;

const UsersController = {
  async findUsersById(req, res) {
    const user = await Users.findById(req.UsersId);
    return res.json(user);
  },
  async register(req, res) {
    try {
      const { username, password, email } = req.body;
      let Userscheck = await Users.findOne().where("email").equals(email);
      if (Userscheck)
        return res.status(400).json({ error: "wrong Usersname or password" });
      else {
        const verifyNumber = await userService.createAuthNumber(email);
        userService.create(username, password, email);
        MailService.sendMail(email, verifyNumber);
      }
      return res.json("Registred");
    } catch (err) {
      res.status(500).send({ err: err, message: "user creation failed" });
    }
  },
  async userAuth(req, res) {
    try {
      const { email, authNumber } = req.body;
      let Userscheck = await Auth.findOne().where("email").equals(email);
      if (!Userscheck) return res.status(400).json({ error: "user not Exist" });
      else {
        if (Userscheck.verifyNumber == authNumber) {
          userService.verify(email);
        } else return res.send("wrong authNumber");
      }
      return res.json("verified");
    } catch (err) {
      res.status(500).send({ err: err, message: "user authentication failed" });
    }
  },
  async deleteUser(req, res) {
    const { email } = req.body;
    if (!userService.remove(email))
      return res.status(400).json({ error: "wrong email" });
    else return res.json("Deleted");
  },
  async login(req, res) {
    const { email, password } = req.body;
    let token = {};
    const Userscheck = await Users.findOne().where("email").equals(email);
    if (!Userscheck) return res.json({ error: "user not found" });
    if (!Userscheck.verfield) return res.json({ error: "user not allowed" });
    const match = await bcrypt.compare(password, Userscheck.password);

    if (!match) return res.json({ error: "wrong Usersname or password" });
    else {
      token = sign(
        { id: Userscheck._id },
        "jwtSecret",
        {
          expiresIn: "7 days",
        },
        { algorithm: "RS256" }
      );
      return res.json({ token });
    }
  },
  async renewtoken(req, res) {
    const { email } = req.body;
    const token = sign(
      { id: email },
      "jwtSecret",
      {
        expiresIn: "7 days",
      },
      { algorithm: "RS256" }
    );
    return res.json({ token });
  },
  async verifyJWT(req, res, next) {
    var token = req.headers["token"];
    if (!token)
      return res
        .status(401)
        .send({ auth: false, message: "No token provided." });

    verify(token, process.env.JWTSECRET, function (err, decoded) {
      if (err)
        return res
          .status(500)
          .send({ auth: false, message: "Failed to authenticate token." });

      req.UsersId = decoded.id;
      next();
    });
  },
};

export default UsersController;
