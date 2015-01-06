###########################################################
# Dockerfile to build Python WSGI Application Containers
# Based on Ubuntu
############################################################

# Set the base image to Ubuntu
FROM ubuntu

# File Author / Maintainer
MAINTAINER Luke Swart 

# Add the application resources URL
RUN echo "deb http://archive.ubuntu.com/ubuntu/ $(lsb_release -sc) main universe" >> /etc/apt/sources.list

# Update the sources list
RUN apt-get update

# Install basic applications
RUN apt-get install -y tar git curl wget dialog net-tools build-essential

# Install Python and Basic Python Tools
RUN apt-get install -y python python-dev python-distribute python-pip

# If you want to deploy from an online host git repository, you can use the following command to clone:
RUN git clone https://github.com/smartercleanup/duwamish.git && cd duwamish && git checkout docker-deploy && cd -

# Do we need this?
# ADD /duwamish /duwamish

# RUN cd duwamish
# RUN git checkout docker-deploy
# RUN cd ..

# Copy the application folder inside the container
# ADD /my_application /my_application

# Get pip to download and install requirements:
RUN pip install -r /duwamish/requirements.txt

# Expose ports
EXPOSE 80
# EXPOSE 8000

# RUN rm /bin/sh && ln -s /bin/bash /bin/sh
# RUN cd duwamish/src/project && /bin/bash -c "source load_site.sh" && cd -
# RUN cd duwamish/src/project && source load_site.sh && cd -
# RUN cd duwamish/src/project && export DUWAMISH_SITE_URL=$(<siteurl.txt) && export DUWAMISH_SITE_KEY=$(<sitekey.txt) && cd -

# Set the default directory where CMD will execute
WORKDIR /duwamish/src

# Set the default command to execute    
# when creating a new container
# i.e. using CherryPy to serve the application
# CMD python server.py
CMD python manage.py runserver 0.0.0.0:80

