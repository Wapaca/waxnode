FROM ubuntu:20.04

ENV TZ=Europe/Paris
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# Update, upgrade and add key
RUN apt update && apt upgrade -y

RUN apt install -y curl git

RUN curl -sL https://deb.nodesource.com/setup_12.x | bash -
RUN apt update && apt install -y nodejs

RUN mkdir /chronicle
RUN mkdir /chronicle/scripts

WORKDIR /chronicle/scripts

EXPOSE 8855

ENTRYPOINT ["node", "-r", "esm", "run/main.js"]