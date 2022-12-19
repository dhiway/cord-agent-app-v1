import express from "express";
import { Score as ScoreController } from "../controller/score";

const scoreRouter = express.Router({ mergeParams: true });


scoreRouter.get("/:id", async (req, res) => {
  return await ScoreController.show(req, res);
});

scoreRouter.post("/", async (req, res) => {
  return await ScoreController.entry(req, res);
});

export default scoreRouter;
