import express from "express";
import { getConnection } from "typeorm";

import { Stream as StreamCord } from "../cord/stream";
import { Record as RecordEntity } from "../entity/Record";
import { Schema as SchemaEntity } from "../entity/Schema";

export class Record {
  public static async create(req: express.Request, res: express.Response) {
    const data = req.body;
    /* format */
    /*
    {
      options: {},
      space: "space:cord:4...",
      schema: "schema:cord:5...",
      content: {
       // fields validated against schema here
      },
      holder?: ...,
    }
    */

    /* only schema gets through the identifier part. */

    /* validation */
    /* TODO: any thing more? */
    if (!data.content || !data.title) {
      res.status(400).json({
        error: "'content' and 'title' are required fields",
      });
      return;
    }

    if (!data.schema) {
      res.status(400).json({ error: "schema is a required option" });
      return;
    }

    let schema: any = {};
    try {
      let dbschema = await getConnection()
        .getRepository(SchemaEntity)
        .createQueryBuilder("schema")
        .where("schema.identity = :id", {
          id: data.schema?.replace("schema:cord:", ""),
        })
        .getOne();

      if (!dbschema) {
        res.status(400).json({ error: "schema identifier not found" });
        return;
      }
      schema = dbschema.cordSchema ? JSON.parse(dbschema.cordSchema) : {};
    } catch (err) {
      res.status(500).json({ error: err });
      return;
    }

    const anchor = data.anchor === undefined ? true : !!data.anchor;

    try {
      const spaceId = req.params.spaceId.includes("space:cord:")
        ? req.params.spaceId
        : `space:cord:${req.params.spaceId}`;

      const response: any = await StreamCord.buildAndAnchor(
        spaceId,
        schema,
        data.content,
        null,
        anchor
      );

      if (response.stream) {
        /* success */
        let record = new RecordEntity();
        record.latest = true;
        record.revoked = false;
        record.title = data.title;
        record.identity = response.stream.identifier;
        record.content = JSON.stringify(data.content);
        record.cordStreamContent = JSON.stringify(response.contentstream);
        record.cordStream = JSON.stringify(response.stream);

        let vc: any = {};

        if (anchor) {
          record.active = true;
          record.cordBlock = response.block ?? "";
          record.credential = response.credential
            ? JSON.stringify(response.credential)
            : "";
          record.vc = response.vc ? JSON.stringify(response.vc) : "";
          vc = response.vc;
        } else {
          record.active = false;
        }

        await getConnection().manager.save(record);
        res.json({ result: "SUCCESS", stream: response.stream, vc: vc });
      } else {
        res.status(400).json({
          error: response.error,
        });
      }
    } catch (err) {
      res.status(500).json({ error: err });
    }
  }

  public static async show(req: express.Request, res: express.Response) {
    try {
      const record = await getConnection()
        .getRepository(RecordEntity)
        .createQueryBuilder("record")
        .where("record.identity = :id", { id: req.params.id })
        .andWhere("record.latest = :latest", { latest: true })
        .getOne();

      res.json(record);
    } catch (err) {
      res.status(500).json({ error: err });
    }
  }

  public static async index(req: express.Request, res: express.Response) {
    try {
      const schemas = await getConnection()
        .getRepository(SchemaEntity)
        .createQueryBuilder("schema")
        .where("record.latest = :latest", { latest: true })
        .where("record.revoked = :revoked", { revoked: false })
        .getMany();

      res.json(schemas);
    } catch (err) {
      res.status(500).json({ error: err });
    }
  }

  public static async revoke(req: express.Request, res: express.Response) {
    try {
      const record = await getConnection()
        .getRepository(RecordEntity)
        .createQueryBuilder("record")
        .where("record.identity = :id", { id: req.params.id })
        .andWhere("record.latest = :latest", { latest: true })
        .getOne();

      if (!record) {
        res.status(404).json({ error: "no record found for the identifier" });
        return;
      }

      const stream = JSON.parse(record.cordStream);
      const response = await StreamCord.revoke(stream);

      if (response.block) {
        record.revoked = true;
        getConnection().manager.save(record);

        res.json({
          result: "SUCCESS",
          record: req.params.id,
          block: response.block,
        });
      } else {
        res.status(500).json({ error: response.error });
      }
    } catch (err) {
      res.status(500).json({ error: err });
    }
  }

  public static async commit(req: express.Request, res: express.Response) {
    try {
      const record = await getConnection()
        .getRepository(RecordEntity)
        .createQueryBuilder("record")
        .where("record.identity = :id", { id: req.params.id })
        .andWhere("record.latest = :latest", { latest: true })
        .getOne();

      if (!record) {
        res.status(404).json({ error: "no record found for the identifier" });
        return;
      }
      const stream = JSON.parse(record.cordStream);
      const sch = await getConnection()
        .getRepository(SchemaEntity)
        .createQueryBuilder("schema")
        .where("schema.identity = :id", { id: stream.schema })
        .getOne();

      if (!sch) {
        res.status(500).json({ error: "corrupted record stream" });
        return;
      }
      const schema = JSON.parse(sch.cordSchema);
      const contentstream = JSON.parse(record.cordStreamContent);
      const response: any = await StreamCord.anchor(
        schema,
        contentstream,
        stream
      );
      if (response.block) {
        record.active = true;
        record.cordBlock = response.block ?? "";
        record.credential = response.credential
          ? JSON.stringify(response.credential)
          : "";
        record.vc = response.vc ? JSON.stringify(response.vc) : "";
        getConnection().manager.save(record);
        res.json({
          result: "SUCCESS",
          stream: response.stream,
          vc: response.vc,
          block: response.block,
        });
      } else {
        res.status(500).json({ error: response.error });
      }
    } catch (err) {
      res.status(500).json({ error: err });
    }
  }

  public static async update(req: express.Request, res: express.Response) {
    try {
      let record = await getConnection()
        .getRepository(RecordEntity)
        .createQueryBuilder("record")
        .where("record.identity = :id", { id: req.params.id })
        .andWhere("record.latest = :latest", { latest: true })
        .getOne();

      if (!record) {
        return res.status(404).json({ error: "Identifier not found" });
      }

      const data = req.body;
      const content = JSON.parse(record.cordStreamContent);

      const response = await StreamCord.update(
        record.identity,
        content,
        data.content
      );
      if (response.block) {
        /* Success */
        let newrecord = new RecordEntity();

        record.latest = false;
        record.active = false;
        newrecord.latest = true;
        newrecord.revoked = false;
        newrecord.title = data.title;
        newrecord.identity = response.stream.identifier;
        newrecord.content = JSON.stringify(data.content);
        newrecord.cordStreamContent = JSON.stringify(response.contentstream);
        newrecord.cordStream = JSON.stringify(response.stream);
        newrecord.active = true;
        newrecord.cordBlock = response.block ?? "";
        newrecord.credential = response.credential
          ? JSON.stringify(response.credential)
          : "";
        newrecord.vc = response.vc ? JSON.stringify(response.vc) : "";
        await getConnection().manager.save(newrecord);
        await getConnection().manager.save(record);
        res.json({ result: "SUCCESS", stream: response.stream, vc: undefined });
      } else {
        return res.status(500).json({error: "failed to update on the chain"});
      }
    } catch (err) {
      return res.status(500).json({ error: err });
    }
  }

  public static async delete(req: express.Request, res: express.Response) {
    res.json({ error: "Function not implemented" });
  }
}
