FROM node:16
LABEL author="TankNee"
# 安装必要的环境
RUN apt-get update \
    && apt-get install -y curl \
    && apt-get install -y build-essential \
    && apt-get install -y ffmpeg \
    && apt-get install -y pandoc \
    && apt-get install ca-certificates fonts-liberation libappindicator3-1 libasound2 libatk-bridge2.0-0 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgbm1 libgcc1 libglib2.0-0 libgtk-3-0 libnspr4 libnss3 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 lsb-release wget xdg-utils -y
# 定位到工作目录
WORKDIR /usr/src/app
COPY . .
# 安装依赖库
RUN yarn global add ts-node \
    && yarn global add pm2 \
    && yarn \
    && yarn run compile:wx-voice

EXPOSE 7777
CMD ["pm2", "start", "--name", "Server", "'yarn run serve'"]