# Node Organizational Units (Node OUs) in Hyperledger Fabric

In Hyperledger Fabric, Node Organizational Units (Node OUs) represent different roles that nodes (orderers, peers, clients) can play within an organization. There are three primary Node OUs:

1. **Admins (OU):** Administrators have the highest level of privileges for tasks like adding or removing organizations, channels, and peers.
2. **Peers (OU):** Peers execute smart contracts, maintain the ledger, participate in consensus, and validate transactions.
3. **Clients (OU):** Clients interact with the network to submit transactions, query the ledger, and perform application-specific tasks.

## `EnableNodeOUs` in Cryptoconfig File

The `EnableNodeOUs` parameter in the cryptoconfig file enables or disables Node OUs within an organization. When set to `true`, it indicates that Node OUs are enabled, allowing for separate OUs for administrators, peers, and clients.

### When `EnableNodeOUs` is set to `true`:

- The organization has distinct OUs for administrators, peers, and clients.
- This enables finer-grained control over cryptographic materials and permissions for each node type.
- Separate cryptographic keys and certificates can be used for administrators, peers, and clients.

### When `EnableNodeOUs` is set to `false`:

- All nodes within the organization share the same cryptographic material.
- There is no cryptographic-level distinction between administrators, peers, and clients.

Enabling Node OUs provides a more secure and modular approach to managing identities within an organization. It allows for better control and separation of duties by having dedicated cryptographic material for different node roles.






























txt part to be converted to md

