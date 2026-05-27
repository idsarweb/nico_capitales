import { useCallback } from 'react';
import confetti from 'canvas-confetti';

export function useConfetti() {
  const fire = useCallback(() => {
    const duration = 3000;
    const end = Date.now() + duration;
    let rafId: number;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.65 },
        colors: ['#3b82f6', '#ef4444', '#f59e0b', '#10b981', '#8b5cf6'],
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.65 },
        colors: ['#3b82f6', '#ef4444', '#f59e0b', '#10b981', '#8b5cf6'],
      });

      if (Date.now() < end) {
        rafId = requestAnimationFrame(frame);
      }
    };

    rafId = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(rafId);
  }, []);

  const fireMild = useCallback(() => {
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#3b82f6', '#10b981', '#f59e0b'],
    });
  }, []);

  return { fire, fireMild };
}
