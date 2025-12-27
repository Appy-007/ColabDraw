import { useEffect, useRef, useState } from "react";

/* eslint-disable @typescript-eslint/no-explicit-any */
export type TimerProps = {
  isOwner: boolean;
  gameStatus: string;
  setGameStatus: any;
  forceTimerOff: boolean;
  onClearCanvasClick: () => void;
  onRoundEnd: () => void;
};
export default function Timer(props: TimerProps) {
  const { isOwner, gameStatus, setGameStatus,forceTimerOff, onClearCanvasClick, onRoundEnd } =
    props;
  const [roundTimer, setRoundTimer] = useState(40);

  const timerIdRef = useRef<number>(null);
  useEffect(() => {
    if (gameStatus === "playing") {
      const reduceTimer = () => {
        setRoundTimer((prev) => prev - 1);
      };

      timerIdRef.current = window.setInterval(reduceTimer, 1000);
    }

    return () => {
      if (timerIdRef.current) {
        window.clearInterval(timerIdRef.current);
      }
    };
  }, [gameStatus]);

  useEffect(() => {
    if (roundTimer <= 0 || forceTimerOff) {
      if (timerIdRef.current) {
        window.clearInterval(timerIdRef.current);
      }
      if (isOwner) {
        onRoundEnd();
      }
      onClearCanvasClick();
      setGameStatus("round_end");
    }
  }, [roundTimer, setGameStatus, forceTimerOff,isOwner]);

  const timerClasses =
    roundTimer <= 10
      ? "bg-red-600 text-white shadow-xl shadow-red-800/50 animate-pulse" // Danger state
      : "bg-green-500 text-gray-900 shadow-lg shadow-green-700/50"; // Normal state

  return (
    <>
      <div
        className={`
        ${timerClasses} 
        inline-flex items-center justify-center  p-2 rounded-full text-xl font-extrabold tracking-wider  transition-all duration-500 ease-in-out min-w-[80px] select-none
      `}
      >
        {roundTimer}
      </div>
    </>
  );
}
