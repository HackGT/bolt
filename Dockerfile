FROM node:14-alpine

# Bundle Source
RUN mkdir -p /usr/src/bolt
WORKDIR /usr/src/bolt
COPY . /usr/src/bolt
RUN yarn install

# Set Timezone to EST
RUN apk add tzdata
ENV TZ="/usr/share/zoneinfo/America/New_York"

FROM node:14-alpine
COPY --from=0 /usr/src/bolt/server/ /usr/src/bolt/server/
COPY --from=0 /usr/src/bolt/client/ /usr/src/bolt/client/
WORKDIR /usr/src/bolt

EXPOSE 3000
WORKDIR /usr/src/bolt/server
CMD ["yarn", "start-migrate"]
