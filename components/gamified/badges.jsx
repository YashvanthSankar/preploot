import { motion } from 'framer-motion';
import { Trophy, Star, Award, Crown, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

export function LevelBadge({ level, className, animated = true, size = 'default' }) {
  const sizeClasses = {
    sm: 'w-16 h-16 text-lg',
    default: 'w-24 h-24 text-2xl',
    lg: 'w-32 h-32 text-3xl',
    xl: 'w-40 h-40 text-4xl'
  };

  const getLevelIcon = (level) => {
    if (level >= 50) return Crown;
    if (level >= 25) return Award;
    if (level >= 10) return Trophy;
    return Star;
  };

  const getLevelColor = (level) => {
    if (level >= 50) return 'from-yellow-400 to-orange-500';
    if (level >= 25) return 'from-purple-500 to-pink-600';
    if (level >= 10) return 'from-blue-500 to-purple-600';
    return 'from-green-500 to-blue-500';
  };

  const getLevelTitle = (level) => {
    if (level >= 50) return 'Master';
    if (level >= 25) return 'Expert';
    if (level >= 10) return 'Advanced';
    if (level >= 5) return 'Intermediate';
    return 'Beginner';
  };

  const Icon = getLevelIcon(level);

  return (
    <motion.div
      className={cn(
        "relative flex flex-col items-center justify-center rounded-full",
        `bg-gradient-to-br ${getLevelColor(level)}`,
        "shadow-lg border-4 border-white/20",
        sizeClasses[size],
        className
      )}
      initial={animated ? { scale: 0, rotate: -180 } : undefined}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      whileHover={{ scale: 1.05 }}
    >
      {/* Background glow */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 to-transparent"></div>
      
      {/* Icon */}
      <Icon className="text-white mb-1" size={size === 'sm' ? 16 : size === 'lg' ? 24 : 20} />
      
      {/* Level number */}
      <div className="level-text font-black text-white">
        {level}
      </div>
      
      {/* Floating particles */}
      {animated && (
        <>
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full"
              animate={{
                y: [0, -20, 0],
                x: [0, Math.random() * 10 - 5, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.5,
                ease: "easeInOut"
              }}
              style={{
                top: '20%',
                left: `${30 + i * 20}%`,
              }}
            />
          ))}
        </>
      )}
    </motion.div>
  );
}

export function SkillBadge({ skill, level, maxLevel = 5, className }) {
  const percentage = (level / maxLevel) * 100;
  
  return (
    <div className={cn("flex items-center gap-3 p-3 bg-card rounded-lg border", className)}>
      <div className="flex-shrink-0">
        <Zap className="h-5 w-5 text-primary" />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h4 className="text-sm font-medium truncate">{skill}</h4>
          <span className="text-xs text-muted-foreground font-mono">
            {level}/{maxLevel}
          </span>
        </div>
        
        <div className="w-full bg-muted rounded-full h-2">
          <motion.div
            className="h-2 bg-gradient-to-r from-primary to-purple-600 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
      </div>
    </div>
  );
}

export function AchievementBadge({ 
  title, 
  description, 
  icon, 
  unlocked = false, 
  rarity = 'common',
  className 
}) {
  const rarityColors = {
    common: 'from-gray-400 to-gray-600',
    rare: 'from-blue-400 to-blue-600',
    epic: 'from-purple-400 to-purple-600',
    legendary: 'from-yellow-400 to-orange-500'
  };

  const rarityGlow = {
    common: 'shadow-gray-500/20',
    rare: 'shadow-blue-500/30',
    epic: 'shadow-purple-500/30',
    legendary: 'shadow-yellow-500/40'
  };

  return (
    <motion.div
      className={cn(
        "relative p-4 rounded-xl border-2 transition-all duration-300",
        unlocked 
          ? `bg-gradient-to-br ${rarityColors[rarity]} ${rarityGlow[rarity]} shadow-lg border-white/20` 
          : "bg-muted border-muted-foreground/20 opacity-60",
        className
      )}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
      whileHover={unlocked ? { scale: 1.02 } : undefined}
    >
      {unlocked && (
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-xl"></div>
      )}
      
      <div className="relative flex items-center gap-3">
        <div className={cn(
          "p-2 rounded-lg",
          unlocked ? "bg-white/20" : "bg-muted-foreground/10"
        )}>
          {icon}
        </div>
        
        <div className="flex-1">
          <h4 className={cn(
            "font-bold text-sm",
            unlocked ? "text-white" : "text-muted-foreground"
          )}>
            {title}
          </h4>
          <p className={cn(
            "text-xs",
            unlocked ? "text-white/80" : "text-muted-foreground/60"
          )}>
            {description}
          </p>
          
          {rarity !== 'common' && unlocked && (
            <div className="mt-1">
              <span className="text-xs px-2 py-1 bg-white/20 rounded-full font-medium capitalize">
                {rarity}
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}