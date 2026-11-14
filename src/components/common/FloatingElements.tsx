import React from 'react';
import { motion } from 'framer-motion';

export const FloatingElements: React.FC = () => {
  // Pre-calculated calm particle paths
  const particles = [
    { id: 1, size: 6, top: '15%', left: '8%', duration: 18, delay: 0 },
    { id: 2, size: 8, top: '25%', left: '85%', duration: 22, delay: 2 },
    { id: 3, size: 5, top: '45%', left: '5%', duration: 20, delay: 4 },
    { id: 4, size: 7, top: '60%', left: '92%', duration: 24, delay: 1 },
    { id: 5, size: 6, top: '75%', left: '12%', duration: 19, delay: 3 },
    { id: 6, size: 9, top: '88%', left: '80%', duration: 21, delay: 5 },
  ];

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-dusty-rose/20 blur-[1px]"
          style={{
            width: p.size,
            height: p.size,
            top: p.top,
            left: p.left,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, 15, -15, 0],
            opacity: [0.2, 0.5, 0.2],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
      
      {/* Subtle ambient gradient spheres */}
      <div className="absolute top-10 left-1/4 w-96 h-96 rounded-full bg-champagne-beige/25 blur-3xl" />
      <div className="absolute top-1/2 right-10 w-[30rem] h-[30rem] rounded-full bg-dusty-rose/15 blur-3xl" />
      <div className="absolute bottom-20 left-10 w-80 h-80 rounded-full bg-muted-burgundy/5 blur-3xl" />
    </div>
  );
};
