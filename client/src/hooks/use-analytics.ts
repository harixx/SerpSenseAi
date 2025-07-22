import { useEffect, useRef, useCallback } from 'react';
import { apiRequest } from '@/lib/queryClient';

interface AnalyticsConfig {
  sessionId: string;
  userId?: string;
  enableTracking?: boolean;
}

export function useAnalytics(config: AnalyticsConfig) {
  const sessionRef = useRef<string>(config.sessionId);
  const startTime = useRef<number>(Date.now());
  const lastScrollDepth = useRef<number>(0);
  const eventsQueue = useRef<any[]>([]);
  const flushTimeout = useRef<NodeJS.Timeout | null>(null);

  // Initialize session
  useEffect(() => {
    if (!config.enableTracking) return;

    const initSession = async () => {
      try {
        const sessionData = {
          sessionId: config.sessionId,
          userId: config.userId || `anon_${Date.now()}`,
          ipAddress: '', // Server will capture this
          userAgent: navigator.userAgent,
          referrer: document.referrer || '',
          utmSource: new URLSearchParams(window.location.search).get('utm_source') || '',
          utmMedium: new URLSearchParams(window.location.search).get('utm_medium') || '',
          utmCampaign: new URLSearchParams(window.location.search).get('utm_campaign') || '',
          device: getDeviceType(),
          browser: getBrowserType(),
        };

        await apiRequest('POST', '/api/analytics/session', sessionData);
        
        // Track initial page view
        trackEvent('page_view', {
          pagePath: window.location.pathname,
          timeOnPage: 0,
        });

      } catch (error) {
        console.error('Failed to initialize analytics session:', error);
      }
    };

    initSession();
  }, [config.sessionId, config.userId, config.enableTracking]);

  // Event tracking function
  const trackEvent = useCallback(async (
    eventType: string, 
    data: {
      elementId?: string;
      elementText?: string;
      pagePath?: string;
      scrollDepth?: number;
      timeOnPage?: number;
      metadata?: any;
    } = {}
  ) => {
    if (!config.enableTracking) return;

    const eventData = {
      sessionId: sessionRef.current,
      eventType,
      elementId: data.elementId || '',
      elementText: data.elementText || '',
      pagePath: data.pagePath || window.location.pathname,
      scrollDepth: data.scrollDepth || 0,
      timeOnPage: data.timeOnPage || Math.floor((Date.now() - startTime.current) / 1000),
      metadata: JSON.stringify(data.metadata || {}),
    };

    // Add to queue for batch processing
    eventsQueue.current.push(eventData);

    // Flush queue periodically or when it gets large
    if (eventsQueue.current.length >= 5 || eventType === 'page_unload') {
      flushEvents();
    } else if (!flushTimeout.current) {
      flushTimeout.current = setTimeout(flushEvents, 2000);
    }
  }, [config.enableTracking]);

  // Flush events to server
  const flushEvents = useCallback(async () => {
    if (eventsQueue.current.length === 0) return;

    const events = [...eventsQueue.current];
    eventsQueue.current = [];

    if (flushTimeout.current) {
      clearTimeout(flushTimeout.current);
      flushTimeout.current = null;
    }

    try {
      await apiRequest('POST', '/api/analytics/events', { events });
    } catch (error) {
      console.error('Failed to flush analytics events:', error);
      // Re-queue failed events
      eventsQueue.current.unshift(...events);
    }
  }, []);

  // Track lead actions for scoring
  const trackLeadAction = useCallback(async (
    actionType: string,
    actionValue?: string
  ) => {
    if (!config.enableTracking) return;

    try {
      await apiRequest('POST', '/api/analytics/lead-action', {
        sessionId: sessionRef.current,
        actionType,
        actionValue,
      });
    } catch (error) {
      console.error('Failed to track lead action:', error);
    }
  }, [config.enableTracking]);

  // Scroll tracking
  useEffect(() => {
    if (!config.enableTracking) return;

    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollDepth = Math.round((scrollTop / scrollHeight) * 100);

      // Track significant scroll milestones
      if (scrollDepth >= 50 && lastScrollDepth.current < 50) {
        trackEvent('scroll', { scrollDepth: 50 });
        trackLeadAction('scroll_50');
      } else if (scrollDepth >= 75 && lastScrollDepth.current < 75) {
        trackEvent('scroll', { scrollDepth: 75 });
        trackLeadAction('scroll_75');
      } else if (scrollDepth >= 90 && lastScrollDepth.current < 90) {
        trackEvent('scroll', { scrollDepth: 90 });
        trackLeadAction('scroll_90');
      }

      lastScrollDepth.current = scrollDepth;
    };

    const throttledScroll = throttle(handleScroll, 1000);
    window.addEventListener('scroll', throttledScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', throttledScroll);
    };
  }, [config.enableTracking, trackEvent, trackLeadAction]);

  // Click tracking
  useEffect(() => {
    if (!config.enableTracking) return;

    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const elementId = target.id || target.closest('[id]')?.id || '';
      const elementText = target.textContent?.trim().substring(0, 100) || '';
      const isButton = target.tagName === 'BUTTON' || target.closest('button');
      const isLink = target.tagName === 'A' || target.closest('a');
      const isCTA = elementText.toLowerCase().includes('request') || 
                   elementText.toLowerCase().includes('access') || 
                   elementText.toLowerCase().includes('secure');

      trackEvent('click', {
        elementId,
        elementText,
        metadata: {
          tagName: target.tagName,
          isButton,
          isLink,
          isCTA,
        },
      });

      // Track as lead action if it's a CTA
      if (isCTA) {
        trackLeadAction('cta_click', elementText);
      }
    };

    document.addEventListener('click', handleClick, { passive: true });

    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, [config.enableTracking, trackEvent, trackLeadAction]);

  // Form interaction tracking
  useEffect(() => {
    if (!config.enableTracking) return;

    const handleFormFocus = (event: FocusEvent) => {
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' && target.getAttribute('type') === 'email') {
        trackEvent('form_focus', {
          elementId: target.id,
          elementText: target.getAttribute('placeholder') || '',
        });
        trackLeadAction('form_focus');
      }
    };

    const handleFormInput = (event: Event) => {
      const target = event.target as HTMLInputElement;
      if (target && target.type === 'email' && target.value.includes('@')) {
        trackLeadAction('email_fill', target.value);
      }
    };

    document.addEventListener('focus', handleFormFocus, true);
    document.addEventListener('input', handleFormInput, true);

    return () => {
      document.removeEventListener('focus', handleFormFocus, true);
      document.removeEventListener('input', handleFormInput, true);
    };
  }, [config.enableTracking, trackEvent, trackLeadAction]);

  // Page unload tracking
  useEffect(() => {
    if (!config.enableTracking) return;

    const handleBeforeUnload = () => {
      trackEvent('page_unload', {
        timeOnPage: Math.floor((Date.now() - startTime.current) / 1000),
      });
      flushEvents();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [config.enableTracking, trackEvent, flushEvents]);

  return {
    trackEvent,
    trackLeadAction,
    flushEvents,
  };
}

// Utility functions
function getDeviceType(): string {
  const userAgent = navigator.userAgent.toLowerCase();
  if (/tablet|ipad|playbook|silk/.test(userAgent)) return 'tablet';
  if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/.test(userAgent)) return 'mobile';
  return 'desktop';
}

function getBrowserType(): string {
  const userAgent = navigator.userAgent.toLowerCase();
  if (userAgent.includes('chrome')) return 'chrome';
  if (userAgent.includes('firefox')) return 'firefox';
  if (userAgent.includes('safari')) return 'safari';
  if (userAgent.includes('edge')) return 'edge';
  return 'other';
}

function throttle<T extends (...args: any[]) => any>(func: T, limit: number): T {
  let inThrottle: boolean;
  return ((...args: any[]) => {
    if (!inThrottle) {
      func.apply(null, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  }) as T;
}