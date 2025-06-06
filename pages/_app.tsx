import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { inter, robotoMono } from '../utils/fonts';
import Head from 'next/head';
import { useState, useEffect } from 'react';
import WelcomeScreen from '../components/WelcomeScreen';

export default function App({ Component, pageProps }: AppProps) {
  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    // Ensure the welcome screen only shows on initial load
    const hasShownWelcome = localStorage.getItem('hasShownWelcome');
    if (!hasShownWelcome) {
      localStorage.setItem('hasShownWelcome', 'true');
    } else {
      setShowWelcome(false);
    }
  }, []);

  const handleWelcomeFinish = () => {
    setShowWelcome(false);
  };

  return (
    <div className={`${inter.variable} ${robotoMono.variable}`}>
      <Head>
        <title>Sunnalytics</title>
        <meta name="description" content="Sunnalytics - Token Analytics Platform" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#111827" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" href="/favicon-16x16.png" sizes="16x16" />
        <link rel="icon" type="image/png" href="/favicon-32x32.png" sizes="32x32" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" href="/android-chrome-192x192.png" sizes="192x192" />
        <link rel="icon" type="image/png" href="/android-chrome-512x512.png" sizes="512x512" />
        <link rel="manifest" href="/site.webmanifest" />
      </Head>
      {showWelcome && <WelcomeScreen onFinish={handleWelcomeFinish} />}
      <Component {...pageProps} />
    </div>
  );
}