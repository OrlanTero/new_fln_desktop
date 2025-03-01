import React, { useEffect, useState } from 'react';
import logo from '../assets/images/logo.jpg';

const SplashScreen = ({ onDone }) => {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Start fade out after 2 seconds
    const timer = setTimeout(() => {
      setFadeOut(true);
    }, 2000);

    // Call onDone after fade out animation (3 seconds total)
    const doneTimer = setTimeout(() => {
      onDone();
    }, 3000);

    return () => {
      clearTimeout(timer);
      clearTimeout(doneTimer);
    };
  }, [onDone]);

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center bg-white z-50 transition-opacity duration-1000 ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div className="text-center">
        <img
          src={logo}
          alt="Logo"
          className="w-32 h-32 mx-auto mb-4 animate-bounce"
          style={{
            animation: 'bounce 2s infinite, scale 2s infinite',
          }}
        />
        <div className="mt-4">
          <div className="w-32 h-1 bg-gray-200 rounded-full mx-auto overflow-hidden">
            <div className="w-full h-full bg-indigo-600 origin-left animate-loading"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen; 