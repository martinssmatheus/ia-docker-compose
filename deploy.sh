#!/bin/bash

# Atualização do projeto

git pull

# Removendo conainers em exexcução

docker container rm -f $(docker ps -a -qq)

# Subindo containers com as atualizações

docker compose up -d --build
