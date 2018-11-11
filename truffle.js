// Allows us to use ES6 in our migrations and tests.
var HDWalletProvider = require("truffle-hdwallet-provider");

var infura_apikey = "1f842038843c4210b7705157c23fbee8";
var mnemonic = "some awesome mneumonic";

module.exports = {
  networks: {
    development: {
      host: 'localhost',
      port: 8545,
      network_id: '*',
      gas: 6600000
    },
    ropsten: {
        provider: new HDWalletProvider(mnemonic, 
                  "https://ropsten.infura.io/v3/" + infura_apikey),
        network_id: 3,
        gas: 400000
    }
  }
}
