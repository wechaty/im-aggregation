FROM node:16
LABEL author="TankNee"
# 安装必要的环境
RUN apt-get update \
    && apt-get install -y curl \
    && apt-get install -y build-essential \
    && apt-get install -y ffmpeg \
    && apt-get install -y pandoc
# 定位到工作目录
WORKDIR /usr/src/app
COPY . .
# 安装依赖库
RUN yarn global add ts-node \
    && yarn global add pm2 \
    && yarn \
    && yarn run compile:wx-voice

EXPOSE 7777
CMD ["yarn", "run", "serve"]