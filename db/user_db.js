import mongoose from "mongoose";
export const connectdb = async () => {
  await mongoose
    .connect(process.env.MONGO_URL, {
      dbName: process.env.DB_NAME,
    })
    .then(() => console.log("database is connected"))
    .catch((e) => {
      console.log("database connection failed", e);
    });
};
