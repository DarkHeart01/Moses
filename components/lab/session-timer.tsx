"use client";

import { useState, useEffect } from 'react';
import { Progress } from "@/components/ui/progress";
import { Clock } from 'lucide-react';

interface SessionTimerProps {
  startTime: string;
  duration: number; // in minutes
  onTimeWarning?: () => void;
  onTimeEnd?: () => void;
}

export default function SessionTimer({ 
  startTime, 
  duration, 
  onTimeWarning, 
  onTimeEnd 
}: SessionTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [percentage, setPercentage] = useState<number>(100);
  
  useEffect(() => {
    const start = new Date(startTime).getTime();
    const durationMs = duration * 60 * 1000;
    const end = start + durationMs;
    
    const updateTimer = () => {
      const now = Date.now();
      const remaining = Math.max(0, end - now);
      const remainingSeconds = Math.floor(remaining / 1000);
      
      setTimeRemaining(remainingSeconds);
      
      const percentRemaining = (remaining / durationMs) * 100;
      setPercentage(percentRemaining);
      
      // Trigger warning when 5 minutes remaining
      if (remainingSeconds <= 300 && remainingSeconds > 299 && onTimeWarning) {
        onTimeWarning();
      }
      
      // Trigger end when time is up
      if (remainingSeconds <= 0 && onTimeEnd) {
        onTimeEnd();
        clearInterval(interval);
      }
    };
    
    // Initial update
    updateTimer();
    
    // Set interval for updates
    const interval = setInterval(updateTimer, 1000);
    
    // Clean up
    return () => clearInterval(interval);
  }, [startTime, duration, onTimeWarning, onTimeEnd]);
  
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center text-sm">
        <div className="flex items-center">
          <Clock className="h-4 w-4 mr-1 text-gray-500" />
          <span className="text-gray-500">Time remaining:</span>
        </div>
        <span className="font-medium">{formatTime(timeRemaining)}</span>
      </div>
      <Progress value={percentage} className="h-1" />
    </div>
  );
}
