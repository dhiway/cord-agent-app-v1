import express from "express";
import { getConnection } from "typeorm";

import { Schema as SchemaCord } from "../cord/schema";
import { Schema as SchemaEntity } from "../entity/Schema";

export class Schema {
  public static async create(req: express.Request, res: express.Response) {
    const data = req.body;
    /* format */
    /*
    { options: {}, schema: { '$schema', '$metadata', '$id', title, description, properties, required }  }
    */

    /* only schema gets through the identifier part. */

    /* validation */
    /* TODO: any thing more? */
    if (!data.schema || !data.schema.title) {
      res.status(400).json({
        error: "'schema' is a required field, with title and description",
      });
      return;
    }

    try {
      const response = await SchemaCord.anchor(data.schema);
      if (response.schema) {
        /* success */
        const schema = new SchemaEntity();
        schema.title = data.schema.title;
        schema.identity = response.schema?.identifier?.replace(
          "schema:cord:",
          ""
        );
        schema.revoked = false;
        schema.content = JSON.stringify(data.schema);
        schema.cordSchema = JSON.stringify(response.schema);
        schema.cordBlock = response.block;

        getConnection().manager.save(schema);
        res.json({ result: "SUCCESS", schema: response.schema.identifier });
      } else {
        res.status(400).json({ error: response.error });
      }
    } catch (err) {
      res.status(500).json({ error: err });
    }
  }

  public static async show(req: express.Request, res: express.Response) {
    try {
      const schema = await getConnection()
        .getRepository(SchemaEntity)
        .createQueryBuilder("schema")
        .where("schema.identity = :id", {
          id: req.params.id?.replace("schema:cord:", ""),
        })
        .getOne();
      res.json(schema);
    } catch (err) {
      res.status(500).json({ error: err });
    }
  }

  public static async index(req: express.Request, res: express.Response) {
    try {
      const schemas = await getConnection()
        .getRepository(SchemaEntity)
        .createQueryBuilder("schema")
        .getMany();

      res.json(schemas);
    } catch (err) {
      res.status(500).json({ error: err });
    }
  }

  public static async revoke(req: express.Request, res: express.Response) {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(404).json({ error: "'id' is a required parameter" });
        return;
      }
      const schema = await getConnection()
        .getRepository(SchemaEntity)
        .createQueryBuilder("schema")
        .where("schema.identity = :id", {
          id: req.params.id?.replace("schema:cord:", ""),
        })

        .getOne();

      if (!schema) {
        res.status(404).json({ error: "no schema found for the id" });
        return;
      }

      let { cordSchema } = schema;
      cordSchema = JSON.parse(cordSchema);

      const response = await SchemaCord.revoke(cordSchema);
      if (response.block) {
        schema.revoked = true;
        getConnection().manager.save(schema);

        res.json({ result: "SUCCESS", record: id, block: response.block });
      } else {
        res.status(500).json({ error: response.error });
      }
    } catch (err) {
      res.status(500).json({ error: err });
    }
  }
}
