import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user_model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponce } from "../utils/ApiResponce.js";

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
