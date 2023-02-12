import express from "express";
import userController from "./userController.js";

const router = express.Router();
router.post("/user/register", userController.register);
router.post("/user/login", userController.login);
router.post("/user/update", userController.update);
router.post("/user/delete", userController.remove);

export default router;
