import { Router } from "express";
const kakaoRouter = Router();
import passport from "passport";
const { use, authenticate, serializeUser, deserializeUser } = passport;
import { join } from "path";
import { Strategy as KakaoStrategy } from "passport-kakao";
import { config } from "dotenv";
import path from "path";
const __dirname = path.resolve();
import Kakao from "../models/kakaoModel.js";
config({ path: join(__dirname, "../.env") });

passport.use(
  "kakao",
  new KakaoStrategy(
    {
      clientID: process.env.KAKAO_RESTAPI_KEY,
      callbackURL: process.env.KAKAO_CALLBACK_URL,
      clientSecret: process.env.KAKAO_SECRET_KEY,
    },
    async (accessToken, refreshToken, profile, done) => {
      console.log("kakao profile", profile);
      console.log(accessToken);
      console.log(refreshToken);
      try {
        const exUser = await Kakao.findOne({
          userId: profile.id,
          provider: "kakao",
        });
        if (exUser) {
          done(null, exUser);
        } else {
          const newUser = await Kakao.create({
            nickname: profile.displayName,
            userId: profile.id,
            provider: "kakao",
            refresh_token: refreshToken,
          });
          done(null, newUser);
        }
      } catch (error) {
        console.log(error);
      }
    }
  )
);

passport.serializeUser(function (user, done) {
  done(null, user);
});
passport.deserializeUser(function (user, done) {
  done(null, user);
});

export default kakaoRouter;
