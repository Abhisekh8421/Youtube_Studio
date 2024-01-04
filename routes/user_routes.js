import express from "express";
import {
  ChangeCurrentPassword,
  RegisterUser,
  loginUser,
  logoutUser,
} from "../controllers/user_controller.js";
import { upload } from "../middlewares/multer_middleware.js";
import { isAuthenticated } from "../middlewares/user_auth.js";

const router = express.Router();

router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  RegisterUser
);

router.route("/login").post(loginUser);

router.route("/logout").get(isAuthenticated, logoutUser);

router.route("/refresh-token").post(RefreshAccessToken);

router.route("/passwordchange").post(ChangeCurrentPassword);

export default router;
