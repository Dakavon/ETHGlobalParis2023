/**
 * This script can be used to interact with the zkRabbit contract, after deploying it.
 *
 * Build during the ETHGlobal Paris 2023 hackathon
 *
 * To run locally:
 * Build the project: `$ npm run build`
 * Run with node:     `$ node build/src/interact_zkrabbit.js <deployAlias>`.
 */
import { Mina, PrivateKey, Field } from 'snarkyjs';
import fs from 'fs/promises';
import { zkRabbit } from './zkRabbit.js';

import dotenv from 'dotenv';
const loadEnv = dotenv.config();
if (loadEnv.error) {
  throw loadEnv.error;
}

const SALT: number = parseInt(process.env.SALT || '0', 10);


// check command line arg
let deployAlias = process.argv[2];
const moveToField = process.argv[3];
if (!deployAlias || !moveToField)
  throw Error(`Missing <deployAlias> or <moveToField> argument.

Usage:
node build/src/interact_zkrabbit.js <deployAlias>
`);
Error.stackTraceLimit = 1000;

// parse config and private key from file
type Config = {
  deployAliases: Record<
    string,
    {
      url: string;
      keyPath: string;
      fee: string;
      feepayerKeyPath: string;
      feepayerAlias: string;
    }
  >;
};
let configJson: Config = JSON.parse(await fs.readFile('config.json', 'utf8'));
let config = configJson.deployAliases[deployAlias];
let feepayerKeysBase58: { privateKey: string; publicKey: string } = JSON.parse(
  await fs.readFile(config.feepayerKeyPath, 'utf8')
);

let zkAppKeysBase58: { privateKey: string; publicKey: string } = JSON.parse(
  await fs.readFile(config.keyPath, 'utf8')
);

let feepayerKey = PrivateKey.fromBase58(feepayerKeysBase58.privateKey);
let zkAppKey = PrivateKey.fromBase58(zkAppKeysBase58.privateKey);

// set up Mina instance and contract we interact with
const Network = Mina.Network(config.url);
const fee = Number(config.fee) * 1e9; // in nanomina (1 billion = 1.0 mina)
Mina.setActiveInstance(Network);
let feepayerAddress = feepayerKey.toPublicKey();
let zkAppAddress = zkAppKey.toPublicKey();
let zkApp = new zkRabbit(zkAppAddress);

let sentTx1, sentTx2;
// compile the contract to create prover keys
console.log('compile the contract...');
await zkRabbit.compile();


//First transaction
try{
  console.log('build transaction and create proof...');
  let tx1 = await Mina.transaction({ sender: feepayerAddress, fee }, () => {
    zkApp.initState(Field(SALT));
  });
  await tx1.prove();
  console.log('send transaction...');
  sentTx1 = await tx1.sign([feepayerKey]).send();
} catch (err) {
  console.log(err);
}
if (sentTx1?.hash() !== undefined) {
  console.log(`
Success! Update transaction sent.

Your smart contract state will be updated
as soon as the transaction is included in a block:
https://berkeley.minaexplorer.com/transaction/${sentTx1.hash()}
`);
}

//Second transaction: Update the field
try {
  // call zkmove() and send transaction
  console.log('build transaction and create proof...');
  let tx2 = await Mina.transaction({ sender: feepayerAddress, fee }, () => {
    zkApp.zkmove(Field(SALT), Field(0), Field(moveToField));
  });
  await tx2.prove();
  console.log('send transaction...');
  sentTx2 = await tx2.sign([feepayerKey]).send();
} catch (err) {
  console.log(err);
}
if (sentTx2?.hash() !== undefined) {
  console.log(`
Success! Update transaction sent.

Your smart contract state will be updated
as soon as the transaction is included in a block:
https://berkeley.minaexplorer.com/transaction/${sentTx2.hash()}
`);
}