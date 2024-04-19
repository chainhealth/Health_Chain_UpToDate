export CORE_PEER_TLS_ENABLED=true
export ORDERER_CA=${PWD}/artifacts/channel/crypto-config/ordererOrganizations/chainhealth.com/orderers/orderer.chainhealth.com/msp/tlscacerts/tlsca.chainhealth.com-cert.pem
export PEER0_pharmacy_CA=${PWD}/artifacts/channel/crypto-config/peerOrganizations/pharmacy.chainhealth.com/peers/peer0.pharmacy.chainhealth.com/tls/ca.crt
export PEER0_insurance_CA=${PWD}/artifacts/channel/crypto-config/peerOrganizations/insurance.chainhealth.com/peers/peer0.insurance.chainhealth.com/tls/ca.crt
export PEER0_ministryofhealth_CA=${PWD}/artifacts/channel/crypto-config/peerOrganizations/ministryofhealth.chainhealth.com/peers/peer0.ministryofhealth.chainhealth.com/tls/ca.crt
export PEER0_doctor_CA=${PWD}/artifacts/channel/crypto-config/peerOrganizations/doctor.chainhealth.com/peers/peer0.doctor.chainhealth.com/tls/ca.crt
export FABRIC_CFG_PATH=${PWD}/artifacts/channel/config/

export CHANNEL_NAME=chainhealth-channel

setGlobalsForOrderer(){
    export CORE_PEER_LOCALMSPID="OrdererMSP"
    export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/artifacts/channel/crypto-config/ordererOrganizations/chainhealth.com/orderers/orderer.chainhealth.com/msp/tlscacerts/tlsca.chainhealth.com-cert.pem
    export CORE_PEER_MSPCONFIGPATH=${PWD}/artifacts/channel/crypto-config/ordererOrganizations/chainhealth.com/users/Admin@chainhealth.com/msp
}

# Setting environment variables for Peer0pharmacy
setGlobalsForPeer0pharmacy(){
    export CORE_PEER_LOCALMSPID="PharmacyMSP"
    export CORE_PEER_TLS_ROOTCERT_FILE=$PEER0_pharmacy_CA
    export CORE_PEER_MSPCONFIGPATH=${PWD}/artifacts/channel/crypto-config/peerOrganizations/pharmacy.chainhealth.com/users/Admin@pharmacy.chainhealth.com/msp
    export CORE_PEER_ADDRESS=localhost:7051
}

# Setting environment variables for Peer1pharmacy
setGlobalsForPeer1pharmacy(){
    export CORE_PEER_LOCALMSPID="PharmacyMSP"
    export CORE_PEER_TLS_ROOTCERT_FILE=$PEER0_pharmacy_CA
    export CORE_PEER_MSPCONFIGPATH=${PWD}/artifacts/channel/crypto-config/peerOrganizations/pharmacy.chainhealth.com/users/Admin@pharmacy.chainhealth.com/msp
    export CORE_PEER_ADDRESS=localhost:8051
}

# Setting environment variables for Peer0insurance
setGlobalsForPeer0insurance(){
    export CORE_PEER_LOCALMSPID="InsuranceMSP"
    export CORE_PEER_TLS_ROOTCERT_FILE=$PEER0_insurance_CA
    export CORE_PEER_MSPCONFIGPATH=${PWD}/artifacts/channel/crypto-config/peerOrganizations/insurance.chainhealth.com/users/Admin@insurance.chainhealth.com/msp
    export CORE_PEER_ADDRESS=localhost:9051   
}

# Setting environment variables for Peer1insurance
setGlobalsForPeer1insurance(){
    export CORE_PEER_LOCALMSPID="InsuranceMSP"
    export CORE_PEER_TLS_ROOTCERT_FILE=$PEER0_insurance_CA
    export CORE_PEER_MSPCONFIGPATH=${PWD}/artifacts/channel/crypto-config/peerOrganizations/insurance.chainhealth.com/users/Admin@insurance.chainhealth.com/msp
    export CORE_PEER_ADDRESS=localhost:10051
}

setGlobalsForPeer0ministryofhealth(){
    export CORE_PEER_LOCALMSPID="MinistryofhealthMSP"
    export CORE_PEER_TLS_ROOTCERT_FILE=$PEER0_ministryofhealth_CA
    export CORE_PEER_MSPCONFIGPATH=${PWD}/artifacts/channel/crypto-config/peerOrganizations/ministryofhealth.chainhealth.com/users/Admin@ministryofhealth.chainhealth.com/msp
    export CORE_PEER_ADDRESS=localhost:12051 
}

# Setting environment variables for Peer1insurance
setGlobalsForPeer1ministryofhealth(){
    export CORE_PEER_LOCALMSPID="MinistryofhealthMSP"
    export CORE_PEER_TLS_ROOTCERT_FILE=$PEER0_ministryofhealth_CA
    export CORE_PEER_MSPCONFIGPATH=${PWD}/artifacts/channel/crypto-config/peerOrganizations/ministryofhealth.chainhealth.com/users/Admin@ministryofhealth.chainhealth.com/msp
    export CORE_PEER_ADDRESS=localhost:13051  
}

setGlobalsForPeer0doctor(){
    export CORE_PEER_LOCALMSPID="DoctorMSP"
    export CORE_PEER_TLS_ROOTCERT_FILE=$PEER0_doctor_CA
    export CORE_PEER_MSPCONFIGPATH=${PWD}/artifacts/channel/crypto-config/peerOrganizations/doctor.chainhealth.com/users/Admin@doctor.chainhealth.com/msp
    export CORE_PEER_ADDRESS=localhost:14051 
}

setGlobalsForPeer1doctor(){
    export CORE_PEER_LOCALMSPID="DoctorMSP"
    export CORE_PEER_TLS_ROOTCERT_FILE=$PEER0_doctor_CA
    export CORE_PEER_MSPCONFIGPATH=${PWD}/artifacts/channel/crypto-config/peerOrganizations/doctor.chainhealth.com/users/Admin@doctor.chainhealth.com/msp
    export CORE_PEER_ADDRESS=localhost:15051  
}

createChannel(){
    rm -rf ./channel-artifacts/*
    setGlobalsForPeer0pharmacy
    
    ./bin/peer channel create -o localhost:7050 -c $CHANNEL_NAME \
    --ordererTLSHostnameOverride orderer.chainhealth.com \
    -f ./artifacts/channel/${CHANNEL_NAME}.tx --outputBlock ./channel-artifacts/${CHANNEL_NAME}.block \
    --tls $CORE_PEER_TLS_ENABLED --cafile $ORDERER_CA
}

removeOldCrypto(){
    rm -rf ./api-1.4/crypto/*
    rm -rf ./api-1.4/fabric-client-kv-pharmacy/*
    rm -rf ./api-2.0/pharmacy-wallet/*
    rm -rf ./api-2.0/insurance-wallet/*
    rm -rf ./api-2.0/ministryofhealth-wallet/*
    rm -rf ./api-2.0/doctor-wallet/*
}


joinChannel(){
    setGlobalsForPeer0pharmacy
    ./bin/peer channel join -b ./channel-artifacts/$CHANNEL_NAME.block
    
    setGlobalsForPeer1pharmacy
    ./bin/peer channel join -b ./channel-artifacts/$CHANNEL_NAME.block
    
    setGlobalsForPeer0insurance
    ./bin/peer channel join -b ./channel-artifacts/$CHANNEL_NAME.block
    
    setGlobalsForPeer1insurance
    ./bin/peer channel join -b ./channel-artifacts/$CHANNEL_NAME.block

    setGlobalsForPeer0ministryofhealth
    ./bin/peer channel join -b ./channel-artifacts/$CHANNEL_NAME.block
    
    setGlobalsForPeer1ministryofhealth
    ./bin/peer channel join -b ./channel-artifacts/$CHANNEL_NAME.block

    setGlobalsForPeer0doctor
    ./bin/peer channel join -b ./channel-artifacts/$CHANNEL_NAME.block

    setGlobalsForPeer1doctor
    ./bin/peer channel join -b ./channel-artifacts/$CHANNEL_NAME.block
    
}

updateAnchorPeers(){
    setGlobalsForPeer0pharmacy
    ./bin/peer channel update -o localhost:7050 --ordererTLSHostnameOverride orderer.chainhealth.com -c $CHANNEL_NAME -f ./artifacts/channel/${CORE_PEER_LOCALMSPID}anchors.tx --tls $CORE_PEER_TLS_ENABLED --cafile $ORDERER_CA
    
    setGlobalsForPeer0insurance
    ./bin/peer channel update -o localhost:7050 --ordererTLSHostnameOverride orderer.chainhealth.com -c $CHANNEL_NAME -f ./artifacts/channel/${CORE_PEER_LOCALMSPID}anchors.tx --tls $CORE_PEER_TLS_ENABLED --cafile $ORDERER_CA

   setGlobalsForPeer0ministryofhealth
    ./bin/peer channel update -o localhost:7050 --ordererTLSHostnameOverride orderer.chainhealth.com -c $CHANNEL_NAME -f ./artifacts/channel/${CORE_PEER_LOCALMSPID}anchors.tx --tls $CORE_PEER_TLS_ENABLED --cafile $ORDERER_CA 

    setGlobalsForPeer0doctor
    ./bin/peer channel update -o localhost:7050 --ordererTLSHostnameOverride orderer.chainhealth.com -c $CHANNEL_NAME -f ./artifacts/channel/${CORE_PEER_LOCALMSPID}anchors.tx --tls $CORE_PEER_TLS_ENABLED --cafile $ORDERER_CA 
}

removeOldCrypto

echo "########## Sleeping for 3 seconds ##########"
sleep 3

createChannel

echo "########## Sleeping for 3 seconds ##########"
sleep 3

joinChannel

echo "########## Sleeping for 3 seconds ##########"
sleep 3

updateAnchorPeers
