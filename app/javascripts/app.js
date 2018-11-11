/* sources: https://codeburst.io/a-countdown-timer-in-pure-javascript-f3cdaae1a1a3
 *          https://medium.com/@mvmurthy/full-stack-hello-world-voting-ethereum-dapp-tutorial-part-1-40d2d0d807c2
 *          https://medium.com/@mvmurthy/full-stack-hello-world-voting-ethereum-dapp-tutorial-part-2-30b3d335aa1f
 */

// Import the page's CSS. Webpack will know what to do with it.
import "../stylesheets/app.css";

// Import libraries we need.
import { default as Web3} from 'web3';
import { default as contract } from 'truffle-contract'

import voting_artifacts from '../../build/contracts/Voting.json'

var Voting = contract(voting_artifacts);

var winner = {name: "nobody", votes: 0}; //store the winner with his name and votes

var votedFor; //store for which the user has voted

var votingStillOngoing =true; // check if the voting is still going on;

web3.currentProvider.enable();

window.removeVoteForCandidate  = (candidateId) => {
  try {
    $("#msg").html("Vote has been removed. The vote count will increment as soon as the vote is recorded on the blockchain. Please wait.")
    $("#candidate").val("");

    //try to remove vote for the candidate
    Voting.deployed().then((contractInstance) => {
      contractInstance.removeVoteForCandidate(candidateId, {gas: 140000, from: web3.eth.accounts[0]});
      votedFor = null;
    });
  } catch (err) {
    console.log(err);
  }
}

window.voteForCandidate = (candidateId) => {
  try {
    $("#msg").html("Vote has been submitted. The vote count will increment as soon as the vote is recorded on the blockchain. Please wait.")
    $("#candidate").val("");

    /* Voting.deployed() returns an instance of the contract. Every call
     * in Truffle returns a promise which is why we have used then()
     * everywhere we have a transaction call
     * and will vote for the candidate
     */
      if(votedFor == null){
      Voting.deployed().then((contractInstance) => {
      contractInstance.voteForCandidate(candidateId, {gas: 140000, from: web3.eth.accounts[0]}); 
      votedFor = candidateId;
    });
  }else {
    Voting.deployed().then((contractInstance) => {
      contractInstance.changeVoteForCandidate(candidateId, {gas: 140000, from: web3.eth.accounts[0]}); 
      votedFor = candidateId;
    });
  }
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
  // get the amount of candidates from within the contract and add them to the html table
  Voting.deployed().then((contractInstance) => {

    // refresh the candidates in case that the user has voted
   contractInstance.votedEvent().watch((error, result) => {
    contractInstance.viewVote().then((vote) => {
      addCandidates(contractInstance);
    });
  });

  // refresh the candidates in case that the user has removed is vote
  contractInstance.voteRemovedEvent().watch((error, result) => {
      addCandidates(contractInstance);
  });

  // refresh the candidates in case that the user has removed is vote
  contractInstance.votingEnd().then((end) => {
    countdown(parseInt(end)); 
  });

  // check if the user has already voted and add the candidates to the page
  contractInstance.viewVote().then((vote) => {
    if(vote != 0){
      votedFor = parseInt(vote);
    }else {
      votedFor = null;
    }
    console.log(vote, votedFor, parseInt(vote));
    addCandidates(contractInstance);
  });

});

});

// add the candidates to the page
function addCandidates(contractInstance) {
  contractInstance.candidatesCount().then((amountOfCandidates) => {
    $("#table-candidate").html("");
   for (var i = 1; i <= amountOfCandidates; i++) {
       contractInstance.candidates(i).then((candidate) => {
         let candidateId = parseInt(candidate[0]); //the id from the candidate
         let candidateName = candidate[1].toString(); //the name from the candidate
         let candidateVoteCount = parseInt(candidate[2]); // the amount of votes for the candidate

         if(!votingStillOngoing) {
           if(winner.votes < candidateVoteCount){
             winner.name = candidateName;
             winner.VoteCount = candidateVoteCount;
             $("#winner").html(winner.name + " has won!");
           }
         }
         if(candidateId === votedFor){
          var htmlString = "<tr><td>" + candidateName + "</td><td id='candidate-" 
          + candidateId + "'>" + candidateVoteCount + "</td><td>"
          + "<a href='#' class='voteButton btn btn-danger' onclick='removeVoteForCandidate(" + candidateId 
          + ")'>Remove vote</a></td></tr>";
         }else{
          var htmlString = "<tr><td>" + candidateName + "</td><td id='candidate-" 
          + candidateId + "'>" + candidateVoteCount + "</td><td>"
          + "<a href='#' class='voteButton btn btn-primary' onclick='voteForCandidate(" + candidateId 
          + ")'>Vote</a></td></tr>";
         }
         
         $("#table-candidate").append(htmlString);
       });
   }
  });
}

function countdown(endDate) {
  let days, hours, minutes, seconds;

  endDate = endDate * Math.pow(10, 3);
  if (isNaN(endDate)) {
	return;
  }
  
  var interval = setInterval(calculate, 1000);
  
  function calculate() {
    let startDate = new Date();
    startDate = startDate.getTime();
    
    let timeRemaining = parseInt((endDate - startDate) / 1000);
    
    if (timeRemaining >= 0) {
      days = parseInt(timeRemaining / 86400);
      timeRemaining = (timeRemaining % 86400);
      
      hours = parseInt(timeRemaining / 3600);
      timeRemaining = (timeRemaining % 3600);
      
      minutes = parseInt(timeRemaining / 60);
      timeRemaining = (timeRemaining % 60);
      
      seconds = parseInt(timeRemaining);
      
      $("#votingTime").html("Remaining voting time: " + parseInt(days, 10) + ":" + ("0" + hours).slice(-2) + ":" + ("0" + minutes).slice(-2) + ":" + ("0" + seconds).slice(-2));

    } else {
      clearInterval(interval);
      $("#votingTime").html("The voting has ended");
      onVotingEnd();
    }
  }
}

// show the winnner and disable voting on the front-end in case that the voting has ended
function onVotingEnd() {
 votingStillOngoing = false;
 Voting.deployed().then((contractInstance) => {
  addCandidates(contractInstance);
 });
}