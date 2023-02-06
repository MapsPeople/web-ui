### STAGE 1: Build ###
FROM node:16 as build
LABEL author="MapsPeople"

# Create app directory
WORKDIR /app

# Install app dependencies and copy it all
# Use wildcard "package*.json" to ensure both package.json AND package-lock.json are copied
COPY package*.json ./
RUN npm ci
COPY . .

# Production build without source-map
RUN npm run build
RUN npm run docs.sass
RUN npm run docs.eleventy


### STAGE 2: Run ###
FROM nginx:alpine
VOLUME /var/cache/nginx
COPY --from=build /app/docs /usr/share/nginx/html
COPY ./nginx.conf /etc/nginx/conf.d/default.conf
