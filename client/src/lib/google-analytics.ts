// Google Analytics 4 (GA4) Integration for Imperius Landing Page
// Comprehensive tracking for forms, conversions, and A/B test performance

declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

interface GAConfig {
  measurementId: string;
  debugMode?: boolean;
}

interface ConversionEvent {
  action: string;
  category?: string;
  label?: string;
  value?: number;
  custom_parameters?: Record<string, any>;
}

export class GoogleAnalytics {
  private config: GAConfig;
  private initialized = false;

  constructor(config: GAConfig) {
    this.config = config;
  }

  // Initialize GA4 tracking
  init(): void {
    if (this.initialized) return;

    // Initialize dataLayer
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag(...args: any[]) {
      window.dataLayer.push(args);
    };

    // Load GA4 script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${this.config.measurementId}`;
    document.head.appendChild(script);

    // Configure GA4
    window.gtag('js', new Date());
    window.gtag('config', this.config.measurementId, {
      debug_mode: this.config.debugMode,
      send_page_view: true,
      // Enhanced measurement for forms
      enhanced_measurement_settings: {
        forms: true,
        scrolls: true,
        outbound_clicks: true,
        site_search: false,
        video_engagement: false,
      }
    });

    this.initialized = true;
    console.log('GA4 initialized for Imperius analytics');
  }

  // Track form funnel events
  trackFormEvent(eventName: 'form_view' | 'form_start' | 'form_submit', params: {
    form_id?: string;
    form_source?: 'hero' | 'final_cta';
    email?: string;
    ab_test_variant?: string;
  } = {}): void {
    if (!this.initialized) return;

    const eventParams = {
      event_category: 'form_interaction',
      event_label: params.form_source || 'unknown',
      form_id: params.form_id,
      form_source: params.form_source,
      ab_test_variant: params.ab_test_variant,
      ...params
    };

    window.gtag('event', eventName, eventParams);

    // Set conversion for form_submit
    if (eventName === 'form_submit') {
      this.trackConversion({
        action: 'waitlist_signup',
        category: 'conversion',
        label: params.form_source,
        value: 1,
        custom_parameters: {
          email_domain: params.email ? params.email.split('@')[1] : undefined,
          ab_test_variant: params.ab_test_variant
        }
      });
    }

    console.log(`GA4 Event: ${eventName}`, eventParams);
  }

  // Track conversion events
  trackConversion(event: ConversionEvent): void {
    if (!this.initialized) return;

    window.gtag('event', event.action, {
      event_category: event.category || 'conversion',
      event_label: event.label,
      value: event.value,
      currency: 'USD', // For potential value tracking
      ...event.custom_parameters
    });

    // Mark as conversion
    window.gtag('event', 'conversion', {
      send_to: this.config.measurementId,
      event_category: event.category,
      transaction_id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    });

    console.log('GA4 Conversion:', event);
  }

  // Track A/B test interactions
  trackABTest(testName: string, variant: string, interaction?: string): void {
    if (!this.initialized) return;

    window.gtag('event', 'ab_test_interaction', {
      event_category: 'experiment',
      event_label: testName,
      custom_parameter_1: variant,
      custom_parameter_2: interaction || 'view',
      experiment_id: testName,
      variant_id: variant
    });

    // Set custom dimension for segmentation
    window.gtag('config', this.config.measurementId, {
      custom_map: {
        custom_dimension_1: 'ab_test_variant'
      }
    });

    console.log(`GA4 A/B Test: ${testName} - ${variant}`);
  }

  // Track click events with enhanced data
  trackClick(elementId: string, elementText: string, context: {
    ab_test_variant?: string;
    form_source?: string;
    page_section?: string;
  } = {}): void {
    if (!this.initialized) return;

    window.gtag('event', 'click', {
      event_category: 'engagement',
      event_label: elementId,
      element_text: elementText,
      page_section: context.page_section,
      ab_test_variant: context.ab_test_variant,
      form_source: context.form_source
    });
  }

  // Track scroll depth for engagement
  trackScrollDepth(depth: number, ab_test_variant?: string): void {
    if (!this.initialized) return;

    const milestone = depth >= 75 ? 'scroll_75' : depth >= 50 ? 'scroll_50' : 'scroll_25';
    
    window.gtag('event', milestone, {
      event_category: 'engagement',
      event_label: `${depth}%`,
      scroll_depth: depth,
      ab_test_variant
    });
  }

  // Track page views with A/B test context
  trackPageView(path: string, title?: string, ab_test_variants?: Record<string, string>): void {
    if (!this.initialized) return;

    window.gtag('config', this.config.measurementId, {
      page_path: path,
      page_title: title,
      ...ab_test_variants && Object.keys(ab_test_variants).reduce((acc, key) => ({
        ...acc,
        [`custom_parameter_${key}`]: ab_test_variants[key]
      }), {})
    });
  }

  // Enhanced ecommerce tracking for lead value
  trackLeadValue(email: string, leadScore: number, source: string): void {
    if (!this.initialized) return;

    window.gtag('event', 'generate_lead', {
      currency: 'USD',
      value: leadScore / 10, // Convert lead score to dollar value
      lead_source: source,
      lead_quality: leadScore > 50 ? 'high' : leadScore > 25 ? 'medium' : 'low',
      email_domain: email.split('@')[1]
    });
  }
}

// Form Drop-off Funnel Tracking
export class FormFunnelTracker {
  private ga: GoogleAnalytics;
  private currentStep = 0;
  private formId: string;
  private abTestVariant?: string;

  constructor(ga: GoogleAnalytics, formId: string, abTestVariant?: string) {
    this.ga = ga;
    this.formId = formId;
    this.abTestVariant = abTestVariant;
  }

  // Step 1: Form appears in viewport
  trackFormView(): void {
    this.currentStep = 1;
    this.ga.trackFormEvent('form_view', {
      form_id: this.formId,
      form_source: this.formId.includes('hero') ? 'hero' : 'final_cta',
      ab_test_variant: this.abTestVariant
    });
  }

  // Step 2: User focuses on email input
  trackFormStart(): void {
    if (this.currentStep < 1) this.trackFormView();
    this.currentStep = 2;
    
    this.ga.trackFormEvent('form_start', {
      form_id: this.formId,
      form_source: this.formId.includes('hero') ? 'hero' : 'final_cta',
      ab_test_variant: this.abTestVariant
    });
  }

  // Step 3: Form successfully submitted
  trackFormSubmit(email: string): void {
    if (this.currentStep < 2) this.trackFormStart();
    this.currentStep = 3;
    
    this.ga.trackFormEvent('form_submit', {
      form_id: this.formId,
      form_source: this.formId.includes('hero') ? 'hero' : 'final_cta',
      email,
      ab_test_variant: this.abTestVariant
    });
  }

  // Get funnel completion percentage
  getFunnelProgress(): number {
    return (this.currentStep / 3) * 100;
  }
}

// Initialize GA4 instance
let gaInstance: GoogleAnalytics | null = null;

export function initializeGA(): GoogleAnalytics | null {
  const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;
  
  if (!measurementId) {
    console.warn('GA4 Measurement ID not found. Set VITE_GA_MEASUREMENT_ID environment variable.');
    return null;
  }

  gaInstance = new GoogleAnalytics({
    measurementId,
    debugMode: import.meta.env.DEV
  });

  gaInstance.init();
  return gaInstance;
}

export function getGA(): GoogleAnalytics | null {
  return gaInstance;
}