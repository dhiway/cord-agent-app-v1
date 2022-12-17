import * as Cord from "@cord.network/sdk";
import { cryptoWaitReady } from '@polkadot/util-crypto';

const { CORD_WSS_URL, STASH_URI, SIGNING_URI } = process.env;

export interface AccountConfiguration {
  stashAccount: any;
  signingAccount: any;
}

export class Init {
  private static instance: AccountConfiguration;
  private static readonly cordUrl = CORD_WSS_URL
    ? CORD_WSS_URL
    : "ws://localhost:9944";

  private constructor() {}

  public static async getConfiguration(): Promise<AccountConfiguration> {
    if (!Init.instance) {
      await Cord.init({ address: Init.cordUrl });

      cryptoWaitReady().then(() => {
      const stashAccount: any = Cord.Identity.buildFromURI(STASH_URI, {
        signingKeyPairType: "sr25519",
      });

      const signingAccount: any = Cord.Identity.buildFromURI(SIGNING_URI, {
        signingKeyPairType: "sr25519",
      });

      Init.instance = {
        stashAccount,
        signingAccount,
      };
 console.log("CORD Initialized");
  console.log("Stash Account - ", stashAccount.address);
  console.log(
    "Signing Account - ",
    signingAccount.address
  );


     })
    }
    return Init.instance;
  }
}