// @/animations/LottiePlayer.tsx
'use client';

import Lottie from 'lottie-react';
import emptyChatAnimation from './emptyChat.json'; // 💡 Option A: Import directly if local

export default function LottiePlayer({ src }: { src?: string }) {
  // If you want to use the prop, use it. Otherwise, use the direct import:
  return (
    <Lottie 
      animationData={emptyChatAnimation} 
      loop={true} 
      className="w-full h-full"
    />
  );
}