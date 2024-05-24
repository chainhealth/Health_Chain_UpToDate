# This command is used to change the permission of files and directories
# -R is an option that stands for 'recursive'. It means changes will be applied to the specific directory and its subdirectories
# 0755 is the permission level admssion read and write permission
chmod -R 0755 ./crypto-config

# Delete existing artifacts
rm -rf ./crypto-config
rm genesis.block chainhealth-channel.tx
rm PharmacyMSPanchors.tx
rm InsuranceMSPanchors.tx
rm MinistryofhealthMSPanchors.tx
rm DoctorMSPanchors.tx
rm -rf ../../channel-artifacts/*

#Generate Crypto artifactes for organizations
../../bin/cryptogen generate --config=./crypto-config.yaml --output=./crypto-config/

echo "########## Crypto Materials are Generated ##########"
echo ""
echo ""
echo ""

# ###################### cinfigtx Part ###########################

# System channel
SYS_CHANNEL="sys-channel"

# channel name defaults to "mychannel"
CHANNEL_NAME="chainhealth-channel"

echo $CHANNEL_NAME

echo "########## Generating Gensis Block ##########"
# Generate System Genesis block
../../bin/configtxgen -profile OrdererGenesis -configPath . -channelID $SYS_CHANNEL  -outputBlock ./genesis.block
echo "########## Genesis Block Generated ##########"
echo ""
echo ""

echo "########## Creating Channel ##########"
# Generate channel configuration block
../../bin/configtxgen -profile BasicChannel -configPath . -outputCreateChannelTx ./chainhealth-channel.tx -channelID $CHANNEL_NAME
echo "########## Channel Created ##########"
echo ""
echo ""


echo "#######    Generating anchor peer update for PharmacyMSP  ##########"
# Generating Anchor Peer for org1
../../bin/configtxgen -profile BasicChannel -configPath . -outputAnchorPeersUpdate ./PharmacyMSPanchors.tx -channelID $CHANNEL_NAME -asOrg Pharmacy
echo "########## Anchor Peer for PharmacyMSP Created ##########"
echo ""
echo ""

echo "#######    Generating anchor peer update for InsuranceMSP  ##########"
# Generating Anchor Peer for org2
../../bin/configtxgen -profile BasicChannel -configPath . -outputAnchorPeersUpdate ./InsuranceMSPanchors.tx -channelID $CHANNEL_NAME -asOrg Insurance
echo "########## Anchor Peer for InsuranceMSP Created ##########"
echo ""
echo ""

echo "#######    Generating anchor peer update for MinistryofhealthMSP  ##########"
# Generating Anchor Peer for org3
../../bin/configtxgen -profile BasicChannel -configPath . -outputAnchorPeersUpdate ./MinistryofhealthMSPanchors.tx -channelID $CHANNEL_NAME -asOrg Ministryofhealth
echo "########## Anchor Peer for MinistryofhealthMSP Created ##########"
echo ""
echo ""

echo "#######    Generating anchor peer update for DoctorMSP  ##########"
# Generating Anchor Peer for org3
../../bin/configtxgen -profile BasicChannel -configPath . -outputAnchorPeersUpdate ./DoctorMSPanchors.tx -channelID $CHANNEL_NAME -asOrg Doctor
echo "########## Anchor Peer for DoctorMSP Created ##########"
echo ""
echo ""

echo "########## Configtxgen Part Finished ##########"

mkdir inspect-json

../../bin/configtxgen -inspectBlock ./genesis.block > inspect-json/genesis-block.json
../../bin/configtxgen -inspectChannelCreateTx ./chainhealth-channel.tx > inspect-json/channel-creation.json
echo "######## Inspect Saved ##########"
