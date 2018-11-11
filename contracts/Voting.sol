/* sources: dappuniversity https://github.com/dappuniversity/election
 *          https://ethereum.stackexchange.com/questions/2519/how-to-convert-a-bytes32-to-string
 *          https://medium.com/@mvmurthy/full-stack-hello-world-voting-ethereum-dapp-tutorial-part-1-40d2d0d807c2
 *          https://medium.com/@mvmurthy/full-stack-hello-world-voting-ethereum-dapp-tutorial-part-2-30b3d335aa1f
*/
pragma solidity ^0.4.24; //We have to specify what version of compiler this code will use

contract Voting {

      //Store when the voting ends
      uint public votingEnd;

      //Store the amount of candidates
      uint public candidatesCount;

      //Model for candidate
      struct Candidate {
        uint id;        //the id from the candidate
        string name;     //the namefrom the candidate
        uint voteCount;   //the amount of votes for each candidate
      }

      //Store which account voted on who
      mapping(address => uint) public voters;

      //Store Candidates
      mapping(uint => Candidate) public candidates;

      // voted event
      event votedEvent (uint _candidateId);

      // vote erased
      event voteRemovedEvent (uint indexed _candidateId);

      // error event
      event revert (string error);

      // constructor for the voting contract
      function Voting (bytes32[] candidateNames, uint voteEndsWithin) public {
        votingEnd = now + voteEndsWithin;
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
        candidatesCount ++;
        candidates[candidatesCount] = Candidate(candidatesCount, _name, 0);
    }

    // vote for the candidate
    function voteForCandidate (uint _candidateId) public {
        // require that the voting hasn't ended yet
        require(votingEnd > now);

        // require that they haven't voted before
        require(voters[msg.sender] == 0, "You have already voted!");

        // require a valid candidate
        require(_candidateId > 0 && _candidateId <= candidatesCount);
        
        //record on who they voted
        voters[msg.sender] = _candidateId;

        // update candidate vote Count
        candidates[_candidateId].voteCount++;

        // trigger vote event
        votedEvent(_candidateId);
    } 

    // remove the vote
    function removeVoteForCandidate(uint _candidateId) public {
      // require that the voting hasn't ended yet
      require(votingEnd > now);

      //require that they have already voted
      require(voters[msg.sender] != 0, "You haven't voted yet!");

      // require a valid candidate
      require(_candidateId > 0 && _candidateId <= candidatesCount);

      // require that the candidate has voted for that candidate
      require(voters[msg.sender] == _candidateId);

      // reduce the vote count from the candidate
      candidates[_candidateId].voteCount--;

      // delete his old vote
      delete voters[msg.sender];

      //trigger the vote removed event
      voteRemovedEvent(_candidateId);
    }

    // change vote
    function changeVoteForCandidate(uint _candidateId) {
      // require that the voting hasn't ended yet
      require(votingEnd > now);

      //require that they have already voted
      require(voters[msg.sender] != 0, "You haven't voted yet!");

       // require a valid candidate to vote for
      require(_candidateId > 0 && _candidateId <= candidatesCount);

      // reduce the votes from the previous candidate on which the user voted on
      candidates[voters[msg.sender]].voteCount--;

      // increase the votes from the new candidate on which the user wants to vote
      candidates[_candidateId].voteCount++;

      // record that voter has voted
        voters[msg.sender] = _candidateId;

      // trigger the vote event
        votedEvent(_candidateId);
    }

    function viewVote() public view returns (uint){
        return voters[msg.sender];
    }
}



