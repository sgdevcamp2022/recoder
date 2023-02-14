import { verify } from "jsonwebtoken";
import { hashSync, compareSync } from "bcrypt";
import jsonwebtoken from "jsonwebtoken";
import Users from "../models/userModel.js";
const { sign } = jsonwebtoken;

const UsersController = {
  async findUsersById(req, res) {
    const user = await Users.findById(req.UsersId);
    return res.json(user);
  },
  async register(req, res) {
    const { username, password, email } = req.body;
    let Userscheck = await Users.findOne().where("email").equals(email);
    if (Userscheck)
      return res.status(400).json({ error: "wrong Usersname or password" });
    else {
      const newUser = new Users({
        username,
        password: hashSync(password, 10),
        email,
        role: 0,
      });
      Users.create(newUser);
    }
    return res.json("Registred");
  },
  async update(req, res) {
    const { username, password, email } = req.body;

    let Userscheck = await Users.findOne().where("email").equals(email);
    if (!Userscheck)
      return res.status(400).json({ error: "wrong Usersname or password" });
    else {
      const UsersUpdate = new Users({
        username,
        password: hashSync(password, 10),
        email,
        role: 0,
      });
      Users.update(UsersUpdate);
    }
    return res.json("Updated");
  },
  async remove(req, res) {
    const { email } = req.body;

    let Userscheck = await Users.findOne().where("email").equals(email);
    if (!Userscheck) return res.status(400).json({ error: "wrong email" });
    else Users.remove(Userscheck).then(() => {});
    return res.json("Deleted");
  },
  async login(req, res) {
    const { email, password } = req.body;
    let Userscheck = await Users.findOne().where("email").equals(email);
    const match = compareSync(password, Userscheck.password);
    let token = {};
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