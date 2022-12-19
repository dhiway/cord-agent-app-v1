import express from "express";
import { upload } from "../storage";
import { Record as RecordController } from "../controller/record";

const verifyRouter = express.Router({ mergeParams: true });

verifyRouter.post("/", async (req, res) => {
  return await RecordController.verify(req, res);
});

export default verifyRouter;
