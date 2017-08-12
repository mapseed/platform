###########################################################
# Dockerfile to build Python WSGI Application Containers
# Based on Ubuntu
############################################################

# Set the base image to Ubuntu
FROM ubuntu:16.04

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

# Deploy from our git repository
RUN git clone https://github.com/smartercleanup/platform.git && cd platform && git checkout 0.8.2 && cd -

# local testing:
# ADD . platform

# Install pip requirements
RUN pip install -r /platform/app-requirements.txt

# Set the default directory where CMD will execute
WORKDIR /platform

CMD /platform/scripts/start.sh
