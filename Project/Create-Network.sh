./stopNetwork.sh

[ ! -d bin ] && ./install-fabric.sh --fabric-version 2.5.4 b

./install-fabric.sh --fabric-version 2.5.4 d

cd artifacts/channel

./create-artifacts.sh

cd ../

sudo docker-compose up -d

cd ../

./createChannel.sh
sleep 3

sudo docker ps

./deployChaincode.sh

cd ./artifacts/src/API

npm install

./addUsers.sh

node API.js