sudo docker stop $(sudo docker ps -a -q)

sudo docker system prune -f

sudo docker volume prune -f

./clean_docker_images.sh

rm -rf ./chainHeath-ChainCode.tar.gz

rm -rf ./artifacts/src/API/wallet

rm -rf ./artifacts/channel/crypto-config

rm -rf ./artifacts/channel/chainhealth-channel.tx

rm -rf ./artifacts/channel/DoctorMSPanchors.tx

rm -rf ./artifacts/channel/genesis.block

rm -rf ./artifacts/channel/InsuranceMSPanchors.tx

rm -rf ./artifacts/channel/MinistryofhealthMSPanchors.tx

rm -rf ./artifacts/channel/PharmacyMSPanchors.tx

rm -rf ./artifacts/channel/inspect-json

rm -rf ./artifacts/src/chaincode-javascript/node_modules