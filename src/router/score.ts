import express from "express";
import { Score as ScoreController } from "../controller/score";

const scoreRouter = express.Router({ mergeParams: true });

// Get the details of the identifier from Agent DB
scoreRouter.get("/:id", async (req, res) => {
  return await ScoreController.show(req, res);
});

// Get details of the entity from the chain
scoreRouter.get("/entity/:entity", async (req, res) => {
  console.log("entity", req.params.entity);
  return await ScoreController.showEntity(req, res);
});

// Add entry of the score transaction on the ledger
scoreRouter.post("/", async (req, res) => {
  return await ScoreController.entry(req, res);
});

export default scoreRouter;
