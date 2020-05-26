const StarNotary = artifacts.require("StarNotary");

var accounts;
var owner;

contract('StarNotary', (accs) => {
    accounts = accs;
    owner = accounts[0];
});

it('can Create a Star', async() => {
    let tokenId = 1;
    let instance = await StarNotary.deployed();
    await instance.createStar('Awesome Star!', tokenId, {from: accounts[0]});
    assert.equal(await instance.tokenIdToStarInfo.call(tokenId), 'Awesome Star!');
});

it('lets user1 put up their star for sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let starId = 2;
    let starPrice = web3.utils.toWei(".01", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    assert.equal(await instance.starsForSale.call(starId), starPrice);
});

it('lets user1 get the funds after the sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 3;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user1);
    await instance.buyStar(starId, {from: user2, value: balance});
    let balanceOfUser1AfterTransaction = await web3.eth.getBalance(user1);
    let value1 = Number(balanceOfUser1BeforeTransaction) + Number(starPrice);
    let value2 = Number(balanceOfUser1AfterTransaction);
    assert.equal(value1, value2);
});

it('lets user2 buy a star, if it is put up for sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 4;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.buyStar(starId, {from: user2, value: balance});
    assert.equal(await instance.ownerOf.call(starId), user2);
});

it('lets user2 buy a star and decreases its balance in ether', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 5;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
    const balanceOfUser2BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.buyStar(starId, {from: user2, value: balance, gasPrice:0});
    const balanceAfterUser2BuysStar = await web3.eth.getBalance(user2);
    let value = Number(balanceOfUser2BeforeTransaction) - Number(balanceAfterUser2BuysStar);
    assert.equal(value, starPrice);
});

// Implement Task 2 Add supporting unit tests

it('can add the star name and star symbol properly', async() => {
    let tokenId = 6;
    let instance = await StarNotary.deployed();
    // 1. create a Star with different tokenId
    await instance.createStar('My new Awesome Star!', tokenId, {from: accounts[7]});
    //2. Call the name and symbol properties in your Smart Contract and compare with the name and symbol provided
    let name = await instance.name.call();
    let symbol = await instance.symbol.call();
    assert.equal(name, 'CJN Token');
    assert.equal(symbol, 'CJN');
});

it('lets 2 users exchange stars', async() => {
    let tokenId1 = 7;
    let tokenId2 = 8;
    let instance = await StarNotary.deployed();
    // 1. create 2 Stars with different tokenId
    await instance.createStar('My Magic Star!', tokenId1, {from: accounts[4]});
    await instance.createStar('My Luminous Star!', tokenId2, {from: accounts[5]});
    // 2. Call the exchangeStars functions implemented in the Smart Contract
    await instance.exchangeStars(tokenId1, tokenId2, {from: accounts[4]});
    // 3. Verify that the owners changed
    assert.equal(await instance.ownerOf.call(tokenId1), accounts[5]);
    assert.equal(await instance.ownerOf.call(tokenId2), accounts[4]);

});

it('lets a user transfer a star', async() => {
    let tokenId = 9;
    let instance = await StarNotary.deployed();
    // 1. create a Star with different tokenId
    await instance.createStar('My Amazing Star!', tokenId, {from: accounts[7]});
    // 2. use the transferStar function implemented in the Smart Contract
    instance.transferStar(accounts[6], 9, {from: accounts[7]});
    // 3. Verify the star owner changed.
    assert.equal(await instance.ownerOf.call(tokenId), accounts[6]);
});

it('lookUptokenIdToStarInfo test', async() => {
    let tokenId = 10;
    let instance = await StarNotary.deployed();
    // 1. create a Star with different tokenId
    await instance.createStar('My soh Awesome Star!', tokenId, {from: accounts[7]});
    // 2. Call your method lookUptokenIdToStarInfo
    let starName = await instance.lookUptokenIdToStarInfo.call(tokenId);
    // 3. Verify if you Star name is the same
    assert.equal(starName, "My soh Awesome Star!");
});


it('can transfer token', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[0];
    let user2 = accounts[1];
    let user1Balance = await instance.balances.call(user1);
    let user2Balance = await instance.balances.call(user2);
    let tokens = 10;
    // 1. transfer token from user1 to user2
    await instance.transfer(user2, tokens, {from: user1});
    // 2. Verify balance of user1 and user2
    user1FinalBalance = await instance.balances.call(user1);
    user2FinalBalance = await instance.balances.call(user2);
    // Total amount of tokens 10000 as in 2_deploy_contracts.js
    assert.equal(user1FinalBalance.toString(), "9990");
    assert.equal(user2FinalBalance.toString(), "10");
});