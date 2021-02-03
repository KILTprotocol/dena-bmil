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

## How to use
- Local development
  - Use node v10 or v12
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