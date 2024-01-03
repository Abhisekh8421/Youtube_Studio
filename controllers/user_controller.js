import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user_model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponce } from "../utils/ApiResponce.js";

const generateaccesstokenAndrefreshtoken = async (userid) => {
  try {
    const user = User.findById(userid);
    if (!user) {
      throw new ApiError(404, "User Does Not Exist");
    }
    const accessToken = user.generateaccesstoken();
    const refreshToken = user.generaterefreshtoken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
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

  const avatarlocalpath = req.files?.avatar[0]?.path;

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
