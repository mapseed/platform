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

# For our build scripts:
RUN curl -sL https://deb.nodesource.com/setup | sudo bash -
RUN apt-get install -yq nodejs build-essential
RUN npm install npm -g

# Deploy from our git repository
RUN git clone https://github.com/smartercleanup/duwamish.git && cd duwamish && git checkout tags/django-1.9 && cd -

# local testing:
# ADD . duwamish

# Install our npm dependencies
RUN cd duwamish && npm install && cd -

# # Install pip requirements
RUN pip install -r /duwamish/requirements.txt

# Set the default directory where CMD will execute
WORKDIR /duwamish

# Create the static file folders,
# which need to be present on our image:
# ADD createStaticDirs.sh createStaticDirs.sh
RUN bash /duwamish/createStaticDirs.sh

RUN mkdir /duwamish/staticfiles

CMD /duwamish/start-data-container.sh
