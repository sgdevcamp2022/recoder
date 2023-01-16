import express from "express";
import router from "./controller/index.js";

const app = express();

app.use("*", router);
const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log(`✅ server running on > http://localhost:${PORT}`);
});
