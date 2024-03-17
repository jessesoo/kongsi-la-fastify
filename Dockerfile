FROM node:slim

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . ./

EXPOSE $PORT

ENV HOST=0.0.0.0

CMD ["npm", "start"]

# Optional: PORT will be configured by Cloud Run at deployment
# ENV PORT=8080