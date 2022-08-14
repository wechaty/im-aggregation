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
    && apt-get install -y chromium \
    && apt-get install -y ca-certificates fonts-liberation libappindicator3-1 libasound2 libatk-bridge2.0-0 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgbm1 libgcc1 libglib2.0-0 libgtk-3-0 libnspr4 libnss3 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 lsb-release wget xdg-utils

# 配置 puppeteer 的 chromium 环境变量
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV CHROME_PATH=/usr/bin/chromium
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# 定位到工作目录
WORKDIR /usr/src/app
# 拷贝代码
COPY . .
# 拷贝 redis 配置文件
COPY redis.conf /usr/local/etc/redis/redis.conf
# 安装依赖库
RUN yarn global add ts-node \
    && yarn global add pm2 \
    && pm2 install pm2-logrotate \
    && yarn \
    && bash init.sh

EXPOSE 7777
CMD ["bash", "./run.sh"]