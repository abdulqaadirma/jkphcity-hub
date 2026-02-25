FROM node:18-alpine
WORKDIR /usr/src/app

COPY  package*.json ./
RUN npm install

COPY . .

EXPOSE 3000
# Use nodemon for development to auto-reload on changes
CMD ["npm", "run", "dev"]