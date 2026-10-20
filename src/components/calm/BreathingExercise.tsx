import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/Card';
import { Play, Pause, RotateCcw } from 'lucide-react';

type Phase = 'idle' | 'inhale' | 'hold' | 'exhale' | 'rest';

const patternNames: Record<string, string> = {
  '4-7-8': '4-7-8 Calm',
  'box': 'Box Breathing',
  'cooldown': 'Quick Cooldown',
};

const patterns: Record<string, { inhale: number; hold: number; exhale: number; rest: number; cycles: number }> = {
  '4-7-8': { inhale: 4, hold: 7, exhale: 8, rest: 0, cycles: 4 },
  'box': { inhale: 4, hold: 4, exhale: 4, rest: 4, cycles: 5 },
  'cooldown': { inhale: 3, hold: 0, exhale: 6, rest: 1, cycles: 5 },
};

export function BreathingExercise() {
  const [pattern, setPattern] = useState<keyof typeof patterns>('box');
  const [phase, setPhase] = useState<Phase>('idle');
  const [cycle, setCycle] = useState(0);
  const [countdown, setCountdown] = useState(0);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const phaseRef = useRef<Phase>('idle');
  const phaseTimeRef = useRef(0);

  const p = patterns[pattern];

  const stopTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => stopTimer();
  }, [stopTimer]);

  const nextPhase = useCallback((current: Phase): { next: Phase; duration: number } => {
    switch (current) {
      case 'inhale': return { next: p.hold > 0 ? 'hold' : 'exhale', duration: p.hold };
      case 'hold': return { next: 'exhale', duration: p.exhale };
      case 'exhale': return { next: p.rest > 0 ? 'rest' : 'inhale', duration: p.rest };
      case 'rest': return { next: 'inhale', duration: p.inhale };
      default: return { next: 'inhale', duration: p.inhale };
    }
  }, [p]);

  const tick = useCallback(() => {
    setCountdown((prev) => {
      if (prev <= 1) {
        const currentPhase = phaseRef.current;
        const { next, duration } = nextPhase(currentPhase);

        if (currentPhase === 'rest' || (currentPhase === 'exhale' && p.rest === 0)) {
          setCycle((c) => {
            const newCycle = c + 1;
            if (newCycle >= p.cycles) {
              setPhase('idle');
              setRunning(false);
              phaseRef.current = 'idle';
              stopTimer();
              return 0;
            }
            return newCycle;
          });
        }

        phaseRef.current = next;
        setPhase(next);
        phaseTimeRef.current = duration;
        return duration;
      }
      return prev - 1;
    });
  }, [nextPhase, p.cycles, p.rest, stopTimer]);

  const start = useCallback(() => {
    setRunning(true);
    setCycle(0);
    phaseRef.current = 'inhale';
    setPhase('inhale');
    phaseTimeRef.current = p.inhale;
    setCountdown(p.inhale);
    stopTimer();
    intervalRef.current = setInterval(tick, 1000);
  }, [p.inhale, tick, stopTimer]);

  const pause = useCallback(() => {
    stopTimer();
    setRunning(false);
  }, [stopTimer]);

  const resume = useCallback(() => {
    setRunning(true);
    intervalRef.current = setInterval(tick, 1000);
  }, [tick]);

  const reset = useCallback(() => {
    stopTimer();
    setRunning(false);
    setPhase('idle');
    setCycle(0);
    setCountdown(0);
    phaseRef.current = 'idle';
    phaseTimeRef.current = 0;
  }, [stopTimer]);

  const changePattern = (newPattern: keyof typeof patterns) => {
    reset();
    setPattern(newPattern);
  };

  const circleScale = phase === 'inhale' ? 1.4 : phase === 'hold' ? 1.4 : phase === 'exhale' ? 0.7 : phase === 'rest' ? 0.7 : 1;
  const circleOpacity = phase === 'idle' ? 0.4 : 0.85;

  const phaseLabels: Record<Phase, string> = {
    idle: 'Ready when you are',
    inhale: 'Breathe in',
    hold: 'Hold',
    exhale: 'Breathe out',
    rest: 'Rest',
  };

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Pattern selector */}
      <div className="flex flex-wrap gap-2 justify-center">
        {(Object.keys(patterns) as (keyof typeof patterns)[]).map((key) => (
          <button
            key={key}
            onClick={() => changePattern(key)}
            className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
              pattern === key
                ? 'bg-nest-green-400 text-white shadow-soft'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            {patternNames[key]}
          </button>
        ))}
      </div>

      {/* Breathing visual */}
      <div className="relative w-64 h-64 flex items-center justify-center my-4">
        {/* Outer ring */}
        <div
          className="absolute rounded-full bg-gradient-to-br from-nest-green-200/40 to-nest-blue-200/40 breathing-circle"
          style={{
            transform: `scale(${circleScale})`,
            width: 180,
            height: 180,
            opacity: circleOpacity,
          }}
        />
        {/* Inner ring */}
        <div
          className="absolute rounded-full bg-gradient-to-br from-nest-green-300/50 to-nest-lavender-300/50 breathing-circle"
          style={{
            transform: `scale(${circleScale})`,
            width: 120,
            height: 120,
            opacity: circleOpacity,
          }}
        />
        {/* Core */}
        <div
          className="absolute rounded-full bg-gradient-to-br from-nest-green-400 to-nest-blue-400 breathing-circle flex items-center justify-center"
          style={{
            transform: `scale(${circleScale})`,
            width: 70,
            height: 70,
            opacity: circleOpacity,
          }}
        >
          <span className="text-3xl">🌿</span>
        </div>

        {/* Phase text */}
        <div className="absolute -bottom-2 text-center">
          <p className="text-lg font-bold text-gray-700">{phaseLabels[phase]}</p>
          {phase !== 'idle' && (
            <p className="text-3xl font-bold text-nest-green-500 tabular-nums">{countdown}</p>
          )}
        </div>
      </div>

      {/* Cycle indicator */}
      {running && (
        <div className="flex gap-1.5">
          {Array.from({ length: p.cycles }).map((_, i) => (
            <div
              key={i}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                i < cycle ? 'bg-nest-green-400' : i === cycle ? 'bg-nest-green-300 animate-pulse-soft' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      )}

      {/* Controls */}
      <div className="flex gap-3">
        {!running && phase === 'idle' && (
          <Button onClick={start} variant="success" icon={<Play className="w-5 h-5" />}>
            Start Breathing
          </Button>
        )}
        {running && (
          <Button onClick={pause} variant="outline" icon={<Pause className="w-5 h-5" />}>
            Pause
          </Button>
        )}
        {!running && phase !== 'idle' && (
          <Button onClick={resume} variant="success" icon={<Play className="w-5 h-5" />}>
            Resume
          </Button>
        )}
        {phase !== 'idle' && (
          <Button onClick={reset} variant="ghost" icon={<RotateCcw className="w-5 h-5" />}>
            Reset
          </Button>
        )}
      </div>

      {/* Tip */}
      <p className="text-sm text-gray-400 text-center max-w-xs">
        Sit comfortably, relax your shoulders, and follow the circle. Breathe gently through your nose.
      </p>
    </div>
  );
}
