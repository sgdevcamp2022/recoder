import express from "express";
import userController from "./userController.js";
import passport from "passport";
import authRouter from "./kakaoController.js";

const router = express.Router();
router.post("/user/register", userController.register);
router.post("/user/login", userController.login);
router.post("/user/auth", userController.userAuth);
router.post("/user/delete", userController.deleteUser);

router.get("/users", userController.verifyJWT, userController.findUsersById);

router.get("/kakao", passport.authenticate("kakao"));

router.get("/kakao/callback", passport.authenticate("kakao"), (req, res) => {
  res.redirect("/");
});

export default router;
