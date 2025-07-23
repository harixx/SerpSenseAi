import { useEffect, useState, useCallback, useRef } from 'react';

/**
 * Enterprise-grade optimized scroll hook
 * Implements RAF-based throttling and passive event listeners for maximum performance
 * Following 12-factor app principles for client-side optimization
 */
export function useOptimizedScroll() {
  const [scrollY, setScrollY] = useState(0);
  const rafId = useRef<number | null>(null);
  const lastScrollY = useRef(0);

  const updateScrollY = useCallback(() => {
    const currentScrollY = window.scrollY;
    
    // Only update state if scroll position actually changed significantly
    if (Math.abs(currentScrollY - lastScrollY.current) > 1) {
      setScrollY(currentScrollY);
      lastScrollY.current = currentScrollY;
    }
    
    rafId.current = null;
  }, []);

  const handleScroll = useCallback(() => {
    // Use RAF for throttling - aligns with browser refresh rate
    if (rafId.current === null) {
      rafId.current = requestAnimationFrame(updateScrollY);
    }
  }, [updateScrollY]);

  useEffect(() => {
    // Initial scroll position
    setScrollY(window.scrollY);
    lastScrollY.current = window.scrollY;

    // Add passive event listener for better performance
    window.addEventListener('scroll', handleScroll, { 
      passive: true,
      capture: false 
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, [handleScroll]);

  // Performance-optimized transform calculations with memoization
  const getTransform = useCallback((
    scrollRange: [number, number], 
    outputRange: [number, number],
    type: 'translateY' | 'rotate' | 'scale' | 'opacity' = 'translateY'
  ) => {
    const [scrollStart, scrollEnd] = scrollRange;
    const [outputStart, outputEnd] = outputRange;
    
    // Clamp scroll value to range
    const clampedScroll = Math.max(scrollStart, Math.min(scrollEnd, scrollY));
    
    // Linear interpolation
    const progress = (clampedScroll - scrollStart) / (scrollEnd - scrollStart);
    const value = outputStart + (outputEnd - outputStart) * progress;
    
    switch (type) {
      case 'translateY':
        return `translateY(${value}px)`;
      case 'rotate':
        return `rotate(${value}deg)`;
      case 'scale':
        return `scale(${value})`;
      case 'opacity':
        return Math.max(0, Math.min(1, value));
      default:
        return value;
    }
  }, [scrollY]);

  return {
    scrollY,
    getTransform,
    isScrolling: rafId.current !== null
  };
}

/**
 * Intersection Observer hook for performance-critical viewport detection
 * Used for lazy loading and animation triggering
 */
export function useIntersectionObserver(
  options: IntersectionObserverInit = {}
) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);
  const targetRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const target = targetRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const intersecting = entry.isIntersecting;
        setIsIntersecting(intersecting);
        
        // Track if element has ever been in viewport
        if (intersecting && !hasIntersected) {
          setHasIntersected(true);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options
      }
    );

    observer.observe(target);

    return () => {
      observer.unobserve(target);
    };
  }, [hasIntersected, options]);

  return {
    targetRef,
    isIntersecting,
    hasIntersected
  };
}