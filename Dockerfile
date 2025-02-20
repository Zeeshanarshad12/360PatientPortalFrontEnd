# Dockerfile
# base image - alpine is a lightweight Linux flavor which uses less storage.
FROM node:20.18.0-alpine
# create & set working directory
WORKDIR /ehr_frontend
# copy package.json file into the working directory 
ENV NODE_OPTIONS="--max-old-space-size=8192"
COPY package*.json ./
# install dependencies
RUN npm install -g npm@9.6.4
#RUN npm install --legacy-peer-deps
# copy source files
COPY . .
# start app
#RUN npm config set fetch-timeout 300000
#RUN npm config delete proxy
#RUN npm config delete https-proxy
RUN npm install next
RUN npm install --force react-otp-input
RUN npm install --force react-google-recaptcha
RUN npm run build:prod 
# Expose port 3000 from your container to your local network
EXPOSE 3000
# Command to start your application
CMD npm run start