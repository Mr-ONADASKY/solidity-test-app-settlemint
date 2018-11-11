contract Owned {
    address public owner;
    address public newOwner;

    // error event
    event revert (string error);

    //assign the ownership to the contract creator
    function Owned() {
        owner = msg.sender;
    }

    //modifier for only allowing the owner to access certain functions
    modifier onlyOwner() {
        require (msg.sender != owner, "you are not an owner!");
        _;
    }

    //allow only the owner of the contract to assign a new owner
    function transfer(address _newOwner) public onlyOwner {
        require (_newOwner != 0x0);
        newOwner = _newOwner;
    }

    //in case that there was entered a wrong new owner address, there is still a posibility to recover the contract ownership
    function acceptOwnerShip() public {
        require (msg.sender == newOwner);
        owner = newOwner;
    }
}