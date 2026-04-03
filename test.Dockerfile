# Linux (Debian) 上でテストを実行する
#
# Usage:
#   docker build -f test.Dockerfile -t serve-test:lts . && docker run --rm serve-test:lts
#   docker build -f test.Dockerfile -t serve-test:24 --build-arg NODE_VERSION=24 . && docker run --rm serve-test:24

ARG NODE_VERSION=lts
FROM node:${NODE_VERSION}-slim
WORKDIR /app
COPY package*.json ./
COPY bin/ ./bin/
COPY lib/ ./lib/
COPY test/ ./test/
CMD ["npm", "cit"]
