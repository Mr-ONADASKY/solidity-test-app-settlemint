/*sources: dappuniversity https://github.com/dappuniversity/election
            https://ethereum.stackexchange.com/questions/2519/how-to-convert-a-bytes32-to-string
            https://medium.com/@mvmurthy/full-stack-hello-world-voting-ethereum-dapp-tutorial-part-1-40d2d0d807c2
            https://medium.com/@mvmurthy/full-stack-hello-world-voting-ethereum-dapp-tutorial-part-2-30b3d335aa1f
*/
pragma solidity ^0.4.24; //We have to specify what version of compiler this code will use

contract Voting {

      //Model for candidate
      struct Candidate {
        uint id;        //the id from the candidate
        string name;     //the namefrom the candidate
        uint voteCount;   //the amount of votes for each candidate
      }

      //Store accounts that have voted 
      mapping(address => bool) public voters;

      //Store Candidates
      mapping(uint => Candidate) public candidates;

      //Store the amount of candidates
      uint public candidatesCount;

      // voted event
      event votedEvent (uint indexed _candidateId);

      // vote erased
      event voteRemovedEvent (uint indexed _candidateId);

      // vote changed
      event voteChanged (uint indexed _oldCandidateId, uint indexed _candidateId);

      // error event
      event revert (string error);

      // constructor for the voting contract
      function Voting (bytes32[] candidateNames) public {
        uint candidateNamesLength = candidateNames.length;
           for(uint index = 0; index < candidateNamesLength; index++){    
            string memory candidateNameString =  convertBytes32ToString(candidateNames[index]); //since there's no native support we need to convert this to strings
            addCandidate(candidateNameString);
          }
      }

    // convert the bytes32 to strings
    function convertBytes32ToString(bytes32 bytes32String) private returns(string){
      bytes memory bytesArray = new bytes(32);
      for (uint256 i; i < 32; i++) {
        bytesArray[i] = bytes32String[i];
      }
      return string(bytesArray);
    }
    
    // add a candidate
    function addCandidate (string _name) private{
        candidates[candidatesCount] = Candidate(candidatesCount, _name, 0);
        candidatesCount ++;
    }

    // vote for the candidate
    function voteForCandidate (uint _candidateId) public {
        // require that they haven't voted before
        require(!voters[msg.sender], "You have already voted!");

        // require a valid candidate
        require(_candidateId > 0 && _candidateId <= candidatesCount);

        // record that voter has voted
        voters[msg.sender] = true;

        // update candidate vote Count
        candidates[_candidateId].voteCount++;

        // trigger voted event
        votedEvent(_candidateId);
    } 

    // remove the vote
    function removeVote(uint _candidateId) public {
      //require that they have already voted
      require(voters[msg.sender], "You haven't voted yet!");

      // require a valid candidate
      require(_candidateId > 0 && _candidateId <= candidatesCount);

      //reduce the vote count from the candidate
      candidates[_candidateId].voteCount--;

      // delete the votecount from the sender to allow to revote
      delete voters[msg.sender];

      //trigger the vote removed event
      voteRemovedEvent(_candidateId);
    }

    // change vote
    function changeVote(uint _oldCandidateId, uint _candidateId) {
      //require that they have already voted
      require(voters[msg.sender], "You haven't voted yet!");

       // require a valid candidate to remove vote from
      require(_oldCandidateId > 0 && _oldCandidateId <= candidatesCount);

       // require a valid candidate to vote for
      require(_candidateId > 0 && _candidateId <= candidatesCount);

      // reduce the votes from the previous candidate on which the user voted on
      candidates[_oldCandidateId].voteCount--;

      // increase the votes from the new candidate on which the user wants to vote
      candidates[_candidateId].voteCount++;
    }
}



