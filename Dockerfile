###########################################################
# Dockerfile to build Python WSGI Application Containers
# Based on Ubuntu
############################################################

# Set the base image to Ubuntu
FROM ubuntu

# File Author / Maintainer
MAINTAINER Luke Swart <luke@smartercleanup.org>

# Update the sources list
RUN apt-get update

# Install basic applications
RUN apt-get install -y tar git curl wget dialog net-tools build-essential gettext

# Install Python and Basic Python Tools
RUN sudo apt-get install -y python-distribute python-pip python-dev 

# Install Postgres dependencies
RUN sudo apt-get install -y postgresql libpq-dev

# Deploy from our git repository
RUN git clone https://github.com/smartercleanup/duwamish.git && cd duwamish && git checkout docker-deploy && cd -

# Install pip requirements
RUN pip install -r /duwamish/requirements.txt

# Expose ports
EXPOSE 8002

# Set the default directory where CMD will execute
WORKDIR /duwamish

RUN src/manage.py compilemessages
RUN ln -s staticfiles static
VOLUME /duwamish/static

# Set the default command to execute
# when creating a new container
CMD gunicorn wsgi:application -w 3 -b 0.0.0.0:8002 --log-level=debug

