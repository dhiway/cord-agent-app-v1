import * as Cord from "@cord.network/sdk";
import { Init, AccountConfiguration } from "./init";

export class Space {
  public static async anchor(schemaId: string | null, space: any) {
    if (!space) {
      return { error: "not a valid space" };
    }

    const accountConfiguration: AccountConfiguration =
      await Init.getConfiguration();

    const orgAccount = accountConfiguration.signingAccount;

    const spaceContent = { ...space };
    try {
      const newSpace = Cord.Space.fromSpaceProperties(
        spaceContent,
        orgAccount,
        schemaId
      );
      const spaceCreationExtrinsic = await Cord.Space.create(newSpace);
      const tx = await Cord.Chain.signAndSubmitTx(
        spaceCreationExtrinsic,
        orgAccount,
        {
          resolveOn: Cord.Chain.IS_IN_BLOCK,
          rejectOn: Cord.Chain.IS_ERROR,
        }
      );
      const block = tx.status.asInBlock
        ? Cord.Utils.Crypto.u8aToHex(tx.status.asInBlock)
        : "";
      return { tx: tx, space: newSpace, block: block };
    } catch (e: any) {
      console.log(e.errorCode, "-", e.message);
      return { error: e.message };
    }
  }
}
