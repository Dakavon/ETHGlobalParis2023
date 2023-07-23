/**
 * This script can be used to read from the Rabbit contract, after deploying it.
 *
 * Build during the ETHGlobal Paris 2023 hackathon
 *
 * To run locally:
 * Build the project: `$ npm run build`
 * Run with node:     `$ node build/src/interact.js <deployAlias>`.
 */
import { Mina, PrivateKey, Field, fetchAccount } from 'snarkyjs';
import fs from 'fs/promises';
import { Rabbit } from './Rabbit.js';

// check command line arg
let deployAlias = process.argv[2];
if (!deployAlias)
  throw Error(`Missing <deployAlias> argument.

Usage:
node build/src/interact.js <deployAlias>
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
// let feepayerKeysBase58: { privateKey: string; publicKey: string } = JSON.parse(
//   await fs.readFile(config.feepayerKeyPath, 'utf8')
// );

let zkAppKeysBase58: { privateKey: string; publicKey: string } = JSON.parse(
  await fs.readFile(config.keyPath, 'utf8')
);

//let feepayerKey = PrivateKey.fromBase58(feepayerKeysBase58.privateKey);
let zkAppKey = PrivateKey.fromBase58(zkAppKeysBase58.privateKey);

// set up Mina instance and contract we interact with
const Network = Mina.Network(config.url);
//const fee = Number(config.fee) * 1e9; // in nanomina (1 billion = 1.0 mina)
Mina.setActiveInstance(Network);
//let feepayerAddress = feepayerKey.toPublicKey();
let zkAppAddress = zkAppKey.toPublicKey();
let zkApp = new Rabbit(zkAppAddress);


console.log('Read from the contract...');
// await Rabbit.compile();
try {
  await fetchAccount({ publicKey: zkAppAddress });

  let currentField = await zkApp.field.get().toString();
  let gameEnded = await zkApp.gameEnded.get().toString();

  console.log('current field: ', currentField);
  console.log('game ended: ', gameEnded);
}
catch (e) {
  console.log('error: ', e);
}
