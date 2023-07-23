import { Mina, PublicKey, fetchAccount } from 'snarkyjs';

type Transaction = Awaited<ReturnType<typeof Mina.transaction>>;

// ---------------------------------------------------------------------------------------

import type { Rabbit } from '../../../contracts/src/Rabbit';

const state = {
  Rabbit: null as null | typeof Rabbit,
  zkapp: null as null | Rabbit,
  transaction: null as null | Transaction,
};

// ---------------------------------------------------------------------------------------

const functions = {
  setActiveInstanceToBerkeley: async (args: {}) => {
    const Berkeley = Mina.Network(
      'https://proxy.berkeley.minaexplorer.com/graphql'
    );
    console.log('Berkeley Instance Created');
    Mina.setActiveInstance(Berkeley);
  },
  loadContract: async (args: {}) => {
    const { Rabbit } = await import('../../../contracts/build/src/Rabbit.js');
    state.Rabbit = Rabbit;
  },
  compileContract: async (args: {}) => {
    await state.Rabbit!.compile();
  },
  fetchAccount: async (args: { publicKey58: string }) => {
    const publicKey = PublicKey.fromBase58(args.publicKey58);
    return await fetchAccount({ publicKey });
  },
  initZkappInstance: async (args: { publicKey58: string }) => {
    const publicKey = PublicKey.fromBase58(args.publicKey58);
    state.zkapp = new state.Rabbit!(publicKey);
  },
  getField: async (args: {}) => {
    const currentField = await state.zkapp!.field.get();
    return JSON.stringify(currentField.toJSON());
  },
  // createUpdateTransaction: async (args: {}) => {
  //   const transaction = await Mina.transaction(() => {
  //     state.zkapp!.update();
  //   });
  //   state.transaction = transaction;
  // },
  proveUpdateTransaction: async (args: {}) => {
    await state.transaction!.prove();
  },
  getTransactionJSON: async (args: {}) => {
    return state.transaction!.toJSON();
  },
};

// ---------------------------------------------------------------------------------------

export type WorkerFunctions = keyof typeof functions;

export type ZkappWorkerRequest = {
  id: number;
  fn: WorkerFunctions;
  args: any;
};

export type ZkappWorkerReponse = {
  id: number;
  data: any;
};

if (typeof window !== 'undefined') {
  addEventListener(
    'message',
    async (event: MessageEvent<ZkappWorkerRequest>) => {
      const returnData = await functions[event.data.fn](event.data.args);

      const message: ZkappWorkerReponse = {
        id: event.data.id,
        data: returnData,
      };
      postMessage(message);
    }
  );
}

console.log('Web Worker Successfully Initialized.');