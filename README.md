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


## Docs

Check documentation by checking http://localhost:5001/docs while project is running.

Or if you want a local html page then run `npx open-swagger-ui ./apis.json --open` from console.
