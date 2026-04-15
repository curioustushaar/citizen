'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, Check, Loader2 } from 'lucide-react';

const steps = [
  { label: 'Analyzing complaint text...', duration: 1000 },
  { label: 'Detecting category using NLP...', duration: 800 },
  { label: 'Classifying priority level...', duration: 700 },
  { label: 'Identifying department...', duration: 600 },
  { label: 'Assigning officer & computing SLA...', duration: 900 },
];

export default function AIProcessingLoader() {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (currentStep < steps.length) {
      const timer = setTimeout(() => {
        setCurrentStep((prev) => prev + 1);
      }, steps[currentStep].duration);
      return () => clearTimeout(timer);
    }
  }, [currentStep]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-16"
    >
      {/* Brain animation */}
      <div className="relative w-24 h-24 mb-8">
        <div className="absolute inset-0 rounded-full bg-primary-500/10 animate-ping" />
        <div className="absolute inset-2 rounded-full bg-primary-500/20 animate-pulse" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-accent-600 flex items-center justify-center shadow-glow-lg">
            <Brain className="w-8 h-8 text-white animate-pulse" />
          </div>
        </div>

        {/* Orbiting dots */}
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-primary-400"
            style={{
              top: `${50 + 45 * Math.sin((Date.now() / 500 + i) * (Math.PI / 3))}%`,
              left: `${50 + 45 * Math.cos((Date.now() / 500 + i) * (Math.PI / 3))}%`,
              animation: `neuralPulse ${1 + i * 0.2}s ease-in-out infinite`,
              animationDelay: `${i * 0.15}s`,
            }}
          />
        ))}
      </div>

      <h2 className="text-xl font-bold text-white mb-2">AI Processing</h2>
      <p className="text-white/40 text-sm mb-8">
        Our AI engine is analyzing your complaint
      </p>

      {/* Processing steps */}
      <div className="w-full max-w-sm space-y-3">
        {steps.map((step, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{
              opacity: i <= currentStep ? 1 : 0.3,
              x: i <= currentStep ? 0 : -20,
            }}
            transition={{ delay: i * 0.2, duration: 0.3 }}
            className="flex items-center gap-3"
          >
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                i < currentStep
                  ? 'bg-success-500/20 text-success-400'
                  : i === currentStep
                  ? 'bg-primary-500/20 text-primary-400'
                  : 'bg-white/5 text-white/20'
              }`}
            >
              {i < currentStep ? (
                <Check className="w-3.5 h-3.5" />
              ) : i === currentStep ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <div className="w-1.5 h-1.5 rounded-full bg-current" />
              )}
            </div>
            <span
              className={`text-sm transition-colors duration-300 ${
                i < currentStep
                  ? 'text-success-400'
                  : i === currentStep
                  ? 'text-white'
                  : 'text-white/30'
              }`}
            >
              {step.label}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-sm mt-8">
        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full"
            initial={{ width: '0%' }}
            animate={{ width: `${(currentStep / steps.length) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <p className="text-center text-xs text-white/30 mt-2">
          {Math.round((currentStep / steps.length) * 100)}% complete
        </p>
      </div>
    </motion.div>
  );
}
