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

presetup() {
    cd artifacts/src/chaincode-javascript
    npm install
    cd ../../..
}

CHANNEL_NAME="chainhealth-channel"
CC_RUNTIME_LANGUAGE="node"
VERSION="1.0"
CC_SRC_PATH="./artifacts/src/chaincode-javascript"
CC_NAME="chainHeath-ChainCode"
SEQUENCE=1

packageChaincode() {
    rm -rf ${CC_NAME}.tar.gz
    setGlobalsForPeer0pharmacy
    ./bin/peer lifecycle chaincode package ${CC_NAME}.tar.gz \
        --path ${CC_SRC_PATH}/ --lang ${CC_RUNTIME_LANGUAGE} \
        --label ${CC_NAME}_${VERSION}
    echo "===================== Chaincode is packaged on peer0.pharmacy ===================== "
}

installChaincode() {
    setGlobalsForPeer0pharmacy
    ./bin/peer lifecycle chaincode install ${CC_NAME}.tar.gz
    echo "===================== Chaincode is installed on peer0.pharmacy ===================== "

    setGlobalsForPeer1pharmacy
    ./bin/peer lifecycle chaincode install ${CC_NAME}.tar.gz
    echo "===================== Chaincode is installed on peer1.pharmacy ===================== "

    setGlobalsForPeer0insurance
    ./bin/peer lifecycle chaincode install ${CC_NAME}.tar.gz
    echo "===================== Chaincode is installed on peer0.insurance ===================== "

    setGlobalsForPeer1insurance
    ./bin/peer lifecycle chaincode install ${CC_NAME}.tar.gz
    echo "===================== Chaincode is installed on peer1.insurance ===================== "

    setGlobalsForPeer0ministryofhealth
    ./bin/peer lifecycle chaincode install ${CC_NAME}.tar.gz
    echo "===================== Chaincode is installed on peer0.ministryofhealth ===================== "

    setGlobalsForPeer1ministryofhealth
    ./bin/peer lifecycle chaincode install ${CC_NAME}.tar.gz
    echo "===================== Chaincode is installed on peer1.ministryofhealth ===================== "

    setGlobalsForPeer0doctor
    ./bin/peer lifecycle chaincode install ${CC_NAME}.tar.gz
    echo "===================== Chaincode is installed on peer0.doctor ===================== "

    setGlobalsForPeer1doctor
    ./bin/peer lifecycle chaincode install ${CC_NAME}.tar.gz
    echo "===================== Chaincode is installed on peer1.doctor ===================== "
}

queryInstalled() {
    setGlobalsForPeer0pharmacy
    ./bin/peer lifecycle chaincode queryinstalled >&log.txt
    cat log.txt
    PACKAGE_ID=$(sed -n "/${CC_NAME}_${VERSION}/{s/^Package ID: //; s/, Label:.*$//; p;}" log.txt)
    echo PackageID is ${PACKAGE_ID}
    echo "===================== Query installed successful on peer0.pharmacy on channel ===================== "
}

approveForMypharmacy() {
    setGlobalsForPeer0pharmacy
    ./bin/peer lifecycle chaincode approveformyorg -o localhost:7050 \
        --ordererTLSHostnameOverride orderer.chainhealth.com --tls \
        --cafile $ORDERER_CA --channelID $CHANNEL_NAME --name ${CC_NAME} --version ${VERSION} \
        --init-required --package-id ${PACKAGE_ID} \
        --sequence ${SEQUENCE}

    echo "===================== chaincode approved from Pharmacy Org ===================== "

}

approveForMyinsurance() {
    setGlobalsForPeer0insurance
    ./bin/peer lifecycle chaincode approveformyorg -o localhost:7050 \
        --ordererTLSHostnameOverride orderer.chainhealth.com --tls \
        --cafile $ORDERER_CA --channelID $CHANNEL_NAME --name ${CC_NAME} --version ${VERSION} \
        --init-required --package-id ${PACKAGE_ID} \
        --sequence ${SEQUENCE}

    echo "===================== chaincode approved from Insurance Org ===================== "

}

approveForMyministryofhealth() {
    setGlobalsForPeer0ministryofhealth
    ./bin/peer lifecycle chaincode approveformyorg -o localhost:7050 \
        --ordererTLSHostnameOverride orderer.chainhealth.com --tls \
        --cafile $ORDERER_CA --channelID $CHANNEL_NAME --name ${CC_NAME} --version ${VERSION} \
        --init-required --package-id ${PACKAGE_ID} \
        --sequence ${SEQUENCE}

    echo "===================== chaincode approved from Ministryofhealth Org ===================== "

}

approveForMydoctor() {
    setGlobalsForPeer0doctor
    ./bin/peer lifecycle chaincode approveformyorg -o localhost:7050 \
        --ordererTLSHostnameOverride orderer.chainhealth.com --tls \
        --cafile $ORDERER_CA --channelID $CHANNEL_NAME --name ${CC_NAME} --version ${VERSION} \
        --init-required --package-id ${PACKAGE_ID} \
        --sequence ${SEQUENCE}

    echo "===================== chaincode approved from Ministryofhealth Org ===================== "

}

checkCommitReadyness() {
    setGlobalsForPeer0pharmacy
    ./bin/peer lifecycle chaincode checkcommitreadiness \
        --channelID $CHANNEL_NAME --name ${CC_NAME} --version ${VERSION} \
        --sequence ${SEQUENCE} --output json --init-required
    echo "===================== checking commit readyness ===================== "
}

commitChaincodeDefination() {
    setGlobalsForPeer0pharmacy
    ./bin/peer lifecycle chaincode commit -o localhost:7050 --ordererTLSHostnameOverride orderer.chainhealth.com \
        --tls $CORE_PEER_TLS_ENABLED --cafile $ORDERER_CA \
        --channelID $CHANNEL_NAME --name ${CC_NAME} \
        --peerAddresses localhost:7051 --tlsRootCertFiles $PEER0_pharmacy_CA \
        --peerAddresses localhost:9051 --tlsRootCertFiles $PEER0_insurance_CA \
        --peerAddresses localhost:12051 --tlsRootCertFiles $PEER0_ministryofhealth_CA \
        --peerAddresses localhost:14051 --tlsRootCertFiles $PEER0_doctor_CA \
        --version ${VERSION} --sequence ${SEQUENCE} --init-required

    echo "===================== Committed Chaincode Definition ===================== "
}

queryCommitted() {
    setGlobalsForPeer0pharmacy
    ./bin/peer lifecycle chaincode querycommitted --channelID $CHANNEL_NAME --name ${CC_NAME}

    echo "===================== Query Committed Finished ===================== "
}

chaincodeInvokeInit() {
    setGlobalsForPeer0pharmacy
    ./bin/peer chaincode invoke -o localhost:7050 \
        --ordererTLSHostnameOverride orderer.chainhealth.com \
        --tls $CORE_PEER_TLS_ENABLED --cafile $ORDERER_CA \
        -C $CHANNEL_NAME -n ${CC_NAME} \
        --peerAddresses localhost:7051 --tlsRootCertFiles $PEER0_pharmacy_CA \
        --peerAddresses localhost:9051 --tlsRootCertFiles $PEER0_insurance_CA \
        --peerAddresses localhost:12051 --tlsRootCertFiles $PEER0_ministryofhealth_CA \
        --peerAddresses localhost:14051 --tlsRootCertFiles $PEER0_doctor_CA \
        --isInit -c '{"function":"InitLedger","Args":[]}'

    echo "===================== Chaincode Invoke Init Finished ===================== "
}

chaincodeQueryInit() {
    setGlobalsForPeer0pharmacy
    ./bin/peer chaincode query -C $CHANNEL_NAME -n ${CC_NAME} -c '{"Args":["getAllRecords"]}'

    echo "===================== Chaincode Query All Assets Finished ===================== "
}

getPatientRecordInsurance() {
    setGlobalsForPeer0insurance
    ./bin/peer chaincode query -C $CHANNEL_NAME -n ${CC_NAME} -c '{"function": "getPatientInfo","Args":["patient1"]}'
    
    echo "===================== Chaincode getPatientRecord Insurance Finished ===================== "
}

getPatientRecordPharmacy() {
    setGlobalsForPeer0pharmacy
    ./bin/peer chaincode query -C $CHANNEL_NAME -n ${CC_NAME} -c '{"function": "getPatientInfo","Args":["patient1"]}'
    
    echo "===================== Chaincode getPatientRecord Pharmacy Finished ===================== "
}

getPatientRecordDoctor() {
    setGlobalsForPeer0doctor
    ./bin/peer chaincode query -C $CHANNEL_NAME -n ${CC_NAME} -c '{"function": "getPatientInfo","Args":["patient1"]}'
    
    echo "===================== Chaincode getPatientRecord doctor Finished ===================== "
}


getPatientRecordMOH() {
    setGlobalsForPeer0ministryofhealth
    ./bin/peer chaincode query -C $CHANNEL_NAME -n ${CC_NAME} -c '{"function": "getPatientInfo","Args":["patient1"]}'
    
    echo "===================== Chaincode getPatientRecord MOH Finished ===================== "
}

getPatientRecordPatientError() {
    setGlobalsForPeer0ministryofhealth
    ./bin/peer chaincode query -C $CHANNEL_NAME -n ${CC_NAME} -c '{"function": "getPatientInfo","Args":["ph5"]}'
    
    echo "===================== Chaincode getPatientRecord Patient Error Finished ===================== "
}

writePatientPrescription() {
    setGlobalsForPeer0doctor
    ./bin/peer chaincode invoke -o localhost:7050 \
        --ordererTLSHostnameOverride orderer.chainhealth.com \
        --tls $CORE_PEER_TLS_ENABLED --cafile $ORDERER_CA \
        -C $CHANNEL_NAME -n ${CC_NAME} \
        --peerAddresses localhost:7051 --tlsRootCertFiles $PEER0_pharmacy_CA \
        --peerAddresses localhost:9051 --tlsRootCertFiles $PEER0_insurance_CA \
        --peerAddresses localhost:12051 --tlsRootCertFiles $PEER0_ministryofhealth_CA \
        --peerAddresses localhost:14051 --tlsRootCertFiles $PEER0_doctor_CA \
        -c '{"function": "writePatientPrescription","Args":["patient1", "Dr. Smith", "Aspirin,Ibuprofen,Acetaminophen"]}'

    echo "===================== Chaincode writePatientPrescription Finished ===================== "
}

getPharmacyRecordError() {
    setGlobalsForPeer0doctor
    ./bin/peer chaincode query -C $CHANNEL_NAME -n ${CC_NAME} -c '{"function": "getPharmacyInfo","Args":["pharmacy1"]}'
    
    echo "===================== Chaincode getPharmacyRecordError Patient Error Finished ===================== "
}

getPharmacyRecord() {
    setGlobalsForPeer0ministryofhealth
    ./bin/peer chaincode query -C $CHANNEL_NAME -n ${CC_NAME} -c '{"function": "getPharmacyInfo","Args":["pharmacy1"]}'
    
    echo "===================== Chaincode getPharmacyRecord Finished ===================== "
}

confirmPrescriptionSalePharmacyError1() {
    setGlobalsForPeer0ministryofhealth
    ./bin/peer chaincode query -C $CHANNEL_NAME -n ${CC_NAME} -c '{"function": "confirmPrescriptionSale","Args":["patient1", "pharmacy1", "pres4"]}'
    
    echo "===================== Chaincode confirmPrescriptionSalePharmacyError1 Finished ===================== "
}

confirmPrescriptionSalePharmacy() {
    setGlobalsForPeer0pharmacy
    ./bin/peer chaincode invoke -o localhost:7050 \
        --ordererTLSHostnameOverride orderer.chainhealth.com \
        --tls $CORE_PEER_TLS_ENABLED --cafile $ORDERER_CA \
        -C $CHANNEL_NAME -n ${CC_NAME} \
        --peerAddresses localhost:7051 --tlsRootCertFiles $PEER0_pharmacy_CA \
        --peerAddresses localhost:9051 --tlsRootCertFiles $PEER0_insurance_CA \
        --peerAddresses localhost:12051 --tlsRootCertFiles $PEER0_ministryofhealth_CA \
        --peerAddresses localhost:14051 --tlsRootCertFiles $PEER0_doctor_CA \
        -c '{"function": "confirmPrescriptionSale","Args":["patient1", "pharmacy1", "pres3"]}'

    echo "===================== Chaincode confirmPrescriptionSalePharmacy Finished ===================== "
}

confirmPrescriptionSalePatient() {
    setGlobalsForPeer0ministryofhealth
    ./bin/peer chaincode invoke -o localhost:7050 \
        --ordererTLSHostnameOverride orderer.chainhealth.com \
        --tls $CORE_PEER_TLS_ENABLED --cafile $ORDERER_CA \
        -C $CHANNEL_NAME -n ${CC_NAME} \
        --peerAddresses localhost:7051 --tlsRootCertFiles $PEER0_pharmacy_CA \
        --peerAddresses localhost:9051 --tlsRootCertFiles $PEER0_insurance_CA \
        --peerAddresses localhost:12051 --tlsRootCertFiles $PEER0_ministryofhealth_CA \
        --peerAddresses localhost:14051 --tlsRootCertFiles $PEER0_doctor_CA \
        -c '{"function": "confirmPrescriptionSale","Args":["patient1", "pharmacy1", "pres3"]}'

    echo "===================== Chaincode confirmPrescriptionSalePatient Finished ===================== "
}

loginError() {
    setGlobalsForPeer0ministryofhealth
    ./bin/peer chaincode query -C $CHANNEL_NAME -n ${CC_NAME} -c '{"function": "login","Args":["patient1", "seif1234"]}'
    
    echo "===================== Chaincode loginError Finished ===================== "
}

loginSuccess() {
    setGlobalsForPeer0ministryofhealth
    ./bin/peer chaincode query -C $CHANNEL_NAME -n ${CC_NAME} -c '{"function": "login","Args":["patient1", "patient12345"]}'
    
    echo "===================== Chaincode loginSuccess Finished ===================== "
}

presetup
sleep 3

packageChaincode
sleep 3

installChaincode
sleep 3

queryInstalled
sleep 3

approveForMypharmacy
sleep 3

approveForMyinsurance
sleep 3

approveForMyministryofhealth
sleep 3

approveForMydoctor
sleep 3

checkCommitReadyness
sleep 3

commitChaincodeDefination
sleep 3

queryCommitted
sleep 3

chaincodeInvokeInit
sleep 5

echo ""
chaincodeQueryInit

echo "===================== Finished Program ===================== " 
