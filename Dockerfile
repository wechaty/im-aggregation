FROM ubuntu:22.04
LABEL author="TankNee"
WORKDIR /usr/src/app
COPY . .
RUN apt-get update \
&& apt-get install -y curl \
&& apt-get install -y build-essential \
&& apt-get install -y ffmpeg \
&& apt-get install -y nodejs \
&& npm install -g yarn \
&& yarn global add ts-node \
&& yarn \
&& yarn run compile:wx-voice

EXPOSE 7777
CMD ["echo", "'IM Aggregation.'"]