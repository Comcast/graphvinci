FROM node:latest

# This is just temporary, until CI manages image creation

COPY . /code
RUN cd code && \
  npm install && \
  npm run build_container && \
  cd dockerapp && \
  npm install && \
  cd ../ && \
  mv dockerapp / && \
  rm -r *

WORKDIR /dockerapp

CMD ["node","server.js"]
