import express from "express";
import router from "./controller/testController.js";

const app = express();

app.use("*", router);
const PORT = process.env.PORT || 8001;
app.listen(PORT, async () => {
  console.log(`✅ server running on > http://localhost:${PORT}`);
});
