import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export function GamifiedProgress({ 
  value, 
  max = 100, 
  className, 
  showXP = false, 
  animated = true,
  color = 'primary',
  size = 'default'
}) {
  const percentage = Math.min((value / max) * 100, 100);
  
  const colorClasses = {
    primary: 'bg-primary',
    xp: 'bg-gradient-to-r from-blue-500 to-purple-600',
    streak: 'bg-gradient-to-r from-orange-500 to-red-500',
    level: 'bg-gradient-to-r from-purple-500 to-pink-600',
    success: 'bg-gradient-to-r from-green-500 to-emerald-600'
  };

  const sizeClasses = {
    sm: 'h-2',
    default: 'h-3',
    lg: 'h-4',
    xl: 'h-6'
  };

  return (
    <div className={cn("relative w-full bg-muted rounded-full overflow-hidden", sizeClasses[size], className)}>
      <motion.div
        className={cn(
          "h-full rounded-full shadow-sm relative",
          colorClasses[color]
        )}
        initial={animated ? { width: 0 } : undefined}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: animated ? 0.8 : 0, ease: "easeOut" }}
      >
        {/* Shine effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 animate-pulse"></div>
      </motion.div>
      
      {showXP && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-bold text-white drop-shadow">
            {value}/{max} XP
          </span>
        </div>
      )}
    </div>
  );
}

export function LevelProgressRing({ level, xp, maxXP, size = 120 }) {
  const percentage = (xp / maxXP) * 100;
  const circumference = 2 * Math.PI * (size / 2 - 10);
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={size / 2 - 10}
          stroke="currentColor"
          strokeWidth="6"
          fill="transparent"
          className="text-muted"
        />
        
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={size / 2 - 10}
          stroke="url(#gradient)"
          strokeWidth="6"
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
        
        {/* Gradient definition */}
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
      </svg>
      
      {/* Level text in center */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="level-text text-2xl font-black text-primary">
          {level}
        </div>
        <div className="text-xs text-muted-foreground font-medium">
          LEVEL
        </div>
      </div>
    </div>
  );
}

export function XPBar({ currentXP, nextLevelXP, className }) {
  const progressXP = currentXP % 100; // Assuming 100 XP per level
  const percentage = (progressXP / nextLevelXP) * 100;

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Progress to next level</span>
        <span className="xp-text font-bold">{progressXP}/{nextLevelXP} XP</span>
      </div>
      
      <div className="relative h-4 bg-muted rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full shadow-inner"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          {/* Animated shine effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12"
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>
        
        {/* XP text overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-bold text-white drop-shadow-sm">
            {Math.round(percentage)}%
          </span>
        </div>
      </div>
    </div>
  );
}