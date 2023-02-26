FROM node:18-slim

WORKDIR /app

# RUN apt update && apt install -y git

COPY package.json  yarn.lock /app/
RUN yarn

COPY . .
RUN yarn build

EXPOSE 5001

CMD ["npm", "run", "start"]

#CMD ["tail", "-f", "/dev/null"]
