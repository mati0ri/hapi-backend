FROM node:20

WORKDIR /user/src/app

COPY package*.json ./
RUN npm i
RUN npm i -g nodemon
RUN npm install -g knex

COPY . .

EXPOSE 3100
CMD [ "npm", "run", "dev" ]