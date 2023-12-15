# channel

## **peer channel create:**
This is the main command for creating a new channel in Hyperledger Fabric.

- **-o localhost:7050:** Specifies the address and port of the ordering service. In this case, it's set to `localhost:7050`.

- **-c $CHANNEL_NAME:** Specifies the name of the channel to be created. The channel name is stored in the variable `$CHANNEL_NAME`.

- **--ordererTLSHostnameOverride orderer.example.com:** Overrides the TLS hostname verification when communicating with the orderer. It specifies the TLS hostname to use when connecting to the orderer, in this case, `orderer.example.com`.

- **-f ./artifacts/channel/${CHANNEL_NAME}.tx:** Specifies the path to the channel configuration transaction file. The channel configuration is defined in a `.tx` file. The variable `$CHANNEL_NAME` is used to dynamically construct the path to the channel transaction file.

- **--outputBlock ./channel-artifacts/${CHANNEL_NAME}.block:** Specifies the file path where the channel creation block will be stored. The variable `$CHANNEL_NAME` is used to dynamically construct the path to the output block file.

- **--tls $CORE_PEER_TLS_ENABLED:** Indicates whether to use TLS for communication. The value of `$CORE_PEER_TLS_ENABLED` is used to determine whether TLS is enabled or not.

- **--cafile $ORDERER_CA:** Specifies the path to the certificate authority (CA) file for the orderer. This is the CA that issued the TLS certificates for the orderer. The variable `$ORDERER_CA` is used to dynamically construct the path to the CA file.

<br>
<br>
<br>
<br>
<br>
<br>


## Peer Channel Join Command

The `peer channel join` command is utilized to make Peer 0 of Org1 join a specific channel in Hyperledger Fabric.

## Command Components:

- **Command**: `peer channel join`
  - This is the command to make a peer join a channel in Hyperledger Fabric.

- **Block File Path**: `-b ./channel-artifacts/$CHANNEL_NAME.block`
  - Specifies the path to the block file that contains the configuration information for the channel.
  - The variable `$CHANNEL_NAME` is employed to dynamically construct the path to the block file.
  - The block file is typically generated during the channel creation process.

## Summary:

After setting the environment variables or configurations specific to Peer 0 of Org1 using `setGlobalsForPeer0Org1`, the `peer channel join` command is executed. This command is pivotal in the process of establishing a peer's participation in a Hyperledger Fabric channel. It achieves this by making the specified peer join the channel, with the necessary configuration information provided through the path to the channel block file.
