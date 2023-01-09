import * as Cord from "@cord.network/sdk";
import { ScoreType } from "@cord.network/types";
import { Init, AccountConfiguration } from "./init";

export class Score {
  public static async entry(score: any) {
    if (!score) {
      return { error: "not a valid score" };
    }

    const accountConfiguration: AccountConfiguration =
      await Init.getConfiguration();

    const orgAccount = accountConfiguration.signingAccount;

      /// business entity
    const entity: any = Cord.Identity.buildFromURI(`//${score.entity}`, {
      signingKeyPairType: "sr25519",
    });

      /// buyer application
    const collector: any = Cord.Identity.buildFromURI(`//${score.collector}`, {
      signingKeyPairType: "sr25519",
    });
      /// seller application
    const requestor: any = Cord.Identity.buildFromURI(`//${score.requestor}`, {
      signingKeyPairType: "sr25519",
    });
      
    const scoreContent = { ...score, entity: entity.address, collector: collector.address, requestor: requestor.address };
    try {
      const newScore = Cord.Score.fromJournalProperties(
        scoreContent,
        entity
      );
      const scoreCreationExtrinsic = await Cord.Score.entries(newScore);
      const tx = await Cord.Chain.signAndSubmitTx(
        scoreCreationExtrinsic,
        orgAccount,
        {
          resolveOn: Cord.Chain.IS_IN_BLOCK,
          rejectOn: Cord.Chain.IS_ERROR,
        }
      );
      const block = tx.status.asInBlock
        ? Cord.Utils.Crypto.u8aToHex(tx.status.asInBlock)
        : "";
      return { tx: tx, score: newScore, block: block };
    } catch (e: any) {
      console.log(e.errorCode, "-", e.message);
      return { error: e.message };
    }
  }

  public static async query(entity: any, type: ScoreType) {
    if (!entity) {
      return { error: "not a valid entity" };
    }

    if (!type) {
        type = ScoreType.overall;
    }

    const accountConfiguration: AccountConfiguration =
      await Init.getConfiguration();

    const orgAccount = accountConfiguration.signingAccount;

      /// business entity
      const entityId: any = Cord.Identity.buildFromURI(`//${entity}`, {
      signingKeyPairType: "sr25519",
    });

    try {
      const score = await Cord.Score.query(entityId.address, type);
      return { entity: entity, type: type, score: score };
    } catch (e: any) {
      console.log(e.errorCode, "-", e.message);
      return { error: e.message };
    }
  }
}
