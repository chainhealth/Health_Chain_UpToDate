cd artifacts/channel

./create-artifacts.sh

cd ../

sudo docker-compose up -d

cd ../

./createChannel.sh
sleep 3

sudo docker ps

./deployChaincode.sh