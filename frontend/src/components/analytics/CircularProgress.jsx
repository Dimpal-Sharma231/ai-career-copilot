import React from 'react';
import { motion } from 'framer-motion';

/**
 * Animated CircularProgress Gauge with Framer Motion
 * Shifts color dynamically based on score:
 * - Red (< 50)
 * - Yellow / Saffron (50 - 75)
 * - Green / Emerald (> 75)
 */
export const CircularProgress = ({ 
  value = 0, 
  size = 160, 
  strokeWidth = 12, 
  label = "Readiness Score",
  sublabel = "/ 100",
  showTierBadge = true
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedValue = Math.min(100, Math.max(0, value));
  const strokeDashoffset = circumference - (clampedValue / 100) * circumference;

  // Dynamic Color Shifting
  const getColorScheme = (score) => {
    if (score >= 75) {
      return {
        stroke: '#10B981', // emerald-500
        text: 'text-emerald-400',
        bgGlow: 'from-emerald-500/20 to-teal-500/10',
        badgeBg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
        tier: 'Super Dream Ready'
      };
    }
    if (score >= 50) {
      return {
        stroke: '#FF9933', // Deep Saffron / Amber
        text: 'text-saffron-400',
        bgGlow: 'from-saffron-500/20 to-orange-500/10',
        badgeBg: 'bg-saffron-500/15 text-saffron-300 border-saffron-500/30',
        tier: 'Placement Ready'
      };
    }
    return {
      stroke: '#F43F5E', // rose-500
      text: 'text-rose-400',
      bgGlow: 'from-rose-500/20 to-red-500/10',
      badgeBg: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
      tier: 'Needs Acceleration'
    };
  };

  const scheme = getColorScheme(clampedValue);

  return (
    <div className="flex flex-col items-center justify-center relative">
      <div 
        className="relative flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        {/* Ambient radial blur behind gauge */}
        <div 
          className={`absolute inset-4 rounded-full bg-gradient-to-tr ${scheme.bgGlow} blur-xl pointer-events-none`}
        />

        <svg 
          width={size} 
          height={size} 
          className="transform -rotate-90 select-none"
        >
          {/* Background Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-white/[0.08]"
            fill="transparent"
          />

          {/* Animated Progress Arc */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={scheme.stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
            strokeLinecap="round"
            fill="transparent"
          />
        </svg>

        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="flex items-baseline space-x-0.5"
          >
            <span className={`text-4xl sm:text-5xl font-black font-mono tracking-tight ${scheme.text}`}>
              {Math.round(clampedValue)}
            </span>
            <span className="text-xs font-semibold text-slate-400">
              {sublabel}
            </span>
          </motion.div>
          {label && (
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">
              {label}
            </span>
          )}
        </div>
      </div>

      {showTierBadge && (
        <motion.div 
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.3 }}
          className={`mt-3 px-3 py-1 rounded-full text-xs font-semibold border ${scheme.badgeBg}`}
        >
          {scheme.tier}
        </motion.div>
      )}
    </div>
  );
};
