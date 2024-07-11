# List all images
docker images --format '{{.Repository}}:{{.Tag}} {{.ID}}' | while read -r line; do
    image=$(echo $line | awk '{print $1}')
    id=$(echo $line | awk '{print $2}')
    case $image in
        hyperledger/fabric-ca:1.5|hyperledger/fabric-ca:1.5.9|hyperledger/fabric-ca:latest|\
        hyperledger/fabric-ca:1.5.8|hyperledger/fabric-tools:2.5|hyperledger/fabric-tools:2.5.4|\
        hyperledger/fabric-tools:latest|hyperledger/fabric-peer:2.5|hyperledger/fabric-peer:2.5.4|\
        hyperledger/fabric-peer:latest|hyperledger/fabric-orderer:2.5|hyperledger/fabric-orderer:2.5.4|\
        hyperledger/fabric-orderer:latest|hyperledger/fabric-ccenv:2.5|hyperledger/fabric-ccenv:2.5.4|\
        hyperledger/fabric-ccenv:latest|hyperledger/fabric-baseos:2.5|hyperledger/fabric-baseos:2.5.4|\
        hyperledger/fabric-baseos:latest|hyperledger/fabric-nodeenv:2.5|hyperledger/fabric-couchdb:0.4.22|frontend_prod|frontend_dev)
            # Keep these images
            ;;
        *)
            # Delete the rest
            docker rmi $id
            ;;
    esac
done

