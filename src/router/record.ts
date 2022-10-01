import express from "express";
import { upload } from "../storage";
import { Record as RecordController } from "../controller/record";

const recordRouter = express.Router({ mergeParams: true });

recordRouter.get("/", async (req, res) => {
  return await RecordController.index(req, res);
});

recordRouter.get("/:id", async (req, res) => {
  return await RecordController.show(req, res);
});

recordRouter.delete("/:id", async (req, res) => {
  return await RecordController.delete(req, res);
});

recordRouter.post("/", upload.any(), async (req, res) => {
  return await RecordController.create(req, res);
});

recordRouter.post("/:id/issue", async (req, res) => {
  return await RecordController.commit(req, res);
});

recordRouter.put("/:id", upload.any(), async (req, res) => {
  return await RecordController.update(req, res);
});

recordRouter.post("/:id/revoke", async (req, res) => {
  return await RecordController.revoke(req, res);
});

export default recordRouter;
