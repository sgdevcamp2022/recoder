import express from "express";
import userController from "./userController.js";

const router = express.Router();
router.post("/user/register", userController.register);
router.post("/user/login", userController.login);
router.post("/user/auth", userController.userAuth);
router.post("/user/delete", userController.deleteUser);

router.get("/users", userController.verifyJWT, userController.findUsersById);

export default router;
