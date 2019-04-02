FROM node:10-alpine

# Bundle Source
RUN mkdir -p /usr/src/bolt
WORKDIR /usr/src/bolt
COPY . /usr/src/bolt
RUN npm install --unsafe-perm

# Set Timezone to EST
RUN apk add tzdata
ENV TZ="/usr/share/zoneinfo/America/New_York"

FROM node:10-alpine
COPY --from=0 /usr/src/bolt/server/ /usr/src/bolt/server/
WORKDIR /usr/src/bolt
EXPOSE 3000
CMD ["node", "server/build/app.js"]