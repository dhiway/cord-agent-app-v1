import fs from "fs";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";

const STORAGE_DIR = "/tmp/cord-agent";

const upload = multer({
  dest: `${STORAGE_DIR}/uploads/`,
  limits: {
    fieldSize: 8 * 1024 * 1024,
  },
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = `${STORAGE_DIR}`;
    try {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
      }
    } catch (err) {
      console.log("MKDIR failed: ", err);
    }

    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, uuidv4().toString() + "_" + file.originalname.replace(" ", ""));
  },
});

const upload_bg = multer({ storage: storage });

export { upload, upload_bg };
