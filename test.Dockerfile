# Linux (Debian) 上でテストを実行する
#
# Usage:
#   docker build -f test.Dockerfile -t serve-test --build-arg NODE_VERSION=22 . && docker run --rm serve-test
#   docker build -f test.Dockerfile -t serve-test --build-arg NODE_VERSION=24 . && docker run --rm serve-test
#   docker build -f test.Dockerfile -t serve-test --build-arg NODE_VERSION=25 . && docker run --rm serve-test

ARG NODE_VERSION=22
FROM node:${NODE_VERSION}-slim
WORKDIR /app
COPY package*.json ./
COPY bin/ ./bin/
COPY lib/ ./lib/
COPY test/ ./test/
CMD ["npm", "cit"]
