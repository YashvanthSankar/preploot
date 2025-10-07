import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function XPNotification({ xpGained, onComplete }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (xpGained > 0) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        onComplete?.();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [xpGained, onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ scale: 0.5, opacity: 0, y: 50 }}
          animate={{ scale: 1.2, opacity: 1, y: -30 }}
          exit={{ scale: 0.8, opacity: 0, y: -60 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none"
        >
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-2xl shadow-2xl border-2 border-white/20">
            <div className="text-center">
              <div className="text-3xl font-bold font-mono">+{xpGained} XP</div>
              <div className="text-sm opacity-90 font-medium">Experience Gained!</div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function LevelUpNotification({ newLevel, onComplete }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (newLevel > 0) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        onComplete?.();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [newLevel, onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ scale: 0, rotate: -180, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          exit={{ scale: 0, rotate: 180, opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
        >
          <div className="bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 text-white p-12 rounded-3xl shadow-2xl border-4 border-white/30 text-center">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 2, ease: "linear" }}
              className="text-6xl mb-4"
            >
              🏆
            </motion.div>
            <div className="level-text text-4xl font-black mb-2">LEVEL UP!</div>
            <div className="text-2xl font-bold">Level {newLevel}</div>
            <div className="text-lg opacity-90 mt-2">You're becoming unstoppable!</div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function StreakNotification({ streakDays, onComplete }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (streakDays > 0) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        onComplete?.();
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [streakDays, onComplete]);

  const getStreakMessage = (days) => {
    if (days >= 30) return "🚀 Legendary Streak!";
    if (days >= 14) return "🔥 On Fire!";
    if (days >= 7) return "💪 Week Strong!";
    if (days >= 3) return "⚡ Getting Hot!";
    return "🌟 Nice Start!";
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ x: 300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -300, opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="fixed top-20 right-6 z-50 pointer-events-none"
        >
          <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-4 rounded-xl shadow-lg border border-white/20">
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.6, repeat: 1 }}
                className="text-2xl"
              >
                🔥
              </motion.div>
              <div>
                <div className="font-bold text-lg">{streakDays} Day Streak!</div>
                <div className="text-sm opacity-90">{getStreakMessage(streakDays)}</div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}