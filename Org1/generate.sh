#/bin/bash

docker kill $(docker ps -aq)
docker rm -f $(docker ps -aq)

echo "##########################################################"
echo "##### Generate certificates using cryptogen tool #########"
echo "##########################################################"

if [ -d "crypto-config" ]; then
    rm -Rf crypto-config
fi
./bin/cryptogen generate --config=./crypto-config.yaml
export FABRIC_CFG_PATH=$PWD

echo "##########################################################"
echo "#########  Generating Orderer Genesis block ##############"
echo "##########################################################"

if [ -d "channel-artifacts" ]; then
    rm -Rf channel-artifacts/*
else
    mkdir -p channel-artifacts
fi

./bin/configtxgen -profile TwoOrgsOrdererGenesis -outputBlock ./channel-artifacts/genesis.block

echo
echo "#################################################################"
echo "### Generating channel configuration transaction 'channel.tx' ###"
echo "#################################################################"

./bin/configtxgen -profile TwoOrgsChannel -outputCreateChannelTx ./channel-artifacts/channel.tx -channelID mychannel


echo
echo "#################################################################"
echo "#######    Generating anchor peer update for Org1MSP   ##########"
echo "#################################################################"

./bin/configtxgen -profile TwoOrgsChannel -outputAnchorPeersUpdate ./channel-artifacts/Org1MSPanchors.tx -channelID mychannel -asOrg Org1MSP

echo
echo "#################################################################"
echo "#######    Generating anchor peer update for Org2MSP   ##########"
echo "#################################################################"

./bin/configtxgen -profile TwoOrgsChannel -outputAnchorPeersUpdate ./channel-artifacts/Org2MSPanchors.tx -channelID mychannel -asOrg Org2MSP

echo
echo "################################################################################################################################"
echo "########################################################## NOTE : ##############################################################"
echo "Replace the FABRIC_CA_SERVER_CA_KEYFILE in docker-compose-cli.yaml from crypto-config/peerOrganizations/org1.example.com/ca/   #"
echo "#################################################################################################################################"