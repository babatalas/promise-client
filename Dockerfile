FROM node:lts-alpine3.14 as build-deps
# set working directory
WORKDIR /app

# add `/app/node_modules/.bin` to $PATH
ENV PATH /app/node_modules/.bin:$PATH

# install app dependencies
COPY package.json yarn.lock  ./
RUN yarn

# add app
COPY . ./

# start app
CMD ["yarn", "start"]