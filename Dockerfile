FROM node:24-alpine3.21

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

ARG WS_PORT=8080
ARG OSC_HOST=192.168.1.137
ARG OSC_PORT=8000

# Пробрасываем их как ENV, чтобы npm run build их увидел
ENV WS_PORT=${WS_PORT}
ENV OSC_HOST=${OSC_HOST}
ENV OSC_PORT=${OSC_PORT}

CMD ["node", "server.js"]