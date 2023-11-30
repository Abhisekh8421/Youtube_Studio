import express from "express";
import { RegisterUser } from "../controllers/user_controller.js";
import { upload } from "../middlewares/multer_middleware.js";

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

export default router;
