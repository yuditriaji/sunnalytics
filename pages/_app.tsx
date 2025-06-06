import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { inter, robotoMono } from '../utils/fonts';
import Head from 'next/head';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className={`${inter.variable} ${robotoMono.variable}`}>
      <Head>
        <title>Sunnalytics</title>
        <meta name="description" content="Sunnalytics - Token Analytics Platform" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Component {...pageProps} />
    </div>
  );
}