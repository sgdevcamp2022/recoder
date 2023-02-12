import express from "express";
import testService from "../service/testService.js";

const router = express.Router();
router.get("/", (req, res) => {
  const message = testService.testFunction();
  res.send(message);
});

export default router;
