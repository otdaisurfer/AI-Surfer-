import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Sparkle, Sparkles as SparklesIcon } from 'lucide-react';

interface SparkleItem {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  delay: number;
  duration: number;
}

interface ClickSparkle {
  id: string;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  size: number;
  color: string;
}

export default function SparklesOverlay() {
  const [backgroundSparkles] = useState<SparkleItem[]>(() => {
    const topColors = [
      'text-white drop-shadow-[0_0_12px_rgba(255,255,255,1)]',
      'text-slate-100 drop-shadow-[0_0_10px_rgba(226,232,240,0.95)]',
      'text-slate-300 drop-shadow-[0_0_9px_rgba(203,213,225,0.9)]',
    ];
    const lowerColors = [
      'text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.7)]',
      'text-pink-400 drop-shadow-[0_0_8px_rgba(244,114,182,0.7)]',
      'text-yellow-300 drop-shadow-[0_0_8px_rgba(253,224,71,0.7)]',
      'text-purple-400 drop-shadow-[0_0_8px_rgba(192,132,252,0.7)]',
      'text-white/80 drop-shadow-[0_0_5px_rgba(255,255,255,0.8)]',
    ];

    return Array.from({ length: 40 }, (_, id) => {
      const isTopDense = Math.random() < 0.65;
      const palette = isTopDense ? topColors : lowerColors;
      return {
        id,
        x: Math.random() * 100,
        y: isTopDense ? Math.random() * 35 : Math.random() * 100,
        size: Math.random() * 10 + 6,
        color: palette[Math.floor(Math.random() * palette.length)],
        delay: Math.random() * 5,
        duration: Math.random() * 3 + 3,
      };
    });
  });

  const [clickSparkles, setClickSparkles] = useState<ClickSparkle[]>([]);

  useEffect(() => {
    const handleGlobalClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) return;

      const colors = [
        'text-cyan-300 drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]',
        'text-pink-300 drop-shadow-[0_0_10px_rgba(244,114,182,0.8)]',
        'text-yellow-200 drop-shadow-[0_0_10px_rgba(253,224,71,0.8)]',
        'text-purple-300 drop-shadow-[0_0_10px_rgba(192,132,252,0.8)]',
        'text-white drop-shadow-[0_0_10px_rgba(255,255,255,1)]',
      ];

      const burstId = `${Date.now()}-${Math.random()}`;
      const burstItems = Array.from({ length: 3 }, (_, index) => ({
        id: `${burstId}-${index}`,
        x: event.pageX + (Math.random() * 16 - 8),
        y: event.pageY + (Math.random() * 16 - 8),
        targetX: Math.random() * 70 - 35,
        targetY: -Math.random() * 65 - 35,
        size: Math.random() * 14 + 10,
        color: colors[Math.floor(Math.random() * colors.length)],
      }));

      setClickSparkles((previous) => [...previous.slice(-30), ...burstItems]);
    };

    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, []);

  useEffect(() => {
    if (!clickSparkles.length) return;
    const timer = setTimeout(() => setClickSparkles([]), 2000);
    return () => clearTimeout(timer);
  }, [clickSparkles]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
      <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-cyan-950/20 via-pink-950/5 to-transparent blur-3xl" />

      {backgroundSparkles.map((spark) => (
        <motion.div
          key={spark.id}
          className="absolute"
          style={{ left: `${spark.x}%`, top: `${spark.y}%` }}
          animate={{ scale: [0.4, 1.2, 0.4], opacity: [0.15, 0.85, 0.15], rotate: [0, 90, 180, 270, 360] }}
          transition={{ duration: spark.duration, repeat: Infinity, delay: spark.delay, ease: 'easeInOut' }}
        >
          {spark.size > 11 ? (
            <SparklesIcon className={spark.color} style={{ width: spark.size, height: spark.size }} />
          ) : (
            <Sparkle className={spark.color} style={{ width: spark.size, height: spark.size }} />
          )}
        </motion.div>
      ))}

      <AnimatePresence>
        {clickSparkles.map((burst) => (
          <motion.div
            key={burst.id}
            initial={{ opacity: 1, scale: 0.2, rotate: 0 }}
            animate={{ opacity: 0, scale: [1, 1.5, 0.5], y: [burst.y, burst.y + burst.targetY], x: [burst.x, burst.x + burst.targetX], rotate: 180 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.1, ease: 'easeOut' }}
            className="absolute z-10"
            style={{ left: burst.x, top: burst.y, transform: 'translate(-50%, -50%)' }}
          >
            <Sparkle className={burst.color} style={{ width: burst.size, height: burst.size }} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
