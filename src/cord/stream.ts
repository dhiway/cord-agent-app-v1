import * as Cord from "@cord.network/sdk";
import { Init, AccountConfiguration } from "./init";

export class Stream {
  public static async buildAndAnchor(
    spaceId: any,
    schema: any,
    content: any,
    holderAddress: string | null,
    anchor: boolean
  ) {
    const accountConfiguration: AccountConfiguration =
      await Init.getConfiguration();

    const orgAccount = accountConfiguration.signingAccount;

    if (!holderAddress) {
      console.log("Holder Address not provided, issuing it to self");
      holderAddress = orgAccount.address;
    }

    try {
      /* assumption is space and schema are created by now */
      const schemaStream = Cord.Content.fromSchemaAndContent(
        schema,
        content,
        orgAccount.address,
        holderAddress
      );
      const newStreamContent = Cord.ContentStream.fromContent(
        schemaStream,
        orgAccount,
        { space: spaceId }
      );
      const newStream = Cord.Stream.fromContentStream(newStreamContent);

      if (anchor) {
        return await Stream.anchor(schema, newStreamContent, newStream);
      } else {
        return {
          block: null,
          stream: newStream,
          contentstream: newStreamContent,
        };
      }
    } catch (e: any) {
      console.log(e.errorCode, "-", e.message);
      return { error: e.message };
    }
  }

  public static async anchor(schema: any, contentstream: any, stream: any) {
    const accountConfiguration: AccountConfiguration =
      await Init.getConfiguration();

    const orgAccount = accountConfiguration.signingAccount;

    try {
      const streamCreationExtrinsic = await Cord.Stream.create(stream);
      const tx = await Cord.Chain.signAndSubmitTx(
        streamCreationExtrinsic,
        orgAccount,
        {
          resolveOn: Cord.Chain.IS_IN_BLOCK,
          rejectOn: Cord.Chain.IS_ERROR,
        }
      );
      if (tx && !tx.dispatchError) {
        const block = tx.status.asInBlock
          ? Cord.Utils.Crypto.u8aToHex(tx.status.asInBlock)
          : "";
        const qstream = await Cord.Stream.query(stream.identifier);
        const credential = Cord.Credential.fromRequestAndStream(
          contentstream,
          qstream
        );

        return {
          credential: credential,
          stream: stream,
          contentstream: contentstream,
          tx: tx,
          block: block,
        };
      }
      return { error: tx.dispatchError.toString() };
    } catch (e: any) {
      console.log(e.errorCode, "-", e.message);
      return { error: e.message };
    }
  }

  public static async revoke(stream: any) {
    const accountConfiguration: AccountConfiguration =
      await Init.getConfiguration();

    const orgAccount = accountConfiguration.signingAccount;

    try {
      const revokeStreamCreationExtrinsic = await Cord.Stream.revoke(
        stream,
        orgAccount
      );

      const tx = await Cord.Chain.signAndSubmitTx(
        revokeStreamCreationExtrinsic,
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
    } catch (err: any) {
      return { error: err.message };
    }
  }
}
