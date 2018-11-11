var Voting = artifacts.require("./Voting.sol");
module.exports = function(deployer) {
  deployer.deploy(Voting, ['Wolverine', 'Scotty', 'Spock', 'Deadpool', 'Harley Quinn'], 432000);
};
