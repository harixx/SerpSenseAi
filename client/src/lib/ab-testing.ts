// A/B Testing Framework for Imperius Landing Page
// Enterprise-grade testing with statistical significance tracking

import { getGA } from './google-analytics';

interface ABTestConfig {
  testName: string;
  variants: {
    [key: string]: {
      weight: number; // Percentage 0-100
      config: any;
    };
  };
  targetElement?: string;
  duration?: number; // Days
  minSampleSize?: number;
}

interface ABTestResult {
  variant: string;
  config: any;
  isControl: boolean;
}

interface ConversionData {
  variant: string;
  conversions: number;
  visitors: number;
  conversionRate: number;
  confidence?: number;
}

export class ABTestManager {
  private activeTests: Map<string, ABTestResult> = new Map();
  private sessionId: string;
  private analytics = getGA();

  constructor(sessionId: string) {
    this.sessionId = sessionId;
  }

  // Assign user to test variant
  async assignToTest(config: ABTestConfig): Promise<ABTestResult> {
    const existingAssignment = this.activeTests.get(config.testName);
    if (existingAssignment) {
      return existingAssignment;
    }

    // Check for existing assignment from server
    try {
      const response = await fetch('/api/analytics/ab-tests/assignment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: this.sessionId,
          testName: config.testName
        })
      });

      if (response.ok) {
        const { assignment } = await response.json();
        if (assignment) {
          const result = {
            variant: assignment.variant,
            config: config.variants[assignment.variant]?.config,
            isControl: assignment.variant === 'control'
          };
          this.activeTests.set(config.testName, result);
          return result;
        }
      }
    } catch (error) {
      console.error('Failed to fetch existing assignment:', error);
    }

    // Assign new variant based on weights
    const variant = this.selectVariant(config.variants);
    const result = {
      variant,
      config: config.variants[variant]?.config,
      isControl: variant === 'control'
    };

    // Store assignment on server
    try {
      await fetch('/api/analytics/ab-tests/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: this.sessionId,
          testName: config.testName,
          variant
        })
      });
    } catch (error) {
      console.error('Failed to store assignment:', error);
    }

    this.activeTests.set(config.testName, result);

    // Track assignment in GA4
    this.analytics?.trackABTest(config.testName, variant, 'assigned');

    return result;
  }

  // Select variant based on weighted distribution
  private selectVariant(variants: ABTestConfig['variants']): string {
    const random = Math.random() * 100;
    let cumulative = 0;

    for (const [variant, config] of Object.entries(variants)) {
      cumulative += config.weight;
      if (random <= cumulative) {
        return variant;
      }
    }

    // Fallback to first variant
    return Object.keys(variants)[0];
  }

  // Track conversion for current tests
  trackConversion(testName: string, conversionValue: number = 1): void {
    const assignment = this.activeTests.get(testName);
    if (!assignment) return;

    // Track in analytics
    this.analytics?.trackABTest(testName, assignment.variant, 'conversion');

    // Send to server for statistical analysis
    fetch('/api/analytics/ab-tests/conversion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: this.sessionId,
        testName,
        variant: assignment.variant,
        conversionValue
      })
    }).catch(error => console.error('Failed to track conversion:', error));
  }

  // Get current assignment for a test
  getAssignment(testName: string): ABTestResult | null {
    return this.activeTests.get(testName) || null;
  }

  // Get all active assignments
  getAllAssignments(): Record<string, ABTestResult> {
    return Object.fromEntries(this.activeTests);
  }
}

// Pre-configured A/B Tests for Imperius Landing Page
export const IMPERIUS_AB_TESTS = {
  // Test 1: CTA Copy Variations
  CTA_COPY: {
    testName: 'cta_copy_test',
    variants: {
      control: {
        weight: 50,
        config: {
          text: 'Request Early Access',
          style: 'bg-red-600 hover:bg-red-700'
        }
      },
      variant_a: {
        weight: 50,
        config: {
          text: 'Join Invite-Only Waitlist',
          style: 'bg-red-600 hover:bg-red-700'
        }
      }
    },
    minSampleSize: 100
  },

  // Test 2: Button Color/Style
  BUTTON_STYLE: {
    testName: 'button_style_test',
    variants: {
      control: {
        weight: 33,
        config: {
          style: 'bg-red-600 hover:bg-red-700 text-white',
          design: 'solid_red'
        }
      },
      variant_a: {
        weight: 33,
        config: {
          style: 'border-2 border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-black',
          design: 'gold_outline'
        }
      },
      variant_b: {
        weight: 34,
        config: {
          style: 'bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800',
          design: 'gradient_red'
        }
      }
    },
    minSampleSize: 150
  },

  // Test 3: Headline Variation
  HEADLINE: {
    testName: 'headline_test',
    variants: {
      control: {
        weight: 50,
        config: {
          text: 'Know Why They Rank — Then Outrank Them.',
          emphasis: 'analytical'
        }
      },
      variant_a: {
        weight: 50,
        config: {
          text: 'Unlock Google\'s Ranking Secrets with AI.',
          emphasis: 'discovery'
        }
      }
    },
    minSampleSize: 200
  },

  // Test 4: Social Proof Position
  SOCIAL_PROOF: {
    testName: 'social_proof_test',
    variants: {
      control: {
        weight: 50,
        config: {
          position: 'below_hero',
          style: 'minimal'
        }
      },
      variant_a: {
        weight: 50,
        config: {
          position: 'above_form',
          style: 'enhanced'
        }
      }
    },
    minSampleSize: 100
  }
} as const;

// Statistical Significance Calculator
export class StatisticalAnalyzer {
  // Calculate conversion rate with confidence interval
  static calculateConversionRate(conversions: number, visitors: number): {
    rate: number;
    confidenceInterval: [number, number];
  } {
    const rate = visitors > 0 ? conversions / visitors : 0;
    const z = 1.96; // 95% confidence
    const margin = z * Math.sqrt((rate * (1 - rate)) / visitors);
    
    return {
      rate,
      confidenceInterval: [
        Math.max(0, rate - margin),
        Math.min(1, rate + margin)
      ]
    };
  }

  // Z-test for statistical significance between variants
  static calculateSignificance(
    controlData: { conversions: number; visitors: number },
    variantData: { conversions: number; visitors: number }
  ): {
    pValue: number;
    isSignificant: boolean;
    confidence: number;
    zScore: number;
  } {
    const p1 = controlData.conversions / controlData.visitors;
    const p2 = variantData.conversions / variantData.visitors;
    const n1 = controlData.visitors;
    const n2 = variantData.visitors;

    const pooledP = (controlData.conversions + variantData.conversions) / (n1 + n2);
    const se = Math.sqrt(pooledP * (1 - pooledP) * (1/n1 + 1/n2));
    const zScore = (p2 - p1) / se;
    
    // Two-tailed p-value approximation
    const pValue = 2 * (1 - this.normalCDF(Math.abs(zScore)));
    const isSignificant = pValue < 0.05;
    const confidence = (1 - pValue) * 100;

    return {
      pValue,
      isSignificant,
      confidence: Math.min(99.9, confidence),
      zScore
    };
  }

  // Normal cumulative distribution function approximation
  private static normalCDF(x: number): number {
    return (1 + this.erf(x / Math.sqrt(2))) / 2;
  }

  // Error function approximation
  private static erf(x: number): number {
    const a1 =  0.254829592;
    const a2 = -0.284496736;
    const a3 =  1.421413741;
    const a4 = -1.453152027;
    const a5 =  1.061405429;
    const p  =  0.3275911;

    const sign = x >= 0 ? 1 : -1;
    x = Math.abs(x);

    const t = 1.0 / (1.0 + p * x);
    const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

    return sign * y;
  }

  // Determine minimum sample size for desired confidence
  static calculateMinSampleSize(
    baselineRate: number,
    minimumDetectableEffect: number,
    power: number = 0.8,
    alpha: number = 0.05
  ): number {
    const za = 1.96; // Z-score for 95% confidence
    const zb = 0.84; // Z-score for 80% power
    
    const p1 = baselineRate;
    const p2 = baselineRate + minimumDetectableEffect;
    const pooledP = (p1 + p2) / 2;
    
    const numerator = Math.pow(za * Math.sqrt(2 * pooledP * (1 - pooledP)) + zb * Math.sqrt(p1 * (1 - p1) + p2 * (1 - p2)), 2);
    const denominator = Math.pow(p2 - p1, 2);
    
    return Math.ceil(numerator / denominator);
  }
}

// Global AB test manager instance
let abTestManager: ABTestManager | null = null;

export function initializeABTesting(sessionId: string): ABTestManager {
  abTestManager = new ABTestManager(sessionId);
  return abTestManager;
}

export function getABTestManager(): ABTestManager | null {
  return abTestManager;
}