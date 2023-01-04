import express from "express";
import { getConnection } from "typeorm";

import { Score as ScoreCord } from "../cord/score";
import { Score as ScoreEntity } from "../entity/Score";

export class Score {
  public static async entry(req: express.Request, res: express.Response) {
    const data = req.body;
    /* format */
    /*
    { options: {}, score: { id?, entity, uid, tid, type } }
    */

    /* only score gets through the identifier part. 'id' is optional, but
       recommended to keep the uniqueness in identifer creation */

    /* validation */
    /* TODO: any thing more? */
    if (!data.score) {
      res.status(400).json({
        error: "'score' is a required field, with title and description",
      });
      return;
    }

    try {
      const response = await ScoreCord.entry(data.score);
      if (response.score) {
        /* success */
        let score = new ScoreEntity();
        score.entity = data.score.entity ?? '';
        score.identifier = response.score?.identifier?.replace("score:cord:", "");
        score.uid = data.score.uid;
        score.tid = data.score.tid;
        score.collector = data.score.controller ?? '';
        score.requestor = data.score.requestor ?? '';
        score.type = data.score.type;
	score.latest = true;
        score.score = data.score.score * 10;

	console.log("score", score);
        await getConnection().manager.save(score);
        res.json({ result: "SUCCESS", score: response.score?.identifier });
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
      const score = await getConnection()
        .getRepository(ScoreEntity)
        .createQueryBuilder("score")
        .where("score.identifier = :id", {
          id: req.params.id?.replace("score:cord:", ""),
        })
        .getOne();

      res.json(score);
    } catch (err) {
      res.status(500).json({ error: err });
    }
  }
}
