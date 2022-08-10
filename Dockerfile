FROM node:16-slim

WORKDIR /app


COPY package.json  yarn.lock /app/
RUN yarn

RUN apt-get update && apt-get install -y dumb-init

COPY . .
RUN yarn build


EXPOSE 5001

ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "run", "start"]

#CMD ["tail", "-f", "/dev/null"]
