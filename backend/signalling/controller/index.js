import testController from "./test_controller.js";
import express from "express";

const router = express.Router();
router.get("/", testController.getTest);

export default router;
