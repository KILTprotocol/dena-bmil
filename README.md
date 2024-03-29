# DENA BMIL KILT EWF

This is the repo containing code for the DENA BMIL project.

## What should be achieved
- Make a general python script, which 
  - can generate a random, or
  - encrypt data and store it into a file
  - read an encrypted file and pass it to stdout
  - the decrypted contents should never touch the filesystem
- Make a nodejs server, which
  - imports the KILT sdk
  - checks, if a store file exists
    - if not -> get random from python script -> make new identity -> store it in an encrypted file
    - if it does exist -> decrypt file -> setup identity
  - Implements credential workflow

## How to use
- Local development
  - Use node v14
  - Install dependencies with `yarn install`
  - Use in development mode with `yarn start`
    - This will use a mock implementation of the zymkey cryto chip
- To use on OLI box
  - Make sure nodejs and yarn are installed
  - Make sure python3 is installed
  - Make sure, that zymkey libraries are installed
    - If not install them according to point 4 in the manual: https://community.zymbit.com/t/getting-started-zymkey4i-with-raspberry-pi/202
  - `yarn install` for dependencies
  - `yarn build` to build the application in production mode using zymkey crypto chip
  - `yarn serve` to run the application

## Trying it out

### General Setup
1. Make sure you have docker and docker-compose installed
2. Start services with `docker compose up -d`. This includes a dev blockchain node, the demo client and services needed for the demo client and message exchange
3. Open http://localhost:3000 to open the demo client
4. Add the Faucet account by going ot
  a. Click "Manage Identities"
  b. Click "Add Identity"
  c. Enter a name for the account, e.g. "Faucet"
  d. Check "Import Seed Phrase"
  e. Enter `receive clutch item involve chaos clutch furnace arrest claw isolate okay together` into the "Seed Phrase" field
  f. Click "Advanced Options"
  g. Select "ED25519" for the Signing Key Pair
  h. Click "Add" to add the Facuet Account to your Accounts
5. To generate the needed ctype, execute `npx ts-node generateCtype.ts`

### Attester Setup
1. Go to http://localhost:3000/, make a new identity "Bundesnetzagentur" and send some tokens from the Faucet account to it
2. Make another identity "Installateur" and also send some tokens to it
3. With the "Bundesnetzagentur" identity, go to "Delegations" and create a new Delegation on the "BMILInstallationCredential" ctype
4. Invite the "Installateur" identity ("Select action..."->"Invite contact") with attestation rights, switch to that identity and accept the invitation in the "Messages" tab
5. Switch to the "Bundesnetzagentur" identity (still in messages tab) and put the delegation on chain ("Create delegation")
6. Switch back to the "Installateur" identity (still in messages tab) and save the delegation
7. Go to the "Delegations" tab, open the correct delegation and note down the full root delegation hash (Right click on hash -> Inspect -> copy the hash from the title attribute )

### Application Setup
1. Open `src/utils/const.ts` and change the `BMILInstallationCredentialDelegationRootId` to the one noted down above
2. Copy `.env.example` to `.env` and change the variables as necessary (the default is ok for this tutorial)
1. Run the application (e.g. `yarn start` for the quick dev mode)
2. Generate an identity, by sending a POST request to http://localhost:3002/identity
3. Note down the address of the identity
4. Go to the demo-client and transfer some tokens to the identity
5. Send a POST request to http://localhost:3002/identity/register. This will register a DID for the identity
6. Note down the DID

### Credential Setup
1. Go to the demo-client
2. Add the DID above as a contact
3. With the "Installateur", go to "Contacts" and as the "action" next to the DID select "Submit Terms"
4. Select the "BMILInstallationCredential"
5. Click on "With prefilled claim" and fill in all the information, except `name` (If you have a `master_data.json` configured, you also don't need to fill in the device specific information)
6. As delegation, select the delegation saved in the "Attester Setup"
7. Click "Send Terms"
8. The application will receive a message
9. If all the details can be validated, it will automatically send a "request-attestation-for-claim" message back to the attester
10. If the `MASTER_DATA` env variable was provided, the application will try to extract device information out of the file and add it to the "Request For Attestation", before sending it back to the attesster
11. If the `BOX_NAME` env variable was provided, the application will add the info to the `name` field
11. In the demo-client as the "Installateur", go to "Messages", click on the message from the application, confirm the information and click on "Attest Claim". This will put the attestation on the chain and send a message back to the application
12. The application will receive the message with the attestation and saves it in its store
13. If a `EWF_URL` env variable was provided, it will convert the credential to a VC and send it to the EWF app

### Verification
For verification, register and copy the did of the application and add it as a new contact on the demo client under the `Contacts` tab. As "action" you can now choose "Request claims", selecting the correct ctype (In the example the `BMILInstallationCredential` ctype with the hash `0xf3f981d9ed4559d9303455826b06bc7048a76107d96185cc31e491cadeafec9e`) and wait for the application to respond.
You will get a message including the credential in the demo client under "Messages".
## API Documentation
To see the API documentation, run `yarn swagger` and go to http://localhost:3002/doc/.
Here you see the available endpoints and can call them directly via the swagger interface.
## Notes
### Setup
- Problems with expired GPG Key from zymkey
  - Needed to delete it and redownload it (https://community.zymbit.com/t/buster-repo-not-working-on-rpi4/776)

### Python Script
- Tried to get the fundamental python scripts to work
  - generating a random hex sequence
  - encrypting and decrypting a file
- Mostly figuring out `argparse`
- How to read and write stdout/stdin

### Nodejs server
- Having to manually install node 12 (`curl -sL https://deb.nodesource.com/setup_12.x | sudo -E bash -` & `sudo apt install -y nodejs`)
  - this also installs npm
- have to install yarn `npm install -g yarn` -> led to permission issue -> installed it with sudo
- install typescript and `ts-node-dev` -> configure package.json
- figuring out how to exchange data between node and python
