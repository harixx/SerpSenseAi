import { useState, useEffect, useCallback } from 'react';
import { apiRequest } from '@/lib/queryClient';

interface AbTestConfig {
  sessionId: string;
  enableTesting?: boolean;
}

interface AbTestVariant {
  testName: string;
  variant: string;
  config: any;
}

export function useAbTest(config: AbTestConfig) {
  const [variants, setVariants] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Initialize A/B tests for session
  useEffect(() => {
    if (!config.enableTesting) {
      setIsLoading(false);
      return;
    }

    const initializeTests = async () => {
      try {
        const response = await apiRequest('POST', '/api/analytics/ab-tests/initialize', {
          sessionId: config.sessionId,
        });
        const data = await response.json();
        setVariants(data.variants || {});
      } catch (error) {
        console.error('Failed to initialize A/B tests:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeTests();
  }, [config.sessionId, config.enableTesting]);

  // Get variant for specific test
  const getVariant = useCallback((testName: string, defaultVariant: string = 'A'): string => {
    return variants[testName] || defaultVariant;
  }, [variants]);

  // Track A/B test conversion
  const trackConversion = useCallback(async (testName: string, conversionType: string = 'signup') => {
    if (!config.enableTesting) return;

    try {
      await apiRequest('POST', '/api/analytics/ab-tests/conversion', {
        sessionId: config.sessionId,
        testName,
        conversionType,
        variant: variants[testName],
      });
    } catch (error) {
      console.error('Failed to track A/B test conversion:', error);
    }
  }, [config.sessionId, config.enableTesting, variants]);

  return {
    getVariant,
    trackConversion,
    isLoading,
    variants,
  };
}

// Predefined A/B test configurations
export const AB_TEST_CONFIGS = {
  hero_cta: {
    A: {
      text: "Request Exclusive Access",
      style: "bg-crimson hover:bg-ruby",
      urgency: false,
    },
    B: {
      text: "Join Elite Waitlist - Limited Spots",
      style: "bg-gradient-to-r from-crimson to-ruby hover:from-ruby hover:to-crimson",
      urgency: true,
    },
    C: {
      text: "Secure Your Strategic Advantage",
      style: "bg-crimson hover:bg-ruby animate-pulse",
      urgency: true,
    }
  },
  hero_headline: {
    A: {
      primary: "Beyond Keywords. Beyond Rankings.",
      secondary: "The first AI-powered SERP intelligence platform that reveals why pages rank—not just who ranks.",
    },
    B: {
      primary: "Stop Guessing. Start Dominating.",
      secondary: "Join an exclusive cohort of strategic SEO professionals who've moved beyond keyword tracking to true competitive intelligence.",
    },
    C: {
      primary: "The Intelligence Advantage.",
      secondary: "Uncover the hidden signals that drive rankings: tone, sentiment, UX patterns, and content depth that your competitors miss.",
    }
  },
  pricing_psychology: {
    A: {
      showOriginalPrice: false,
      emphasizeValue: false,
      urgencyIndicator: false,
    },
    B: {
      showOriginalPrice: true,
      originalPrice: "$1,497",
      emphasizeValue: true,
      urgencyIndicator: false,
    },
    C: {
      showOriginalPrice: true,
      originalPrice: "$1,497",
      emphasizeValue: true,
      urgencyIndicator: true,
      spotsRemaining: true,
    }
  },
  social_proof: {
    A: {
      showCount: true,
      showTestimonials: false,
      countStyle: "simple",
    },
    B: {
      showCount: true,
      showTestimonials: true,
      countStyle: "animated",
    },
    C: {
      showCount: true,
      showTestimonials: true,
      countStyle: "animated",
      showTrustBadges: true,
    }
  }
};

// Hook for specific test configurations
export function useHeroCTATest(sessionId: string) {
  const { getVariant, trackConversion } = useAbTest({ sessionId, enableTesting: true });
  const variant = getVariant('hero_cta', 'A');
  const config = AB_TEST_CONFIGS.hero_cta[variant as keyof typeof AB_TEST_CONFIGS.hero_cta];

  return {
    variant,
    config,
    trackConversion: () => trackConversion('hero_cta'),
  };
}

export function useHeroHeadlineTest(sessionId: string) {
  const { getVariant, trackConversion } = useAbTest({ sessionId, enableTesting: true });
  const variant = getVariant('hero_headline', 'A');
  const config = AB_TEST_CONFIGS.hero_headline[variant as keyof typeof AB_TEST_CONFIGS.hero_headline];

  return {
    variant,
    config,
    trackConversion: () => trackConversion('hero_headline'),
  };
}

export function usePricingPsychologyTest(sessionId: string) {
  const { getVariant, trackConversion } = useAbTest({ sessionId, enableTesting: true });
  const variant = getVariant('pricing_psychology', 'A');
  const config = AB_TEST_CONFIGS.pricing_psychology[variant as keyof typeof AB_TEST_CONFIGS.pricing_psychology];

  return {
    variant,
    config,
    trackConversion: () => trackConversion('pricing_psychology'),
  };
}

export function useSocialProofTest(sessionId: string) {
  const { getVariant, trackConversion } = useAbTest({ sessionId, enableTesting: true });
  const variant = getVariant('social_proof', 'A');
  const config = AB_TEST_CONFIGS.social_proof[variant as keyof typeof AB_TEST_CONFIGS.social_proof];

  return {
    variant,
    config,
    trackConversion: () => trackConversion('social_proof'),
  };
}