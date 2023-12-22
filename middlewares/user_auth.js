import { User } from "../models/user_model";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";

import jwt from "jsonwebtoken";

export const isAuthenticated = asyncHandler(async (req, _, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("bearer ", "");

    if (!token) {
      throw new ApiError(401, "Unauthorized request");
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET); //it will give you the basic user credientials 

    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken"  // when we retrieve the user document it comes without password and refresh token
    );

    if (!user) {
      throw new ApiError(401, "Invalid Token");
    }

    req.user = user;

    next(); // sent the req.user data to next controller
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid User Token");
  }
});
