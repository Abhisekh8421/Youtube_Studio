import mongoose, { Schema } from "mongoose";
import aggregatemongoose from "mongoose-aggregate-paginate-v2";

const videoSchema = new mongoose.Schema(
  {
    videofile: {
      type: String, //cloudinary file
      required: true,
    },
    thumbnail: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

videoSchema.plugin(aggregatemongoose);

export const Video = mongoose.model("Video", videoSchema);
