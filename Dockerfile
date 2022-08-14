FROM node:16
LABEL author="TankNee"
# 安装必要的环境
# chromium denpendency: https://github.com/it-novum/puppeteer-docker/blob/fa7391eef0f0d3326a47ac2a40098052891cca1e/Dockerfile#L12
RUN apt-get update \
    && apt-get install -y curl \
    && apt-get install -y build-essential \
    && apt-get install -y ffmpeg \
    && apt-get install -y pandoc \
    && apt-get install -y redis \
    && apt-get install -y wget gnupg \
    && apt-get install -y fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 libgtk2.0-0 libnss3 libatk-bridge2.0-0 libdrm2 libxkbcommon0 libgbm1 libasound2 \
    && apt-get install -y chromium
# 定位到工作目录
WORKDIR /usr/src/app
COPY . .
# 安装依赖库
RUN yarn global add ts-node \
    && yarn global add pm2 \
    && pm2 install pm2-logrotate \
    && yarn \
    && bash init.sh

EXPOSE 7777
CMD ["pm2", "start", "--name", "Server", "'yarn run serve'"]