// A/B Test Wrapper Component for Imperius Landing Page
// Provides seamless A/B testing integration with Google Analytics tracking

import { useEffect, useState, ReactNode } from 'react';
import { getABTestManager, IMPERIUS_AB_TESTS } from '@/lib/ab-testing';
import { getGA } from '@/lib/google-analytics';

interface ABTestWrapperProps {
  testName: keyof typeof IMPERIUS_AB_TESTS;
  children: (variant: any, isLoading: boolean) => ReactNode;
  fallback?: ReactNode;
}

interface ABTestContextType {
  variant: any;
  testName: string;
  isControl: boolean;
  isLoading: boolean;
}

export function ABTestWrapper({ testName, children, fallback }: ABTestWrapperProps) {
  const [testContext, setTestContext] = useState<ABTestContextType>({
    variant: null,
    testName,
    isControl: true,
    isLoading: true
  });

  useEffect(() => {
    const initializeTest = async () => {
      const abTestManager = getABTestManager();
      const ga = getGA();
      
      if (!abTestManager) {
        console.warn('A/B Test Manager not initialized');
        setTestContext(prev => ({ ...prev, isLoading: false }));
        return;
      }

      try {
        const testConfig = IMPERIUS_AB_TESTS[testName];
        const assignment = await abTestManager.assignToTest(testConfig);
        
        // Track assignment in Google Analytics
        ga?.trackABTest(testName, assignment.variant, 'assigned');
        
        setTestContext({
          variant: assignment.config,
          testName,
          isControl: assignment.isControl,
          isLoading: false
        });

        console.log(`A/B Test ${testName}: assigned to ${assignment.variant}`, assignment.config);
        
      } catch (error) {
        console.error(`Failed to initialize A/B test ${testName}:`, error);
        setTestContext(prev => ({ ...prev, isLoading: false }));
      }
    };

    initializeTest();
  }, [testName]);

  if (testContext.isLoading) {
    return fallback || <div className="animate-pulse bg-gray-200 h-8 w-32 rounded"></div>;
  }

  return (
    <>
      {children(testContext.variant, testContext.isLoading)}
    </>
  );
}

// Specific A/B Test Components for Imperius Landing Page

export function ABTestCTAButton({ 
  onClick, 
  className = "",
  children 
}: { 
  onClick?: () => void;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <ABTestWrapper testName="CTA_COPY">
      {(variant, isLoading) => {
        if (isLoading) {
          return <div className="animate-pulse bg-red-600 h-12 w-48 rounded-lg"></div>;
        }

        const buttonText = variant?.text || 'Request Early Access';
        const buttonStyle = variant?.style || 'bg-red-600 hover:bg-red-700';

        return (
          <button
            onClick={onClick}
            className={`px-8 py-3 rounded-lg font-semibold transition-all duration-200 ${buttonStyle} ${className}`}
          >
            {children || buttonText}
          </button>
        );
      }}
    </ABTestWrapper>
  );
}

export function ABTestHeadline({ className = "" }: { className?: string }) {
  return (
    <ABTestWrapper testName="HEADLINE">
      {(variant, isLoading) => {
        if (isLoading) {
          return <div className="animate-pulse bg-gray-200 h-12 w-96 rounded"></div>;
        }

        const headlineText = variant?.text || 'Know Why They Rank — Then Outrank Them.';
        const emphasis = variant?.emphasis || 'analytical';

        return (
          <h1 className={`text-4xl md:text-6xl font-bold leading-tight ${className}`}>
            {emphasis === 'discovery' ? (
              <span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
                {headlineText}
              </span>
            ) : (
              <span className="text-white">
                {headlineText}
              </span>
            )}
          </h1>
        );
      }}
    </ABTestWrapper>
  );
}

export function ABTestButtonStyle({ 
  onClick,
  children,
  className = ""
}: {
  onClick?: () => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <ABTestWrapper testName="BUTTON_STYLE">
      {(variant, isLoading) => {
        if (isLoading) {
          return <div className="animate-pulse bg-gray-200 h-12 w-48 rounded"></div>;
        }

        const buttonStyle = variant?.style || 'bg-red-600 hover:bg-red-700 text-white';
        const design = variant?.design || 'solid_red';

        return (
          <button
            onClick={onClick}
            className={`px-8 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 ${buttonStyle} ${className}`}
            data-ab-design={design}
          >
            {children}
          </button>
        );
      }}
    </ABTestWrapper>
  );
}

// Hook for tracking A/B test interactions
export function useABTestTracking(testName: keyof typeof IMPERIUS_AB_TESTS) {
  const trackInteraction = (interaction: string) => {
    const abTestManager = getABTestManager();
    const ga = getGA();
    
    if (abTestManager) {
      const assignment = abTestManager.getAssignment(testName);
      if (assignment) {
        ga?.trackABTest(testName, assignment.variant, interaction);
      }
    }
  };

  const trackConversion = () => {
    const abTestManager = getABTestManager();
    if (abTestManager) {
      abTestManager.trackConversion(testName, 1);
    }
  };

  return { trackInteraction, trackConversion };
}