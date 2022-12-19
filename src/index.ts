import fs from "fs";

import { createConnection } from "typeorm";
import swaggerUi from "swagger-ui-express";
import { app, server } from "./server";
import { Init as CordInit, AccountConfiguration } from "./cord/init";
import { dbConfig } from "./config/dbconfig";
import ScoreRouter from "./router/score";
import SchemaRouter from "./router/schema";
import SpaceRouter from "./router/space";
import RecordRouter from "./router/record";
import VerifyRouter from "./router/verify";

const { PORT, STASH_URI, SIGNING_URI } = process.env;

const openApiDocumentation = JSON.parse(
  fs.readFileSync("./apis.json").toString()
);

app.use("/api/v1/scores", ScoreRouter);
app.use("/api/v1/schemas", SchemaRouter);
app.use("/api/v1/spaces", SpaceRouter);
app.use("/api/v1/:spaceId/records", RecordRouter);
app.use("/api/v1/verify", VerifyRouter);

app.use("/docs", swaggerUi.serve, swaggerUi.setup(openApiDocumentation));

// All other routes to React App
app.get("/*", async (req, res) => {
  return res.json({
    message: "check https://docs.dhiway.com/api for details of the APIs",
  });
});

async function main() {
  if (!PORT) {
    console.log("Environment variable PORT is not set. " + "Example PORT=4000");
    return;
  }
  if (!STASH_URI) {
    console.log(
      "Environment variable STASH_URI is not set. " +
        "Example STASH_URI=//Alice"
    );
    return;
  }
  if (!SIGNING_URI) {
    console.log(
      "Environment variable SIGNING_URI is not set. " +
        "Example SIGNING_URI=//Bob"
    );
    return;
  }

  createConnection(dbConfig);
  server.listen(parseInt(PORT, 10), () => {
    console.log(`Dhiway gateway is running at http://localhost:${PORT}`);
  });

  const accountConfiguration: AccountConfiguration =
    await CordInit.getConfiguration();

  console.log("CORD Initialized");
  console.log("Stash Account - ", accountConfiguration.stashAccount.address);
  console.log(
    "Signing Account - ",
    accountConfiguration.signingAccount.address
  );
}

main().catch((e) => console.log(e));
