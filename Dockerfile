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

# # For our build scripts:
# #Add node repository to sources.list and update apt
# RUN add-apt-repository ppa:chris-lea/node.js && apt-get update -y
# #Install node.js
# RUN apt-get install nodejs
# RUN npm install npm -g

# install from nodesource using apt-get
# https://www.digitalocean.com/community/tutorials/how-to-install-node-js-on-an-ubuntu-14-04-server
RUN curl -sL https://deb.nodesource.com/setup | sudo bash -
RUN apt-get install -yq nodejs build-essential
RUN npm install npm -g

# Deploy from our git repository
# RUN git clone https://github.com/smartercleanup/duwamish.git && cd duwamish && git checkout docker-deploy && cd -

# Install our npm dependencies
RUN cd duwamish && npm install && cd -

# local testing:
ADD . duwamish

# Install pip requirements
RUN pip install -r /duwamish/requirements.txt

# Set the default directory where CMD will execute
WORKDIR /duwamish

# RUN src/manage.py compilemessages
# RUN src/manage.py collectstatic --noinput
# RUN ln -s staticfiles static
RUN mkdir /duwamish/staticfiles
VOLUME /duwamish/staticfiles

# We will run any commands in this when the container starts
ADD start.sh /start.sh
RUN sudo chmod 0755 /start.sh

CMD /start.sh
