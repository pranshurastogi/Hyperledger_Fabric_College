#/bin/bash

#Below command will stop the running docker containers.
echo "****** Stopping the running containers...... ************"
docker-compose -f docker-compose-cli.yaml -f docker-compose-couch.yaml down

echo""
echo "*********** Removing unused containers...... **************"
docker rm -f $(docker ps -aq)

echo""
echo "*********** Removing unused networks...... **************"
docker network prune

echo""
echo "*********** Removing all unused local volumes.... *******"
docker volume prune

echo ""
echo "*********** Removing Chaincode images.... *******"
docker rmi -f $(docker images | grep college | awk '{print $3}')
