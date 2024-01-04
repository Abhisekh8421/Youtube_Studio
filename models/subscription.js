import mongoose, { Schema } from "mongoose";

const subscriptionSchema = new Schema(
  {
    Subscriber: {
      typeof: Schema.Types.ObjectId, //one who is subscribing
      ref: "User",
    },
    Channel: {
      typeof: Schema.Types.ObjectId, //one to whom subscriber  is subscribing
      ref: "User",
    },
  },
  { timestamps: true }
);

export const Subscription = mongoose.model("Subscription", subscriptionSchema);
