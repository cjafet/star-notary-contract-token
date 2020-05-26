pragma solidity >=0.4.24;

//Importing openzeppelin-solidity ERC-721 implemented Standard
import "../node_modules/openzeppelin-solidity/contracts/token/ERC721/ERC721.sol";

// StarNotary Contract declaration inheritance the ERC721 openzeppelin implementation
contract StarNotary is ERC721 {

    // Star data
    struct Star {
        string name;
    }

    // Implement Task 1 Add a name and symbol properties
    // name: Is a short name to your token
    string public constant name = "CJN Token";
    // symbol: Is a short string like 'USD' -> 'American Dollar'
    string public constant symbol = "CJN";
    uint8 public constant decimals = 1;
    uint _totalSupply;

    // mapping address to tokens
    mapping(address => uint256) public balances;
    // mapping the Star with the Owner Address
    mapping(uint256 => Star) public tokenIdToStarInfo;
    // mapping the TokenId and price
    mapping(uint256 => uint256) public starsForSale;

    event Transfer(address indexed from, address indexed to, uint tokens);

    constructor(uint amount) public {
        _totalSupply = amount;
        // accessing the mapping of the msg.sender address and setting all the initial supply to him
        // msg.sender is who created the contract
        balances[msg.sender] = amount;
    }

    function totalSupply() public view returns (uint256) {
        return _totalSupply;
    }

    function balanceOf(address tokenOwner) public view returns (uint balance) {
        return balances[tokenOwner];
    }

    // Transfer the balance from owner's account to another account
    // Decreases the balance of "from" account
    // Increases the balance of "to" account
    // Emits Transfer event
    function transfer(address to, uint tokens) public returns (bool success) {
        if(tokens < 1){
            revert("Not enough Ether provided.");
        }
        // the require statement it to make sure that the sender's account's balance
        // is greater than the value of the tokens that need to be sent to the "to" account.
        require(tokens <= balances[msg.sender], "Unavailable tokens");
        balances[msg.sender] = balances[msg.sender] - tokens;
        balances[to] = balances[to] + tokens;
        emit Transfer(msg.sender, to, tokens);
        return true;
    }

    // Create Star using the Struct
    function createStar(string memory _name, uint256 _tokenId) public { // Passing the name and tokenId as a parameters
        Star memory newStar = Star(_name); // Star is an struct so we are creating a new Star
        tokenIdToStarInfo[_tokenId] = newStar; // Creating in memory the Star -> tokenId mapping
        _mint(msg.sender, _tokenId); // _mint assign the the star with _tokenId to the sender address (ownership)
    }

    // Putting an Star for sale (Adding the star tokenid into the mapping starsForSale, first verify that the sender is the owner)
    function putStarUpForSale(uint256 _tokenId, uint256 _price) public {
        require(ownerOf(_tokenId) == msg.sender, "You can't sale the Star you don't owned");
        starsForSale[_tokenId] = _price;
    }


    // Function that allows you to convert an address into a payable address
    function _make_payable(address x) internal pure returns (address payable) {
        return address(uint160(x));
    }

    function buyStar(uint256 _tokenId) public  payable {
        require(starsForSale[_tokenId] > 0, "The Star should be up for sale");
        uint256 starCost = starsForSale[_tokenId];
        address ownerAddress = ownerOf(_tokenId);
        require(msg.value > starCost, "You need to have enough Ether");
        // We can't use _addTokenTo or_removeTokenFrom functions, now we have to use _transferFrom
        _transferFrom(ownerAddress, msg.sender, _tokenId);
        // We need to make this conversion to be able to use transfer() function to transfer ethers
        address payable ownerAddressPayable = _make_payable(ownerAddress);
        ownerAddressPayable.transfer(starCost);
        if(msg.value > starCost) {
            msg.sender.transfer(msg.value - starCost);
        }
    }

    // Implement Task 1 lookUptokenIdToStarInfo
    function lookUptokenIdToStarInfo (uint _tokenId) public view returns (string memory) {
        //1. You should return the Star saved in tokenIdToStarInfo mapping
        return tokenIdToStarInfo[_tokenId].name;
    }

    // Implement Task 1 Exchange Stars function
    function exchangeStars(uint256 _tokenId1, uint256 _tokenId2) public {
        //1. Passing to star tokenId you will need to check if the owner of _tokenId1 or _tokenId2 is the sender
        //2. You don't have to check for the price of the token (star)
        //3. Get the owner of the two tokens (ownerOf(_tokenId1), ownerOf(_tokenId1)
        address owner1 = ownerOf(_tokenId1);
        address owner2 = ownerOf(_tokenId2);
        require(owner1 == msg.sender || owner2 == msg.sender, "You can't transfer the Star you don't owned");
        //4. Use _transferFrom function to exchange the tokens.
        _transferFrom(owner1, owner2, _tokenId1);
        _transferFrom(owner2, owner1, _tokenId2);
    }

    // Implement Task 1 Transfer Stars
    function transferStar(address _to1, uint256 _tokenId) public {
        //1. Check if the sender is the ownerOf(_tokenId)
        require(ownerOf(_tokenId) == msg.sender, "You can't transfer the Star you don't owned");
        //2. Use the transferFrom(from, to, tokenId); function to transfer the Star
        transferFrom(msg.sender, _to1, _tokenId);
    }


}