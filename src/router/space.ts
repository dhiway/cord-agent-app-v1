import express from "express";
import { Space as SpaceController } from "../controller/space";

const spaceRouter = express.Router({ mergeParams: true });

spaceRouter.get("/", async (req, res) => {
  return await SpaceController.index(req, res);
});

spaceRouter.get("/:id", async (req, res) => {
  return await SpaceController.show(req, res);
});

spaceRouter.post("/", async (req, res) => {
  return await SpaceController.create(req, res);
});

export default spaceRouter;
