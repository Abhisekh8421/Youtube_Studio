import multer from "multer";
import path from "path";
// import {} from "../public";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public");
    // path.join(path.resolve(), "public")
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

export const upload = multer({
  storage,
});
