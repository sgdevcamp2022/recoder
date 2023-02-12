import express from "express";
import router from "./controller/index.js";
import mongoose from "mongoose";
import bodyParser from "body-parser";

const app = express();
app.use(bodyParser.json());
app.use("/", router);
const PORT = process.env.PORT || 8001;

app.listen(PORT, async () => {
  console.log(`✅ server running on > http://localhost:${PORT}`);

  mongoose.set("strictQuery", false);
  mongoose.connect("mongodb://localhost:27017/recoder", function (err, db) {
    if (err) console.log(err);
    else {
      console.log(`✅ db successfully connected  > ${db}`);
    }
  });
});
