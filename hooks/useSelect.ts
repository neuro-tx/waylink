import React ,{ useRef ,useCallback } from "react";

export function useSelect({
  onSelect,
  delay = 500,
}: {
  onSelect: () => void;
  delay?: number;
}) {
  const pressTimer = useRef<NodeJS.Timeout | null>(null);
  const longPressTriggered = useRef(false);

  const handlePointerDown = useCallback(() => {
    longPressTriggered.current = false;

    pressTimer.current = setTimeout(() => {
      onSelect();
      longPressTriggered.current = true;

      navigator.vibrate?.(10);
    }, delay);
  }, [onSelect, delay]);

  const handlePointerUp = useCallback(() => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
  }, []);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if (longPressTriggered.current) return;

      if (e.ctrlKey || e.metaKey) {
        onSelect();
      }
    },
    [onSelect],
  );

  return {
    handlePointerDown,
    handlePointerUp,
    handleClick,
  };
}
