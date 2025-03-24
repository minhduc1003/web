FROM node:latest

WORKDIR /usr/src/app
COPY package*.json ./

RUN npm install

COPY . .

COPY .env .env

EXPOSE 4000 9000 3000 8000

CMD ["sh", "-c", "node data.js & node game.js & node game2.js & node index.js"]