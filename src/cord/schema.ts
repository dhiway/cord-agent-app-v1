import * as Cord from "@cord.network/sdk";
import { Init, AccountConfiguration } from "./init";

export class Schema {
  // anchor a new schema on cord chain
  public static async anchor(schema: any) {
    const accountConfiguration: AccountConfiguration =
      await Init.getConfiguration();

    const orgAccount = accountConfiguration.signingAccount;

    try {
      const newSchema = Cord.Schema.fromSchemaProperties(schema, orgAccount);
      const schemaCreationExtrinsic = await Cord.Schema.create(newSchema);
      const tx = await Cord.Chain.signAndSubmitTx(
        schemaCreationExtrinsic,
        orgAccount,
        {
          resolveOn: Cord.Chain.IS_IN_BLOCK,
          rejectOn: Cord.Chain.IS_ERROR,
        }
      );
      const block = tx.status.asInBlock
        ? Cord.Utils.Crypto.u8aToHex(tx.status.asInBlock)
        : "";
      return { tx: tx, schema: newSchema, block: block };
    } catch (e: any) {
      console.log(e.errorCode, "-", e.message);
      return { error: e.message };
    }
  }

  // revoke a schema on cord chain
  public static async revoke(schema: any) {
    const accountConfiguration: AccountConfiguration =
      await Init.getConfiguration();

    const orgAccount = accountConfiguration.signingAccount;

    try {
      const revokeSchemaCreationExtrinsic = await Cord.Schema.revoke(
        schema,
        orgAccount
      );
      const tx = await Cord.Chain.signAndSubmitTx(
        revokeSchemaCreationExtrinsic,
        orgAccount,
        {
          resolveOn: Cord.Chain.IS_IN_BLOCK,
          rejectOn: Cord.Chain.IS_ERROR,
        }
      );
      return {
        tx: tx,
        block: tx.status.asInBlock
          ? Cord.Utils.Crypto.u8aToHex(tx.status.asInBlock)
          : "",
      };
    } catch (err) {
      return { error: err.message };
    }
  }
}
