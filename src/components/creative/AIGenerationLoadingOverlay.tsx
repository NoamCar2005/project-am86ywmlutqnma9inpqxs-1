import { useEffect, useState } from "react";

const messages = [
  "מנתח את הבריף קריאייטיב שלך...",
  "יוצר זוויות שיווקיות...",
  "מעצב סצנות ויזואליות...",
  "מכין תוכנית מפורטת...",
  "מתאים את התוכן לקהל היעד...",
  "מסכם את התוכנית..."
];

export function AIGenerationLoadingOverlay({ show, onComplete }: { show: boolean; onComplete?: () => void }) {
  const [messageIndex, setMessageIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isCompleting, setIsCompleting] = useState(false);

  useEffect(() => {
    if (!show) {
    setMessageIndex(0);
      setProgress(0);
      setIsCompleting(false);
      return;
    }

    const messageInterval = setInterval(() => {
      setMessageIndex((prev) => {
        if (prev < messages.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 1500);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev < 95 && !isCompleting) { // Stop at 95% until webhook completes
          return prev + 0.5; // Much slower progress
        }
        return prev;
      });
    }, 200); // Slower interval

    return () => {
      clearInterval(messageInterval);
      clearInterval(progressInterval);
    };
  }, [show, isCompleting]);

  // Complete progress when webhook finishes
  useEffect(() => {
    if (onComplete && progress >= 95 && !isCompleting) {
      setIsCompleting(true);
      const completeInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev < 100) {
            return prev + 1;
          } else {
            clearInterval(completeInterval);
            setTimeout(() => {
              onComplete();
            }, 500); // Small delay before calling onComplete
            return 100;
          }
        });
      }, 50); // Fast completion to 100%

      return () => clearInterval(completeInterval);
    }
  }, [onComplete, progress, isCompleting]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-brand-primary/95 via-brand-secondary/95 to-brand-primary/95 backdrop-blur-sm transition-all">
      <div className="text-center max-w-md mx-auto px-6">
        {/* Main Animation Container */}
        <div className="mb-8 relative">
          {/* Rotating outer ring */}
          <div className="w-24 h-24 border-4 border-brand-secondary/20 border-t-brand-primary rounded-full animate-spin mx-auto mb-4"></div>
          
          {/* Pulsing center circle */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 bg-gradient-to-r from-brand-primary to-brand-secondary rounded-full animate-pulse flex items-center justify-center">
              <div className="w-8 h-8 bg-white rounded-full animate-ping"></div>
            </div>
          </div>
          
          {/* Floating particles */}
          <div className="absolute inset-0">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-brand-secondary/60 rounded-full animate-bounce"
                style={{
                  left: `${20 + (i * 15)}%`,
                  top: `${30 + (i % 2 * 20)}%`,
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: '2s'
                }}
              />
            ))}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-brand-secondary/20 rounded-full h-2 mb-6">
          <div 
            className="bg-gradient-to-r from-brand-primary to-brand-secondary h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Title */}
        <div className="text-3xl font-bold text-white mb-4 animate-pulse" style={{textShadow: '0 2px 8px #0008'}}>
          יוצרים עבורך קריאייטיב
        </div>

        {/* Current Message */}
        <div className="text-lg text-white mb-4 min-h-[2rem] flex items-center justify-center" style={{textShadow: '0 2px 8px #0008'}}>
          <span className="animate-fade-in">
            {messages[messageIndex]}
          </span>
        </div>

        {/* Progress Text */}
        <div className="text-sm text-white" style={{textShadow: '0 2px 8px #0008'}}>
          {Math.round(progress)}% הושלם
        </div>

        {/* Subtle background animation */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-brand-primary/10 rounded-full animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-brand-secondary/10 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
      </div>
    </div>
  );
} 