FROM node:22-alpine3.21

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

ENV WS_PORT=8080
ENV OSC_HOST=192.168.1.137
ENV OSC_PORT=8000

CMD ["node", "server.js"]