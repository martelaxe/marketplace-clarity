import { Cl } from '@stacks/transactions';
import { ChainID } from '@stacks/transactions/dist';
import { describe, expect, it, beforeAll } from 'vitest';

const accounts = simnet.getAccounts();
const wallet1 = accounts.get('wallet_1')!;

describe('test `create-collection` function in `marketplace` contract', () => {
  let contractAddress: string;


  beforeAll(async () => {
    // Deploy the NFT contract


    // Initialize the contract to define it as a finite collection


  });


  it('Finite collection full flow ', async () => {

    const contractName = 'sip009-nft';
    const contractContent = await simnet.getContractSource(contractName); // Retrieve the contract's source
    const senderAddress = wallet1;

    // Deploy the contract using the retrieved source code
    const deployResult = await simnet.deployContract(contractName, contractContent as string, null, senderAddress);
    contractAddress = `${senderAddress}.${contractName}`;


    // Initialize the contract to define it as a finite collection
    const initResponse = await simnet.callPublicFn(contractAddress, 'initialize-minting-parameters', [
      Cl.bool(true), // is-finite
      Cl.some(Cl.uint(2)) // max-mints
    ], wallet1);


    const isFinite = await simnet.callReadOnlyFn(contractAddress, 'get-is-finite', [], wallet1);
    const maxMints = await simnet.callReadOnlyFn(contractAddress, 'get-max-mints', [], wallet1);

    // Expect the collection to be finite and the max mints to be set to 100
    expect(isFinite.result.value).toEqual(Cl.bool(true));
    expect(maxMints.result.value).toEqual(Cl.some(Cl.uint(2)));


    // Whitelist the NFT contract
    const whitelistResponse = await simnet.callPublicFn('marketplace', 'set-whitelisted', [
      Cl.principal(contractAddress),
      Cl.bool(true)
    ], simnet.deployer);

    expect(whitelistResponse.result.type).toBe(7)

    // Mint two NFTs
    const mintResponse1 = await simnet.callPublicFn(contractAddress, 'mint', [Cl.principal(wallet1)], wallet1);
    const mintResponse2 = await simnet.callPublicFn(contractAddress, 'mint', [Cl.principal(wallet1)], wallet1);


    const tokenID1 = mintResponse1.result.value.value;
    const tokenID2 = mintResponse2.result.value.value;
    // const currentEpochDecimal = await simnet.currentEpoch();

    // const currentEpochInt = Math.floor(currentEpochDecimal);

    // const expiryBlock = currentEpochInt + 50; // Set the expiry block to 50 blocks from the current epoch

    const listAssetResponse1 = await simnet.callPublicFn('marketplace', 'list-asset', [
      Cl.principal(contractAddress),
      Cl.tuple({
        taker: Cl.none(),
        "token-id": Cl.uint(tokenID1),
        expiry: Cl.uint(99999999),
        price: Cl.uint(1000),
        "payment-asset-contract": Cl.none()
      })
    ], wallet1);
    
    

  });


  it('successfully creates an infinite collection', async () => {

    const contractName = 'sip009-nft';
    const contractContent = await simnet.getContractSource(contractName); // Retrieve the contract's source
    const senderAddress = wallet1;

    // Deploy the contract using the retrieved source code
    const deployResult = await simnet.deployContract(contractName, contractContent as string, null, senderAddress);
    contractAddress = `${senderAddress}.${contractName}`;


    // Initialize the contract to define it as a finite collection
    const initResponse = await simnet.callPublicFn(contractAddress, 'initialize-minting-parameters', [
      Cl.bool(true), // is-finite
      Cl.some(Cl.uint(100)) // max-mints
    ], wallet1);


    const isFinite = await simnet.callReadOnlyFn(contractAddress, 'get-is-finite', [], wallet1);
    const maxMints = await simnet.callReadOnlyFn(contractAddress, 'get-max-mints', [], wallet1);

    // Expect the collection to be finite and the max mints to be set to 100
    expect(isFinite.result.value).toEqual(Cl.bool(true));
    expect(maxMints.result.value).toEqual(Cl.some(Cl.uint(100)));
  });


  // Check the response from initialization to ensure it was successful
  // expect(initResponse.result).toBeOk();

  // it('successfully creates a finite collection', () => {
  //   const createCollectionResponse = simnet.callPublicFn('marketplace', 'create-collection', [
  //     Cl.bool(true), // is-finitef
  //     Cl.some(Cl.uint(100)), // max-mints
  //   ], wallet1);

  //   const collectionId = createCollectionResponse.result.value.value; // Direct access to BigInt value
  //   expect(collectionId).toBe(0n); // Asserting the collection ID is 0

  //   // expect(createCollectionResponse.result.toEqual(CI.ok(createCollectionResponse.result.value))

  //   console.log("creation result", createCollectionResponse.result);
  //   console.log("OK", Cl.ok(createCollectionResponse.result.value));

  //   const collection = simnet.getMapEntry('marketplace', 'collections', Cl.uint(collectionId));
  //   expect(collection).toBeDefined();
  //   expect(collection.value.data['is-finite']).toEqual(Cl.bool(true))
  //   expect(collection.value.data['max-mints'].value).toEqual(Cl.uint(100));
  // });

  // it('successfully creates an infinite collection', () => {
  //   const createCollectionResponse = simnet.callPublicFn('marketplace', 'create-collection', [
  //     Cl.bool(false), // is-finite
  //     Cl.none(), // max-mints
  //   ], wallet1);
  //   expect(createCollectionResponse.result.type).toBe(7);

  //   const collectionId = createCollectionResponse.result.value.value;
  //   expect(collectionId).toBe(0n); // Assuming this is the second collection created

  //   const collection = simnet.getMapEntry('marketplace', 'collections', Cl.uint(collectionId));
  //   expect(collection).toBeDefined();
  //   expect(collection.value.data['is-finite']).toEqual(Cl.bool(false))
  //   expect(collection.value.data['max-mints']).toEqual(Cl.none())
  // });
  // it('fails to create a finite collection without specifying max-mints', () => {
  //   const createCollectionResponse = simnet.callPublicFn('marketplace', 'create-collection', [
  //     Cl.bool(true), // is-finite
  //     Cl.none(), // max-mints, intentionally not provided
  //   ], wallet1);
  //   expect(createCollectionResponse.result).not.toBeOk(); // Expecting an error
  //   const errorCode = Cl.ok(createCollectionResponse.result);
  //   expect(errorCode.value.value).toEqual(Cl.uint(100)); // Error 100n 
  // });

  // it('successfully updates max-mints', async () => {

  //   simnet.callPublicFn('marketplace', 'create-collection', [
  //     Cl.bool(true), // is-finitef
  //     Cl.some(Cl.uint(100)), // max-mints
  //   ], wallet1);

  //   // Assuming the creation of a finite collection has already been tested and collectionId is 0
  //   let updateResponse = simnet.callPublicFn('marketplace', 'update-max-mints', [
  //     Cl.uint(0), // collection-id
  //     Cl.uint(200) // new-max-mints
  //   ], wallet1); // Assuming wallet1 is the owner

  //   expect(updateResponse.result.type).toBe(7); // Check if the operation was successful

  //   // Retrieve updated collection to verify new max-mints
  //   const collection = simnet.getMapEntry('marketplace', 'collections', Cl.uint(0));
  //   expect(collection.value.data['max-mints'].value).toEqual(Cl.uint(200));
  // });

  // it('fails to update max-mints by a non-owner', async () => {

  //   simnet.callPublicFn('marketplace', 'create-collection', [
  //     Cl.bool(true), // is-finitef
  //     Cl.some(Cl.uint(100)), // max-mints
  //   ], wallet1);
  //   const nonOwner = accounts.get('wallet_2')!; // Assuming a second account exists


  //   let updateResponse = simnet.callPublicFn('marketplace', 'update-max-mints', [
  //     Cl.uint(0), // collection-id
  //     Cl.uint(300) // new-max-mints attempted by non-owner
  //   ], nonOwner);

  //   expect(updateResponse.result.type).not.toBe(7); // Check if the operation was not successful
  //   const errorCode = Cl.ok(updateResponse.result);
  //   expect(errorCode.value.value).toEqual(Cl.uint(102)); // Error 102n   });
  // });

  // it('fails to update max-mints for an infinite collection', async () => {
  //   // Assuming an infinite collection has been created previously with a collectionId of 1
  //   simnet.callPublicFn('marketplace', 'create-collection', [
  //     Cl.bool(false), // is-finite
  //     Cl.none(), // max-mints
  //   ], wallet1);


  //   let updateResponse = simnet.callPublicFn('marketplace', 'update-max-mints', [
  //     Cl.uint(0), // collection-id for an infinite collection
  //     Cl.uint(300) // new-max-mints attempted by non-owner
  //   ], wallet1);

  //   expect(updateResponse.result.type).not.toBe(7); // Expect the operation to fail
  //   const errorCode = Cl.ok(updateResponse.result);

  //   expect(errorCode.value.value).toEqual(Cl.uint(103)); // Error 103n   });
  // });


  // it.only('successfully lists an NFT for sale', async () => {

  //   //DEPLOYING A NEW NFT CONTRACT

  //   const contractName = 'sip009-nft';
  //   const contractContent = simnet.getContractSource(contractName); // This should retrieve the contract's source
  //   const senderAddress = wallet1;

  //   // deploy the contract using the retrieved source code
  //   simnet.deployContract(contractName, contractContent as string, null, senderAddress);

  //   const contractAddress = `${wallet1}.${contractName}`;


  //   const mintNftResponse = simnet.callPublicFn(contractAddress, 'mint', [
  //     Cl.principal(wallet1)
  //   ], wallet1);

  //   const nftCreated = mintNftResponse.result.value;


  //   // Construct the contract address


  //   // Mint tokens to wallet1 for use as payment
  //   simnet.callPublicFn('sip010-token', 'mint', [
  //     Cl.uint(1000),
  //     Cl.principal(wallet1)
  //   ], wallet1);


  //   //White list the NFT address
  //   const whitelistResponse = simnet.callPublicFn('marketplace', 'set-whitelisted', [
  //     Cl.principal(contractAddress),
  //     Cl.bool(true) // true to whitelist, false to remove from whitelist
  //   ], simnet.deployer);

  //   expect(whitelistResponse.result.type).toBe(7);




  // });


});





// const contractName = 'sip009-nft';
// const contractContent = simnet.getContractSource(contractName); // This should retrieve the contract's source
// const senderAddress = simnet.deployer;

// // Now, deploy the contract using the retrieved source code
// const deployResult = simnet.deployContract(contractName, contractContent, null, senderAddress);

// // Check the deploy result
// console.log(deployResult);