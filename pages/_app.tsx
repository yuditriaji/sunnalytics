import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { ClerkProvider, SignedIn, SignedOut } from '@clerk/nextjs';
import { inter, robotoMono } from '../utils/fonts';
import Head from 'next/head';
import { useState, useEffect } from 'react';
import WelcomeScreen from '../components/WelcomeScreen';

// Clerk appearance customization to match dark theme
const clerkAppearance = {
  baseTheme: undefined,
  variables: {
    colorPrimary: '#facc15', // Yellow accent
    colorBackground: '#1f2937',
    colorText: '#f9fafb',
    colorTextSecondary: '#9ca3af',
    colorInputBackground: '#374151',
    colorInputText: '#f9fafb',
  },
  elements: {
    card: 'bg-gray-800 border-gray-700',
    headerTitle: 'text-gray-100',
    headerSubtitle: 'text-gray-400',
    formButtonPrimary: 'bg-yellow-500 hover:bg-yellow-600 text-gray-900',
    footerActionLink: 'text-yellow-500 hover:text-yellow-400',
  },
};

export default function App({ Component, pageProps }: AppProps) {
  const [showWelcome, setShowWelcome] = useState(true);
  const INACTIVITY_THRESHOLD = 10 * 60 * 1000; // 10 minutes in milliseconds

  useEffect(() => {
    const lastActive = localStorage.getItem('lastActive');
    const now = new Date().getTime();

    if (lastActive) {
      const lastActiveTime = parseInt(lastActive, 10);
      const timeSinceLastActive = now - lastActiveTime;

      // Show welcome screen if inactive for more than INACTIVITY_THRESHOLD
      if (timeSinceLastActive > INACTIVITY_THRESHOLD) {
        setShowWelcome(true);
      } else {
        setShowWelcome(false);
      }
    } else {
      // First visit or no stored timestamp
      localStorage.setItem('lastActive', now.toString());
      setShowWelcome(true);
    }

    // Update last active timestamp when the app is interacted with
    const handleActivity = () => {
      localStorage.setItem('lastActive', now.toString());
    };

    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('scroll', handleActivity);

    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('scroll', handleActivity);
    };
  }, []);

  const handleWelcomeFinish = () => {
    setShowWelcome(false);
  };

  return (
    <ClerkProvider
      appearance={clerkAppearance}
      {...pageProps}
    >
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
    </ClerkProvider>
  );
}