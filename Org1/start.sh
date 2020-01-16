#/bin/bash

echo "##########################################################"
echo "#########       Starting The Org1 Network      ###########"
echo "##########################################################"
echo

docker-compose -f docker-compose-cli.yaml -f docker-compose-couch.yaml up -d

sleep 10

echo "##########################################################"
echo "#########       Creating The Channel           ###########"
echo "##########################################################"
echo

#creating channel without TLS

docker exec -e "CORE_PEER_LOCALMSPID=Org1MSP" -e "CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp" peer0.org1.example.com peer channel create -o orderer.example.com:7050 -c mychannel -f /opt/gopath/src/github.com/hyperledger/fabric/peer/channel-artifacts/channel.tx

echo "##########################################################"
echo "#########       Join peer0.org1 to channel     ###########"
echo "##########################################################"
echo

sleep 5

docker exec -e "CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp" -e "CORE_PEER_ADDRESS=peer0.org1.example.com:7051" -e "CORE_PEER_LOCALMSPID=Org1MSP" peer0.org1.example.com peer channel join -b mychannel.block

echo "##########################################################"
echo "#########       Join peer1.org1 to channel     ###########"
echo "##########################################################"
echo

sleep 5

docker exec -e "CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp" -e "CORE_PEER_ADDRESS=peer1.org1.example.com:7051" -e "CORE_PEER_LOCALMSPID=Org1MSP" peer0.org1.example.com peer channel join -b mychannel.block

echo "##########################################################"
echo "########   Updating peer0 as Anchor Peer of Org1   #######"
echo "##########################################################"
echo

sleep 5

docker exec -e "CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp" -e "CORE_PEER_ADDRESS=peer0.org1.example.com:7051" -e "CORE_PEER_LOCALMSPID=Org1MSP" peer0.org1.example.com peer channel update -o orderer.example.com:7050 -c mychannel -f ./channel-artifacts/Org1MSPanchors.tx

echo "##########################################################"
echo "########    Installing Chaincode on peer0.org1     #######"
echo "##########################################################"
echo

sleep 5

docker exec -e  "CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp" -e "CORE_PEER_ADDRESS=peer0.org1.example.com:7051" -e "CORE_PEER_LOCALMSPID=Org1MSP" peer0.org1.example.com peer chaincode install -n college -v 1.0.0 -l node -p /opt/gopath/src/github.com/chaincode/college/node/

echo "##########################################################"
echo "########    Instantiating Chaincode on channel     #######"
echo "##########################################################"
echo

sleep 5

docker exec -e "CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp" -e "CORE_PEER_ADDRESS=peer0.org1.example.com:7051" -e "CORE_PEER_LOCALMSPID=Org1MSP" peer0.org1.example.com peer chaincode instantiate -o orderer.example.com:7050 -C mychannel -n college -l node -v 1.0.0 -c '{"Args":[""]}' -P "OR ('Org1MSP.peer','Org2MSP.peer')"
