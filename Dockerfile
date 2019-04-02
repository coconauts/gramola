
FROM node:8.15-alpine

EXPOSE 3000

ADD . /code
WORKDIR /code


RUN npm install 
CMD  npm start
