# Policies

<br>

## Roles and Permissions in Blockchain Network

"Readers," "writers," and "admins" refer to the roles or permissions associated with entities (users, organizations) in the blockchain network. These roles are often defined in the Membership Service Provider (MSP) configuration, which manages cryptographic identities and their roles within the network.

## Readers

- **Role:** Readers have the permission to query and read the data on the blockchain ledger.
- **Usage:** Entities with the "readers" role can retrieve information from the blockchain but do not have the permission to submit new transactions or modify the ledger. Readers are typically used for applications or users who need to access historical data or query the current state of the ledger.

## Writers

- **Role:** Writers have the permission to submit new transactions and update the state of the blockchain ledger.
- **Usage:** Entities with the "writers" role can actively participate in the blockchain network by submitting transactions. This role is essential for applications or users that need to make changes to the data stored on the ledger.

## Admins

- **Role:** Admins, or administrators, have the highest level of permissions within the network.
- **Usage:** Entities with the "admins" role typically have control over the overall network configuration, including the ability to add or remove organizations, define policies, and perform other administrative tasks. Admins have the authority to manage the blockchain network as a whole.

In the context of the provided policy snippet in your previous question, the policies for "readers," "writers," and "admins" are enforcing access control based on the possession of valid cryptographic signatures associated with the 'OrdererMSP' (Orderer Membership Service Provider) and specific roles within it. These roles help define who can read, write, or administer various aspects of the blockchain network.

## Hyperledger Fabric Policies

Hyperledger Fabric policies define the rules that determine which entities (users, organizations) have the authority to perform specific actions within the network. Policies are often associated with configuration items like channels, chaincode, and organizations. They play a crucial role in access control and permission management.

In the provided snippet, you have a set of policies specified for a certain configuration. Let's break down the policies:

### Readers, Writers, Admins Policies

#### Readers

- **Type:** Specifies the type of the policy, which is "Signature" in this case. This means that access is granted based on the possession of a valid cryptographic signature.
- **Rule:** Defines the rule for granting read access. The rule here is an "OR" condition, specifically `OR('OrdererMSP.member')`. This implies that if the entity's signature is associated with the 'OrdererMSP' and the entity is a member, they are granted read access.

#### Writers

- **Type:** Also "Signature," indicating that access is based on a valid cryptographic signature.
- **Rule:** The rule for granting write access is the same as for readers in this example, `OR('OrdererMSP.member')`. This means that entities with a valid signature associated with 'OrdererMSP' and being a member are granted write access.

#### Admins

- **Type:** Once again, "Signature."
- **Rule:** The rule for granting admin access is `OR('OrdererMSP.admin')`. This implies that entities with a valid signature associated with 'OrdererMSP' and having admin privileges are granted administrative access.

### Explanation

- The policies are enforcing access control based on the membership and administrative roles within the 'OrdererMSP' (Orderer Membership Service Provider) of the Hyperledger Fabric network.
- The use of "OR" conditions in the rules implies that any entity satisfying at least one of the specified conditions will be granted the corresponding access (read, write, or admin).
- These policies ensure that only entities with the required cryptographic signatures and the necessary roles within the 'OrdererMSP' can read, write, or administer the associated configuration.

**In summary, policies in Hyperledger Fabric define the access control rules, and in this context, the policies for readers, writers, and admins are based on the possession of valid cryptographic signatures associated with the 'OrdererMSP' and specific roles within it. These policies help secure and control access to various aspects of the blockchain network.**


<br>
<br>
<br>
<br>
<br>
<br>



# Capabilities in Hyperledger Fabric Network

The Capabilities section allows you to set version-specific requirements for different components of the Hyperledger Fabric network.

Each subsection (Channel, Orderer, and Application) defines capabilities specific to the corresponding component (channel, orderer, or peer).

The `V2_0` capability is specified as true in each subsection, indicating that the network components must support version 2.0 capabilities. This ensures that all components adhere to the compatibility requirements of version 2.0 of Hyperledger Fabric.

The comments in the configuration file provide additional context, stressing the importance of ensuring that all relevant components are at version 2.0.0 or later before enabling the corresponding capabilities.

## Summary

In summary, the Capabilities section ensures that the network components adhere to specified version-specific capabilities, promoting compatibility and proper functioning of the Hyperledger Fabric blockchain network.


<br>
<br>
<br>
<br>
<br>
<br>



# Application Defaults (`&ApplicationDefaults`)

- **Description:** This section defines default settings for the application side of the network.
- **Usage:** The `&ApplicationDefaults` syntax creates an anchor named `ApplicationDefaults`, which can be later referenced using the `*ApplicationDefaults` syntax. This is particularly useful for reusing or referencing these default settings in other parts of the configuration.

## Organizations

- **Description:** This section is intended to define the list of organizations participating on the application side of the network.
- **Usage:** The specific details of organizations participating in the application side haven't been provided in this snippet. Typically, this section would include information such as organization names, domains, and other relevant details.

## Policies

- **Description:** This section defines the set of policies for the application side of the network.
- **Usage:** Policies specify rules and permissions for different actions within the network. Here, you have policies for Readers, Writers, Admins, LifecycleEndorsement, and Endorsement. Each policy has a specified type (`ImplicitMeta`) and a rule that defines the conditions for satisfying the policy.
  - **Readers, Writers, Admins:**
    - These are standard policies defining who can read, write, and administer the network.
    - The `ImplicitMeta` type allows expressing policies using logical operators (`ANY`, `MAJORITY`).
  - **LifecycleEndorsement, Endorsement:**
    - Policies related to the endorsement of chaincode lifecycle and regular endorsements, respectively.
    - The `ImplicitMeta` type is used with a rule specifying the conditions for endorsement.

## Capabilities

- **Description:** This section specifies the capabilities required for the application side of the network.
- **Usage:** The `<<: *ApplicationCapabilities` syntax is a YAML alias/reference. It means that the contents of `ApplicationCapabilities` (defined elsewhere in the configuration) are merged into this section. This allows you to reuse and reference a set of predefined application capabilities.

## Explanation

- The `&ApplicationDefaults` anchor allows you to create a reference point for default settings, making it easy to reuse or reference them elsewhere in the configuration.
- The `Organizations` section is a placeholder for listing organizations participating on the application side. This typically includes details like organization names and domains.
- The `Policies` section defines access control policies for readers, writers, admins, and endorsement-related actions. The `ImplicitMeta` type enables expressing policies using logical conditions.
- The `Capabilities` section specifies the capabilities required for the application side of the network. The `<<` syntax allows for the reuse of predefined application capabilities.

**In summary, this configuration snippet provides a foundation for setting defaults, defining policies, and specifying capabilities for the application side of the Hyperledger Fabric network, with an emphasis on modularity and reuse. The use of anchors and references enhances the readability and maintainability of the configuration.**

<br>
<br>
<br>
<br>
<br>
<br>
