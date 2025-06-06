import { useEffect } from 'react';
import { useRouter } from 'next/router';
import localforage from 'localforage';

export default function Welcome() {
  const router = useRouter();

  useEffect(() => {
    localforage.getItem('welcomeScreenSeen').then(value => {
      if (value) {
        router.push('/');
      }
    });
  }, [router]);

  const handleContinue = () => {
    localforage.setItem('welcomeScreenSeen', true);
    router.push('/');
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100 p-4">
      <h1 className="text-3xl font-bold mb-4">Welcome to Sunnalytics</h1>
      <p className="text-lg text-gray-600 mb-6 text-center">
        Your go-to platform for token analytics and insights.
      </p>
      <button
        onClick={handleContinue}
        className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
      >
        Continue
      </button>
    </div>
  );
}