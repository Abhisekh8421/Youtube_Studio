import express from "express";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectdb } from "./db/user_db.js";
import userRouter from "./routes/user_routes.js";

//Database Connection
connectdb();

const app = express();

//must be included before routes

app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

//Routes ****
app.use("/api/v1/users", userRouter);

app.use(
  cors({
    origin: process.env.ORIGIN_URL,
    credentials: true,
    methods: ["get", "post", "delete", "put"],
  })
);

//Middlewares

app.get("/", (req, res) => {
  res.send("working perfectly");
});

app.listen(process.env.PORT, () => {
  console.log(`⚡ server is started at port : ${process.env.PORT}`);
});
