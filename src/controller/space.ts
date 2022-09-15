import express from "express";
import { getConnection } from "typeorm";

import { Space as SpaceCord } from "../cord/space";
import { Space as SpaceEntity } from "../entity/Space";

export class Space {
  public static async create(req: express.Request, res: express.Response) {
    const data = req.body;
    /* format */
    /*
    { options: {}, schema: "schema:cord:5xxxx..", space: { id?, title, description } }
    */

    /* only space gets through the identifier part. 'id' is optional, but
       recommended to keep the uniqueness in identifer creation */

    /* validation */
    /* TODO: any thing more? */
    if (!data.space) {
      res.status(400).json({
        error: "'space' is a required field, with title and description",
      });
      return;
    }

    try {
      const response = await SpaceCord.anchor(data.schema, data.space);
      if (response.space) {
        /* success */
        let space = new SpaceEntity();
        space.title = data.space.title;
        space.identity = response.space?.identifier?.replace("space:cord:", "");
        space.content = JSON.stringify(data.space);
        space.cordSpace = JSON.stringify(response.space);
        space.cordBlock = response.block;
        space.schema = data.schema ? data.schema : "";
        await getConnection().manager.save(space);
        res.json({ result: "SUCCESS", space: response.space?.identifier });
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
      const space = await getConnection()
        .getRepository(SpaceEntity)
        .createQueryBuilder("space")
        .where("space.identity = :id", {
          id: req.params.id?.replace("space:cord:", ""),
        })
        .getOne();

      res.json(space);
    } catch (err) {
      res.status(500).json({ error: err });
    }
  }

  public static async index(req: express.Request, res: express.Response) {
    try {
      const spaces = await getConnection()
        .getRepository(SpaceEntity)
        .createQueryBuilder("space")
        .getMany();

      res.json(spaces);
    } catch (err) {
      res.status(500).json({ error: err });
    }
  }

  public static async update(req: express.Request, res: express.Response) {
    res.status(400).json({error: "Function not implemented"});
  }
}
