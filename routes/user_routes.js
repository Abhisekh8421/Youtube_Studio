import express from "express";
import {
  ChangeCurrentPassword,
  RegisterUser,
  getCurrentUser,
  getUserChannelprofile,
  getWatchHistory,
  loginUser,
  logoutUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
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

router.route("/passwordchange").post(isAuthenticated, ChangeCurrentPassword);

router.route("/currentUser").get(isAuthenticated, getCurrentUser);

router.route("/update-account").patch(isAuthenticated, updateAccountDetails);

router
  .route("/avatar")
  .patch(isAuthenticated, upload.single(" avatar"), updateUserAvatar);

router
  .route("/Coverimage")
  .patch(isAuthenticated, upload.single("coverImage"), updateUserCoverImage);

router.get("/c/:username", getUserChannelprofile);
router.get("/getwatchistory", isAuthenticated, getWatchHistory);

export default router;
