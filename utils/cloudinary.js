import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: "ds4z1p9c8",
  api_key: "699777772934381",
  api_secret: "Ey9rv2Re9rvpU7QRq_Q4235df7I",
});

export const uploadOnCloudinary = async (localpath) => {
  try {
    if (!localpath) return null;
    const response = await cloudinary.uploader.upload(localpath, {
      resource_type: "auto",
    });
    // console.log("Uploaded successfully:", response);
    fs.unlinkSync(localpath);
    return response;
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    fs.unlinkSync(localpath);
    return null;
  }
};
