import express from "express";
import { upload } from "../storage";
import { Record as RecordController } from "../controller/record";

const verifyRouter = express.Router({ mergeParams: true });

verifyRouter.post("/cord-vc", async (req, res) => {
  return await RecordController.verify(req, res);
});

verifyRouter.post("/cord-vp", async (req, res) => {
  return await RecordController.verifyVp(req, res);
});

verifyRouter.post("/vc", async (req, res) => {
  return await RecordController.verifyVc(req, res);
});

export default verifyRouter;
