###########################################################
# Dockerfile to build Python WSGI Application Containers
# Based on Ubuntu
############################################################

# Set the base image to Ubuntu
FROM ubuntu:14.04

# File Author / Maintainer
MAINTAINER Luke Swart <luke@smartercleanup.org>

# Update the sources list
RUN apt-get update -y

# Install basic applications
RUN apt-get install -y tar git curl wget dialog net-tools build-essential gettext

# Install Python and Basic Python Tools
RUN apt-get install -y python-distribute python-pip python-dev

# Install Postgres dependencies
RUN apt-get install -y postgresql libpq-dev

RUN groupadd -r smartercleanup \
  && useradd -r -g smartercleanup smartercleanup

# Deploy from our git repository
RUN git clone https://github.com/smartercleanup/duwamish.git && cd duwamish && git checkout docker-deploy && cd -

# local testing:
# ADD . duwamish

# Install pip requirements
RUN pip install -r /duwamish/requirements.txt

# Set the default directory where CMD will execute
WORKDIR /duwamish

ADD start.sh /start.sh
RUN sudo chmod 0755 /start.sh

RUN sudo chown -R smartercleanup:smartercleanup /duwamish
RUN sudo chmod -R 0755 /duwamish
USER smartercleanup

CMD /start.sh
