docker stop $(docker ps -a -q)

docker system prune -f

docker volume prune -f

cd ./artifacts/src/API/

rm -rf wallet