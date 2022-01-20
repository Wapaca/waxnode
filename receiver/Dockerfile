FROM ubuntu:20.04

ENV TZ=Europe/Paris
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# Update, upgrade and add key
RUN apt update && apt upgrade -y
RUN apt install -y gnupg software-properties-common wget
RUN wget -O - https://apt.kitware.com/keys/kitware-archive-latest.asc 2>/dev/null | apt-key add -

# Add repo
RUN apt-add-repository 'deb https://apt.kitware.com/ubuntu/ focal main'
RUN add-apt-repository -y ppa:ubuntu-toolchain-r/test

# Install compiler and lib
RUN apt update && apt install -y git g++-8 cmake libssl-dev libgmp-dev zlib1g-dev
RUN update-alternatives --install /usr/bin/gcc gcc /usr/bin/gcc-8 800 --slave /usr/bin/g++ g++ /usr/bin/g++-8

RUN mkdir /chronicle
WORKDIR /chronicle

# Install boost
RUN wget https://boostorg.jfrog.io/artifactory/main/release/1.67.0/source/boost_1_67_0.tar.gz
RUN tar -xvzf boost_1_67_0.tar.gz
WORKDIR boost_1_67_0/
RUN ./bootstrap.sh
RUN ./b2 install
WORKDIR /chronicle

# Install Chronicle
RUN mkdir build
WORKDIR build/
RUN git clone https://github.com/EOSChronicleProject/eos-chronicle.git
WORKDIR eos-chronicle/
RUN git submodule update --init --recursive
RUN mkdir build
WORKDIR build/
RUN pwd
RUN cmake ..
RUN make
RUN make install
WORKDIR /chronicle

# CP workspace
RUN mkdir config && mkdir data
COPY config.ini /chronicle/config
COPY entrypoint.sh .
RUN chmod +x entrypoint.sh

ENTRYPOINT ["./entrypoint.sh"]
