###########################################################
# Dockerfile to build MapSeed Application Containers
############################################################

# Set the base image:
FROM node:7.10

# File Author / Maintainer
MAINTAINER Luke Swart <luke@smartercleanup.org>

# # Update the sources list
RUN apt-get update -y

# # Install basic applications
RUN apt-get install -y tar git curl wget dialog net-tools build-essential gettext

# # Install Python and Basic Python Tools
RUN apt-get install -y python-distribute python-pip python-dev

# # Install Postgres dependencies
RUN apt-get install -y postgresql libpq-dev

# TODO: Let's create our own mapseedBase image with our python dependencies.
# Then we can have a mapseedBase:node image with node deps on top of that.
# # For our build scripts (no longer needed w/ node deps in base image):
# RUN curl -sL https://deb.nodesource.com/setup | sudo bash -
# RUN apt-get install -yq nodejs build-essential
# RUN npm install npm -g

# Deploy from our git repository
RUN git clone https://github.com/smartercleanup/platform.git && cd platform && git checkout 0.8.0 && cd -

# # cd in project root and uncomment this for local testing:
# ADD . /platform

# Set the default directory where CMD will execute
WORKDIR /platform

# Install yarn
RUN apt-get update && apt-get install -y apt-transport-https
RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add -
RUN echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list
RUN apt-get update && apt-get install yarn

# Install our npm dependencies
RUN cd /platform && npm install && cd -

# # Install pip requirements
RUN pip install -r /platform/app-requirements.txt

# CONTAINER is a namespace for our data container.
# As long as each container has a unique namespace, we can have multiple
# containers run on a single machine.
ENV CONTAINER duwamish_flavor

CMD /platform/scripts/start-data-container.sh
