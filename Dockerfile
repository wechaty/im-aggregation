FROM ubuntu:22.04
LABEL author="TankNee"
WORKDIR /usr/src/app
COPY . .
RUN sudo apt-get update \
&& sudo apt-get install -y curl \
&& sudo apt-get install -y build-essential \
&& sudo apt-get install -y ffmpeg \
&& sudo apt-get install -y nodejs \
&& sudo npm install -g yarn \
&& sudo yarn global add ts-node \
&& sudo yarn \
&& sudo yarn run compile:wx-voice

EXPOSE 7777
CMD ["echo", "'IM Aggregation.'"]