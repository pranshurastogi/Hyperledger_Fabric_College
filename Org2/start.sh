#/bin/bash

echo "##########################################################"
echo "#########       Starting The Org2 Network      ###########"
echo "##########################################################"
echo

docker-compose -f docker-compose-cli.yaml -f docker-compose-couch.yaml up -d

sleep 10

echo "##########################################################"
echo "#########       Creating The Channel           ###########"
echo "##########################################################"
echo

docker exec -e "CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp" -e "CORE_PEER_ADDRESS=peer0.org2.example.com:7051" -e "CORE_PEER_LOCALMSPID=Org2MSP" peer0.org2.example.com peer channel fetch 0 -o orderer.example.com:7050 -c mychannel

sleep 5

echo "##########################################################"
echo "#########       Join peer0.org2 to channel     ###########"
echo "##########################################################"
echo

docker exec -e "CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp" peer0.org2.example.com peer channel join -b mychannel_0.block

sleep 5

echo "##########################################################"
echo "#########       Join peer1.org2 to channel     ###########"
echo "##########################################################"
echo

docker exec -e "CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp" -e "CORE_PEER_ADDRESS=peer1.org2.example.com:7051" -e "CORE_PEER_LOCALMSPID=Org2MSP" peer0.org2.example.com peer channel join -b mychannel_0.block

sleep 5

echo "##########################################################"
echo "########   Updating peer0 as Anchor Peer of Org2   #######"
echo "##########################################################"
echo

docker exec -e "CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp" -e "CORE_PEER_ADDRESS=peer0.org2.example.com:7051 CORE_PEER_LOCALMSPID=Org2MSP" peer0.org2.example.com peer channel update -o orderer.example.com:7050 -c mychannel -f ./channel-artifacts/Org2MSPanchors.tx

sleep 5

echo "##########################################################"
echo "########    Installing Chaincode on peer0.org2     #######"
echo "##########################################################"
echo

docker exec -e "CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp" -e "CORE_PEER_ADDRESS=peer0.org2.example.com:7051" -e "CORE_PEER_LOCALMSPID=Org2MSP" peer0.org2.example.com peer chaincode install -n college -v 1.0.0 -l node -p /opt/gopath/src/github.com/chaincode/college/node/

