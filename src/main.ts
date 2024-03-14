import { sender } from 'o1js/dist/node/lib/mina.js';
import { IncrementSecret } from './IncrementSecret.js';
import {
  Field,
  SmartContract,
  PrivateKey,
  Poseidon,
  AccountUpdate,
  Mina,
} from 'o1js';

const useProof = false;

const Local = Mina.LocalBlockchain({ proofsEnabled: useProof });
Mina.setActiveInstance(Local);

const { privateKey: deployerKey, publicKey: deployerAccount } =
  Local.testAccounts[0];
const { privateKey: senderKey, publicKey: senderAccount } =
  Local.testAccounts[1];

const salt = Field.random();
// ----------------------------------------------

// deploy destination
const zkAppPrivateKey = PrivateKey.random();
const zkAppAddress = zkAppPrivateKey.toPublicKey();

const zkAppInstance = new IncrementSecret(zkAppAddress);
const deployTxn = await Mina.transaction(deployerAccount, () => {
  AccountUpdate.fundNewAccount(deployerAccount);
  zkAppInstance.deploy();
  zkAppInstance.initState(salt,Field(750));
});
await deployTxn.prove();
await deployTxn.sign([deployerKey,zkAppPrivateKey]).send();

// get initial state

const num0 = zkAppInstance.x.get();
console.log("initial state: ", num0.toString());

// ----------------------------------------------

const txn1 = await Mina.transaction(senderAccount,()=>{
    zkAppInstance.incrementSecret(salt,Field(750));
});
await txn1.prove();
await txn1.sign([senderKey]).send();

// after txn1

const num1 = zkAppInstance.x.get();
console.log("state after txn1: ", num1.toString());

