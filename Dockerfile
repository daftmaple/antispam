FROM node:14-alpine
WORKDIR /usr/src
COPY . .
RUN npm install
RUN npm run build
CMD ["npm", "start"]
