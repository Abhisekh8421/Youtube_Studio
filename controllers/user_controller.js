import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user_model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponce } from "../utils/ApiResponce.js";

const generateaccesstokenAndrefreshtoken = async (userid) => {
  try {
    const user = await User.findById(userid);
    if (!user) {
      throw new ApiError(404, "User Does Not Exist");
    }
    const accessToken = user.generateaccesstoken();
    const refreshToken = user.generaterefreshtoken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    console.log("errro", error.message);
    throw new ApiError(500, "something went wrong in the tokens");
  }
};

export const RegisterUser = asyncHandler(async (req, res) => {
  //steps defined by {Abhisekhsuru-Creator}
  //get the details from the user
  //validate the details - not empty
  //check if user already exists or not
  //check for images,check for avatar
  //upload them to cloudinary , avatar
  //create the user object - create the entry in db
  //remove password and refresh token from response
  //check for user creation
  //return res

  const { username, email, fullName, password } = req.body;
  // console.log("email:", email); for check is it working or not
  if (
    [username, email, fullName, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All Fields are required");
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (existedUser) {
    return res.status(400).json({
      success: false,
      message: "User already exists ",
    });
    // throw new ApiError(400, "User already Existed ");
  }

  const avatarlocalpath = req.files?.avatar?.[0]?.path;

  // const coverImagelocalpath = req.files?.coverImage[0]?.path;
  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  console.log("avatar local path:", avatarlocalpath);

  if (!avatarlocalpath) {
    // console.error("req.files structure:", req.files);
    throw new ApiError(400, "Avatar local path is required");
  }
  // Upload avatar to Cloudinary
  const avatar = await uploadOnCloudinary(avatarlocalpath);
  console.log("avatar cloudinary:", avatar);

  console.log(process.env.CLOUDINARY_API_KEY);

  if (!avatar) {
    throw new ApiError(400, "Error uploading avatar to Cloudinary");
  }

  // Upload cover image to Cloudinary
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);
  console.log("cover image cloudinary:", coverImage);

  const user = await User.create({
    username,
    avatar: avatar?.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    fullName,
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "something went wrong while registration");
  }
  return res
    .status(201)
    .json(new ApiResponce(201, createdUser, "User Registered Successfully"));
});

export const loginUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;
  if (!email) {
    throw new ApiError(400, "email is required so please enter ");
  }

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(404, "user doesnot exist");
  }

  const isPasswordValid = await user.isPasswordcorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "invalid user credentials");
  }

  const { accessToken, refreshToken } =
    await generateaccesstokenAndrefreshtoken(user._id);

  const loggedUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponce(
        200,
        {
          user: loggedUser,
          accessToken,
          refreshToken, //data parameter in the api responce method
        },
        "user logged in successfully"
      )
    );
});

export const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponce(200, {}, "user Logged out"));
});

export const RefreshAccessToken = asyncHandler(async (req, res) => {
  try {
    const incomingRefreshToken =
      req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
      throw new ApiError(401, "Unauthorized Request");
    }

    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESHTOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id); // If the token is valid, it fetches the corresponding user from the database.
    if (!user) {
      throw new ApiError(401, "Invalid Token"); //If the user is not found, it throws an invalid token error.
    }

    if (incomingRefreshToken !== user.refreshToken) {
      // Checks if the incoming refresh token matches the stored refresh token for the user.
      throw new ApiError(401, " refresh Token Expired or used");
    }

    const { accessToken, newRefreshToken } =
      await generateaccesstokenAndrefreshtoken(user._id);

    const options = {
      httpOnly: true,
      secure: true,
    };

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          {
            accessToken,
            refreshToken: newRefreshToken,
          },
          "Access Token Refreshed successfully"
        )
      );
  } catch (error) {
    // console.log("error is ", error.message); debugging purpose
    throw new ApiError(401, error?.message || "something went wrong");
  }
});

export const ChangeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldpassword, newpassword, confirmpassword } = req.body;
  if (!(newpassword === confirmpassword)) {
    throw new ApiError(401, "password is incorrect");
  }
  const user = await User.findById(req.user._id);

  const passwordcheck = await user.isPasswordcorrect(oldpassword);
  if (!passwordcheck) {
    throw new ApiError(401, "invalid User Old Password");
  }
  user.password = newpassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponce(200, {}, "Successfully Password Changed"));
});

export const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponce(200, req.user, "successfully user feteched"));
});

export const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullname, email } = req.body;
  if (!fullname || !email) {
    throw new ApiError(401, "All fields are required");
  }
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        fullname,
        email,
      },
    },
    {
      new: true,
    }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponce(200, user, "successfully updated user details"));
});

export const updateUserAvatar = asyncHandler(async (req, res) => {
  //retrieve the user avatar from database
  const currentUser = await User.findById(req.user._id);
  //store the previous avatar image into one variable
  const previousAvatarUrl = currentUser.avatar;

  const userAvatar = req.file?.path;
  if (!userAvatar) {
    throw new ApiError(400, "avatar file missing");
  }
  const avatar = await uploadOnCloudinary(userAvatar);
  if (!avatar.url) {
    throw new ApiError(400, "Error uploading avatar to Cloudinary");
  }

  //delete the previous avatar image from cloudinary
  if (previousAvatarUrl) {
    const publicId = getPublicIdFromUrl(previousAvatarUrl);
    await deleteFromCloudinary(publicId);
  }
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        avatar: avatar.url,
      },
    },
    {
      new: true,
    }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponce(200, user, "successfully updated userAvatar"));
});

export const updateUserCoverImage = asyncHandler(async (req, res) => {
  const userCoverImage = req.file?.path;
  if (!userCoverImage) {
    throw new ApiError(400, "coverImage file missing");
  }
  const coverImage = await uploadOnCloudinary(userCoverImage);
  if (!coverImage.url) {
    throw new ApiError(400, "Error uploading coverImage to Cloudinary");
  }
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        coverImage: coverImage.url,
      },
    },
    {
      new: true,
    }
  );

  return res
    .status(200)
    .json(new ApiResponce(200, user, "successfully updated userCoverImage "));
});

export const getUserChannelprofile = asyncHandler(async (req, res) => {
  const { username } = req.params;
  if (!username?.trim()) {
    throw new ApiError(400, "Username is missing");
  }
  const channel = await User.aggregate([
    {
      $match: {
        username: username?.tolowercase(),
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "Subscriber",
        as: "subscribeTo",
      },
    },
    {
      $addFields: {
        subscribersCount: {
          $size: "$subscribers",
        },
        channelSubscribedTocount: {
          $size: "$subscribeTo",
        },
        isSubscribed: {
          $cond: {
            if: { $in: [req.user?._id, "$subscribers.subscriber"] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        fullName: 1,
        username: 1,
        subscribersCount: 1,
        channelSubscribedTocount: 1,
        isSubscribed: 1,
        avatar: 1,
        coverImage: 1,
        email: 1,
      },
    },
  ]);
  if (!channel) {
    throw new ApiError(404, "Channel is notfound");
  }
});
