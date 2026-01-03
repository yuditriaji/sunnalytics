import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'com.sunnalytics.app',
    appName: 'Sunnalytics',
    webDir: 'out', // Next.js static export output directory
    server: {
        // For development - use local server
        // url: 'http://localhost:3000',
        // cleartext: true,

        // For production - use the exported static files
        androidScheme: 'https',
    },
    plugins: {
        SplashScreen: {
            launchShowDuration: 2000,
            backgroundColor: '#0a0a0a',
            showSpinner: false,
            androidSpinnerStyle: 'small',
            spinnerColor: '#facc15',
        },
        StatusBar: {
            style: 'Dark',
            backgroundColor: '#0a0a0a',
        },
        Keyboard: {
            resize: 'body',
            resizeOnFullScreen: true,
        },
    },
    ios: {
        contentInset: 'automatic',
        backgroundColor: '#0a0a0a',
    },
    android: {
        backgroundColor: '#0a0a0a',
    },
};

export default config;
