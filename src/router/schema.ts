import express from "express";
import { Schema as SchemaController } from "../controller/schema";

const schemaRouter = express.Router({ mergeParams: true });

schemaRouter.get("/", async (req, res) => {
  return await SchemaController.index(req, res);
});

schemaRouter.get("/:id", async (req, res) => {
  return await SchemaController.show(req, res);
});

schemaRouter.post("/", async (req, res) => {
  return await SchemaController.create(req, res);
});

schemaRouter.post("/:id/revoke", async (req, res) => {
  return await SchemaController.revoke(req, res);
});

export default schemaRouter;
