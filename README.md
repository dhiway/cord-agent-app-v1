# CORD APIs

This project provides REST APIs to [cord.js](https://github.com/dhiway/cord.js) SDK. We can call it an agent as this can be hosted on one of the local network machine, and can work on once's behalf while interacting with the chain.

## Development

Start with below steps:

```
$ docker build -t dhiway/agent:latest .
$ docker compose up
```

This will start a DB service, and also the dhiway/agent application, with required flags.

If you want to run without docker, then the ENV variables needs to be passed properly, or update in src/dbconfig.ts. Run 'yarn && yarn build && yarn start'

NOTE: If you can't use docker-compose, you can still run the project individually. Make sure to `set` the ENV variables present in .env file.

One may need [`wsl`](https://docs.microsoft.com/en-us/windows/wsl/about) (Windows Subsystem for linux) installed on Windows.

## Docs

Check API documentation by checking http://localhost:5001/docs while project is running.

Or if you want a local html page then run `npx open-swagger-ui ./apis.json --open` from console.

## Deployment

Before deployment, make sure you get 2 keys generated for your use. Of which, never share the private key (ie, secret, or mnemonic). Use that in .env file, (or pass it as env variable for the process while launching). The public address of the key should be informed to the team managing CORD, so they can transfer the funds/tokens to the stash account of this agent.

### Steps to generate the key

One can use browser extensions available through https://apps.cord.network ('Accounts' -> 'Add Account'), or use subkey project to create the key.

```
docker run --rm parity/subkey:2.0.0 generate --network cord
```

The output would be something like below, of which, keep the secret, and share SS58 Address

```
Secret phrase `border appear grid thunder shed moral copy broom child divert first company` is account:
  Secret seed:      0x43ab625877717b4ca175d27c1495667e5d2cdec9e57ff1b56f1a5135443a3b42
  Public key (hex): 0xc8a549bbffe4538dcc1261daa5553777f5ab995b57e23b62f38a8910b16e7a78
  Account ID:       0xc8a549bbffe4538dcc1261daa5553777f5ab995b57e23b62f38a8910b16e7a78
  SS58 Address:     3yNDB5cyMHZW7MWhz3g6pyGCmQLCQqTz43kNpWpgMU95u44w
```

Below diagram would give an idea of how to deploy the project, and its intended use.

![Agent](./docs/CORD_Agent_Diagram.png)


Note that, this project is just a demostration of how to interact with the CORD Network. This includes the SDK as part of it.

As shown, the project is intented to be deployed in a 'secure network', with the application, so there is no sample of authentication used in the project. We recommend deploying it closer to the client application.

Note that on the CORD Network, we will only have transaction of extrinsic calls (ie, the methods) with the argument, and the Events like identifier creation. The data would reside with the agent hosted on client network. The DB used by Agent should be used with enough backup etc, so the high availability is managed.


For example, the #MARK Studio (https://studio.dhiway.com) is one of the extended version of this agent, which has evolved to provide more APIs and is hosted as multi-user SaaS project. To achieve it, studio project has implemented authentication logic, and many other integrations. This Agent project is a base to extend CORD interaction with any other application.

