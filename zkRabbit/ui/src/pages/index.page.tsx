
import Head from 'next/head';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import GradientBG from '../components/GradientBG.js';
import styles from '../styles/Home.module.css';

export default function Home() {
  const [field, setField] = useState(0);

  useEffect(() => {
    (async () => {
      const { Mina, PublicKey } = await import('snarkyjs');
      const { Rabbit } = await import('../../../contracts/build/src/');

      // Update this to use the address (public key) for your zkApp account.
      // To try it out, you can try this address for an example "Add" smart contract that we've deployed to
      // Berkeley Testnet B62qkwohsqTBPsvhYE8cPZSpzJMgoKn4i1LQRuBAtVXWpaT4dgH6WoA.
      const zkAppAddress = 'B62qkX2ivfnMabNcv7nHhAVPx7QihnS3u4wCCizKgvX5xxrP9acVKrC';
      // This should be removed once the zkAppAddress is updated.
      if (!zkAppAddress) {
        console.error(
          'The following error is caused because the zkAppAddress has an empty string as the public key. Update the zkAppAddress with the public key for your zkApp account, or try this address for an example "Add" smart contract that we deployed to Berkeley Testnet: B62qkwohsqTBPsvhYE8cPZSpzJMgoKn4i1LQRuBAtVXWpaT4dgH6WoA'
        );
      }
      //const zkApp = new Add(PublicKey.fromBase58(zkAppAddress))
    })();
  }, []);

  return (
    <>
      <Head>
        <title>Follow the zkRabbit</title>
        <meta name="description" content="built with SnarkyJS" />
        <link rel="icon" href="/assets/favicon.ico" />
      </Head>
      <GradientBG>

        <main className={styles.main}>
        <div>
        <img src="zkRabbit.png" alt="zkRabbit" className='rabbit-logo' />
       </div>
          <div className={styles.center}>
            {/* <a
              href="https://minaprotocol.com/"
              target="_blank"
              rel="noopener noreferrer"
            /> */}
          <div className={styles.arrowKeysContainer}>
            <button className={styles.button} type="button">Up</button>
            <div className={styles.arrowButtonsContainer}>
              <button className={styles.arrowKey} type="button">Left</button>
              <button className={styles.button} type="button">Down</button>
              <button className={styles.button} type="button">Right</button>
            </div>
          </div>  

          </div>
        </main>
      </GradientBG>
    </>
  );
}
