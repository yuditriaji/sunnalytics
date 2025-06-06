import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import localforage from 'localforage';

const WelcomeScreen: React.FC<{ onFinish: () => void }> = ({ onFinish }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const checkLastVisit = async () => {
      const lastVisit = await localforage.getItem<number>('lastVisit');
      const now = Date.now();
      const oneDay = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

      if (!lastVisit || now - lastVisit > oneDay) {
        setShow(true);
        await localforage.setItem('lastVisit', now);
      } else {
        onFinish();
      }
    };

    checkLastVisit();
  }, [onFinish]);

  if (!show) return null;

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: '#001529',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 2000,
      }}
      onAnimationComplete={() => {
        setTimeout(() => {
          setShow(false);
          onFinish();
        }, 2000);
      }}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      >
        {/* Replace with your logo */}
        <div style={{ fontSize: 48, color: '#fff', fontWeight: 'bold' }}>
          Sunnalytics
        </div>
      </motion.div>
    </motion.div>
  );
};

export default WelcomeScreen;