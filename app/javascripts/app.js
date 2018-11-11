// Import the page's CSS. Webpack will know what to do with it.
import "../stylesheets/app.css";

// Import libraries we need.
import { default as Web3} from 'web3';
import { default as contract } from 'truffle-contract'

/*
 * When you compile and deploy your Voting contract,
 * truffle stores the abi and deployed address in a json
 * file in the build directory. We will use this information
 * to setup a Voting abstraction. We will use this abstraction
 * later to create an instance of the Voting contract.
 * Compare this against the index.js from our previous tutorial to see the difference
 * https://gist.github.com/maheshmurthy/f6e96d6b3fff4cd4fa7f892de8a1a1b4#file-index-js
 */

import voting_artifacts from '../../build/contracts/Voting.json'

var Voting = contract(voting_artifacts);

var candidates = [];

window.voteForCandidate = (candidateId) => {
  try {
    $("#msg").html("Vote has been submitted. The vote count will increment as soon as the vote is recorded on the blockchain. Please wait.")
    $("#candidate").val("");

    /* Voting.deployed() returns an instance of the contract. Every call
     * in Truffle returns a promise which is why we have used then()
     * everywhere we have a transaction call
     */
    Voting.deployed().then((contractInstance) => {
      contractInstance.voteForCandidate(candidateId, {gas: 140000, from: web3.eth.accounts[0]});
    });
  } catch (err) {
    console.log(err);
  }
}

$( document ).ready(() => {
  if (typeof web3 !== 'undefined') {
    console.warn("Using web3 detected from external source like Metamask")
    // Use Mist/MetaMask's provider
    window.web3 = new Web3(web3.currentProvider);
  } else {
    window.alert("No metamask detected, please install metamask to use this DApp");
  }


  Voting.setProvider(web3.currentProvider);
  //get the amount of candidates from within the contract and add them to the html table
  Voting.deployed().then((contractInstance) => {
/*   contractInstance.votedEvent().watch((error, result) => {
      console.log(error, event);
  }); */

   contractInstance.candidatesCount.call().then((amountOfCandidates) => {
     console.log("amountOfCandidates");
    for (var i = 0; i < amountOfCandidates; i++) {
        contractInstance.candidates(i).then((candidate) => {
          let candidateId = candidate[0]; //the id from the candidate
          let candidateName = candidate[1].toString(); //the name from the candidate
          let candidateVoteCount = candidate[2]; // the amount of votes for the candidate
          var htmlString = "<tr><td>" + candidateName + "</td><td id='candidate-" 
                                + candidateId + "'>" + candidateVoteCount + "</td><td>"
                                + "<a href='#' onclick='voteForCandidate(" + candidateId 
                                + ")' class='btn btn-primary'>Vote</a></td></tr>";
          $("#table-candidate").append(htmlString);
          candidates[i] = candidateName; //store the candidate names in an array for easy access
        });
    }
   });
  });  
});
