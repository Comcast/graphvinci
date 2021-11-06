FROM node:14

# This is just temporary, until CI manages image creation

COPY ./dockerapp /dockerapp
RUN cd /dockerapp && \
  npm install && \
  npm audit fix 

WORKDIR /dockerapp

CMD ["node","server.js"]
