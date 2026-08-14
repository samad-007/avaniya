"use client";

import { useState, useEffect, useCallback } from "react";

/**
 * Hook to manage smooth entrance and exit animations for modal dialogs.
 * Ensures that when closing, the exit animation completes before unmounting.
 */
export function useAnimatedModal(
  isOpen: boolean,
  onClose: () => void,
  duration = 150
) {
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setIsClosing(false);
    } else if (shouldRender && !isClosing) {
      setIsClosing(true);
      const timer = setTimeout(() => {
        setShouldRender(false);
        setIsClosing(false);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isOpen, shouldRender, isClosing, duration]);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, duration);
  }, [onClose, duration]);

  return {
    shouldRender,
    isClosing,
    handleClose,
  };
}
