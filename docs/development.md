
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

NOTE: If you are running MacOS then try below

```
$ docker build -t dhiway/agent:latest -f Dockerfile.mac
$ docker compose up
```

## Deployment

Before deployment, make sure you get 2 keys generated for your use. Of which, never share the private key (ie, secret, or mnemonic). Use that in .env file, (or pass it as env variable for the process while launching). The public address of the key should be informed to the team managing CORD, so they can transfer the funds/tokens to the stash account of this agent.

### Steps to generate the key

One can use browser extensions available through https://apps.cord.network ('Accounts' -> 'Add Account'), or use subkey project to create the key.

```
docker run --rm parity/subkey generate --network cord
```

The output would be something like below, of which, keep the secret, and share SS58 Address

```
Secret phrase:       globe bargain edge valve position bulk pistol bench auto change arrive clog
  Network ID:        cord
  Secret seed:       0x163ea24b0bd09a592c589f667bcfbe678a4e967f8683b31494e4169eff441462
  Public key (hex):  0x647365f6561fcf816c9670bb0eb106131015c9aa43881acfe90eee8898b3d709
  Account ID:        0x647365f6561fcf816c9670bb0eb106131015c9aa43881acfe90eee8898b3d709
  Public key (SS58): 3w6qZmZQG3yFhLuFhXaTSd2J9NYP48uawdVT18pQ6qHaXaTL
  SS58 Address:      3w6qZmZQG3yFhLuFhXaTSd2J9NYP48uawdVT18pQ6qHaXaTL
```
