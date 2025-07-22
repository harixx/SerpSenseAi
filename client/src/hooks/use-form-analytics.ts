// Form Analytics Hook for Imperius Landing Page
// Comprehensive form tracking with GA4 integration and funnel analysis

import { useEffect, useRef, useCallback } from 'react';
import { getGA, FormFunnelTracker } from '@/lib/google-analytics';
import { getABTestManager } from '@/lib/ab-testing';

interface FormAnalyticsConfig {
  formId: string;
  formSource: 'hero' | 'final_cta';
  enableIntersectionObserver?: boolean;
  enableScrollTracking?: boolean;
}

interface FormAnalyticsReturn {
  trackFormView: () => void;
  trackFormStart: () => void;
  trackFormSubmit: (email: string) => void;
  trackFieldFocus: (fieldName: string) => void;
  trackFieldBlur: (fieldName: string, value: string) => void;
  getFunnelProgress: () => number;
}

export function useFormAnalytics(config: FormAnalyticsConfig): FormAnalyticsReturn {
  const ga = getGA();
  const abTestManager = getABTestManager();
  const funnelTracker = useRef<FormFunnelTracker | null>(null);
  const formElement = useRef<HTMLFormElement | null>(null);
  const intersectionObserver = useRef<IntersectionObserver | null>(null);
  const hasTrackedView = useRef(false);
  const fieldInteractions = useRef<Record<string, { focused: boolean; filled: boolean }>>({});

  // Initialize funnel tracker with A/B test context
  useEffect(() => {
    if (!ga) return;

    // Get current A/B test assignments for context
    const assignments = abTestManager?.getAllAssignments() || {};
    const primaryVariant = Object.values(assignments)[0]?.variant;

    funnelTracker.current = new FormFunnelTracker(
      ga,
      config.formId,
      primaryVariant
    );
  }, [ga, abTestManager, config.formId]);

  // Set up intersection observer for form view tracking
  useEffect(() => {
    if (!config.enableIntersectionObserver || !funnelTracker.current) return;

    intersectionObserver.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasTrackedView.current) {
            funnelTracker.current?.trackFormView();
            hasTrackedView.current = true;
          }
        });
      },
      {
        threshold: 0.5, // Form must be 50% visible
        rootMargin: '0px 0px -50px 0px' // Trigger slightly before fully visible
      }
    );

    // Find form element and observe it
    const form = document.getElementById(config.formId) as HTMLFormElement;
    if (form) {
      formElement.current = form;
      intersectionObserver.current.observe(form);
    }

    return () => {
      if (intersectionObserver.current) {
        intersectionObserver.current.disconnect();
      }
    };
  }, [config.formId, config.enableIntersectionObserver]);

  // Enhanced form interaction tracking
  useEffect(() => {
    if (!formElement.current || !ga) return;

    const form = formElement.current;

    // Track form field interactions
    const handleFieldFocus = (event: FocusEvent) => {
      const target = event.target as HTMLInputElement;
      if (!target || target.type === 'submit') return;

      const fieldName = target.name || target.id || 'unknown';
      
      // Track first field focus as form start
      if (!Object.keys(fieldInteractions.current).some(key => fieldInteractions.current[key].focused)) {
        funnelTracker.current?.trackFormStart();
      }

      fieldInteractions.current[fieldName] = {
        ...(fieldInteractions.current[fieldName] || {}),
        focused: true
      };

      // Track individual field focus
      ga.trackClick(target.id || fieldName, `Focus: ${fieldName}`, {
        form_source: config.formSource,
        page_section: 'form',
        ab_test_variant: abTestManager?.getAllAssignments()
          ? Object.values(abTestManager.getAllAssignments())[0]?.variant
          : undefined
      });
    };

    const handleFieldBlur = (event: FocusEvent) => {
      const target = event.target as HTMLInputElement;
      if (!target || target.type === 'submit') return;

      const fieldName = target.name || target.id || 'unknown';
      const hasValue = target.value.length > 0;

      fieldInteractions.current[fieldName] = {
        ...(fieldInteractions.current[fieldName] || {}),
        filled: hasValue
      };

      // Track field completion
      if (hasValue && fieldName === 'email') {
        ga.trackClick(target.id || fieldName, `Email filled: ${target.value.split('@')[1]}`, {
          form_source: config.formSource,
          page_section: 'form'
        });
      }
    };

    // Track form submission attempts
    const handleFormSubmit = (event: SubmitEvent) => {
      const formData = new FormData(form);
      const email = formData.get('email') as string;
      
      if (email) {
        funnelTracker.current?.trackFormSubmit(email);
        
        // Track A/B test conversion
        const assignments = abTestManager?.getAllAssignments() || {};
        Object.keys(assignments).forEach(testName => {
          abTestManager?.trackConversion(testName, 1);
        });
      }
    };

    // Attach event listeners
    form.addEventListener('focusin', handleFieldFocus);
    form.addEventListener('focusout', handleFieldBlur);
    form.addEventListener('submit', handleFormSubmit);

    return () => {
      form.removeEventListener('focusin', handleFieldFocus);
      form.removeEventListener('focusout', handleFieldBlur);
      form.removeEventListener('submit', handleFormSubmit);
    };
  }, [ga, abTestManager, config.formSource]);

  // Manual tracking functions
  const trackFormView = useCallback(() => {
    if (!hasTrackedView.current) {
      funnelTracker.current?.trackFormView();
      hasTrackedView.current = true;
    }
  }, []);

  const trackFormStart = useCallback(() => {
    funnelTracker.current?.trackFormStart();
  }, []);

  const trackFormSubmit = useCallback((email: string) => {
    funnelTracker.current?.trackFormSubmit(email);
    
    // Track conversion for all active A/B tests
    const assignments = abTestManager?.getAllAssignments() || {};
    Object.keys(assignments).forEach(testName => {
      abTestManager?.trackConversion(testName, 1);
    });
  }, [abTestManager]);

  const trackFieldFocus = useCallback((fieldName: string) => {
    ga?.trackClick(fieldName, `Focus: ${fieldName}`, {
      form_source: config.formSource,
      page_section: 'form'
    });
  }, [ga, config.formSource]);

  const trackFieldBlur = useCallback((fieldName: string, value: string) => {
    if (fieldName === 'email' && value) {
      ga?.trackClick(fieldName, `Email filled: ${value.split('@')[1]}`, {
        form_source: config.formSource,
        page_section: 'form'
      });
    }
  }, [ga, config.formSource]);

  const getFunnelProgress = useCallback(() => {
    return funnelTracker.current?.getFunnelProgress() || 0;
  }, []);

  return {
    trackFormView,
    trackFormStart,
    trackFormSubmit,
    trackFieldFocus,
    trackFieldBlur,
    getFunnelProgress
  };
}

// Scroll depth tracking hook
export function useScrollAnalytics() {
  const ga = getGA();
  const abTestManager = getABTestManager();
  const trackedDepths = useRef<Set<number>>(new Set());

  useEffect(() => {
    if (!ga) return;

    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = Math.round((scrollTop / documentHeight) * 100);

      // Track at 25%, 50%, 75%, 90% milestones
      const milestones = [25, 50, 75, 90];
      const currentMilestone = milestones.find(
        m => scrollPercent >= m && !trackedDepths.current.has(m)
      );

      if (currentMilestone) {
        trackedDepths.current.add(currentMilestone);
        
        const assignments = abTestManager?.getAllAssignments() || {};
        const primaryVariant = Object.values(assignments)[0]?.variant;
        
        ga.trackScrollDepth(currentMilestone, primaryVariant);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [ga, abTestManager]);
}

// Click tracking hook for enhanced analytics
export function useClickAnalytics() {
  const ga = getGA();
  const abTestManager = getABTestManager();

  const trackClick = useCallback((
    elementId: string,
    elementText: string,
    context: {
      pageSection?: string;
      actionType?: string;
    } = {}
  ) => {
    if (!ga) return;

    const assignments = abTestManager?.getAllAssignments() || {};
    const primaryVariant = Object.values(assignments)[0]?.variant;

    ga.trackClick(elementId, elementText, {
      ab_test_variant: primaryVariant,
      page_section: context.pageSection,
      form_source: context.actionType
    });
  }, [ga, abTestManager]);

  return { trackClick };
}