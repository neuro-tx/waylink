import { RefObject, useEffect } from "react";

/**
 * Hook that triggers a callback when user clicks outside of the referenced element
 * 
 * @param ref - React ref object pointing to the element to detect outside clicks for
 * @param callback - Function to call when outside click is detected
 * @param ignoreRefs - Optional array of refs to ignore (e.g., toggle button)
 */
export function useClickOutside<T extends HTMLElement = HTMLElement>(
  ref: RefObject<T | null>,
  callback: (event: MouseEvent | TouchEvent) => void,
  ignoreRefs?: RefObject<HTMLElement | null>[],
) {
  useEffect(() => {
    const handleClickout = (e: MouseEvent | TouchEvent) => {
      // Check if click is on any ignored element
      const isIgnored = ignoreRefs?.some((ignoreRef) =>
        ignoreRef.current?.contains(e.target as Node),
      );

      if (isIgnored) return;

      if (ref.current && !ref.current.contains(e.target as Node)) {
        callback(e);
      }
    };

    document.addEventListener("mousedown", handleClickout);
    document.addEventListener("touchstart", handleClickout);

    return () => {
      document.removeEventListener("mousedown", handleClickout);
      document.removeEventListener("touchstart", handleClickout);
    };
  }, [ref, callback, ignoreRefs]);
}
