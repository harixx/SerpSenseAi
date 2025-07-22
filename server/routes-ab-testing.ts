// A/B Testing API Routes for Imperius Landing Page
// Enterprise-grade testing infrastructure with statistical analysis

import { Router } from 'express';
import { analyticsService } from './analytics';
import { insertPageEventSchema, insertLeadActionSchema } from '@shared/schema';
import { z } from 'zod';

const router = Router();

// Schema validation for A/B test requests
const assignTestSchema = z.object({
  sessionId: z.string(),
  testName: z.string(),
  variant: z.string()
});

const getAssignmentSchema = z.object({
  sessionId: z.string(),
  testName: z.string()
});

const trackConversionSchema = z.object({
  sessionId: z.string(),
  testName: z.string(),
  variant: z.string(),
  conversionValue: z.number().default(1)
});

// Initialize A/B test for session
router.post('/initialize', async (req, res) => {
  try {
    const { sessionId, testName, variants } = req.body;

    // Check for existing assignment
    const existingAssignment = await analyticsService.getTestAssignment(sessionId, testName);
    
    if (existingAssignment) {
      return res.json({
        success: true,
        variant: existingAssignment.variant,
        testId: existingAssignment.testId
      });
    }

    // Get active test configuration
    const activeTests = await analyticsService.getActiveTests();
    const testConfig = activeTests.find(test => test.testName === testName);
    
    if (!testConfig) {
      return res.status(404).json({ error: 'Test not found or inactive' });
    }

    // Assign variant based on weighted distribution
    const variantKeys = Object.keys(variants);
    const weights = Object.values(variants) as number[];
    const random = Math.random() * 100;
    
    let cumulative = 0;
    let selectedVariant = variantKeys[0]; // Default fallback
    
    for (let i = 0; i < variantKeys.length; i++) {
      cumulative += weights[i];
      if (random <= cumulative) {
        selectedVariant = variantKeys[i];
        break;
      }
    }

    // Store assignment
    const assignment = await analyticsService.assignToTest(
      sessionId,
      testConfig.id,
      selectedVariant
    );

    res.json({
      success: true,
      variant: selectedVariant,
      testId: testConfig.id,
      assignment
    });

  } catch (error) {
    console.error('A/B test initialization error:', error);
    res.status(500).json({ error: 'Failed to initialize A/B test' });
  }
});

// Get existing assignment for session
router.post('/assignment', async (req, res) => {
  try {
    const { sessionId, testName } = getAssignmentSchema.parse(req.body);
    
    const assignment = await analyticsService.getTestAssignment(sessionId, testName);
    
    res.json({
      success: true,
      assignment: assignment || null
    });
    
  } catch (error) {
    console.error('Get assignment error:', error);
    res.status(400).json({ error: 'Invalid request data' });
  }
});

// Assign user to specific test variant
router.post('/assign', async (req, res) => {
  try {
    const { sessionId, testName, variant } = assignTestSchema.parse(req.body);
    
    // Get test ID from test name
    const activeTests = await analyticsService.getActiveTests();
    const testConfig = activeTests.find(test => test.testName === testName);
    
    if (!testConfig) {
      return res.status(404).json({ error: 'Test not found' });
    }

    const assignment = await analyticsService.assignToTest(
      sessionId,
      testConfig.id,
      variant
    );

    res.json({
      success: true,
      assignment
    });

  } catch (error) {
    console.error('Assignment error:', error);
    res.status(400).json({ error: 'Invalid assignment data' });
  }
});

// Track conversion for A/B test
router.post('/conversion', async (req, res) => {
  try {
    const { sessionId, testName, variant, conversionValue } = trackConversionSchema.parse(req.body);
    
    // Track lead action for conversion
    const leadAction = await analyticsService.trackLeadAction({
      sessionId,
      actionType: 'conversion',
      actionValue: `${testName}:${variant}`,
      scoreImpact: conversionValue * 10 // Convert to lead score points
    });

    // Track page event for analytics
    const pageEvent = await analyticsService.trackEvent({
      sessionId,
      eventType: 'conversion',
      elementId: testName,
      elementText: `A/B Test Conversion: ${variant}`,
      pagePath: '/',
      metadata: JSON.stringify({
        testName,
        variant,
        conversionValue
      })
    });

    res.json({
      success: true,
      leadAction,
      pageEvent
    });

  } catch (error) {
    console.error('Conversion tracking error:', error);
    res.status(400).json({ error: 'Invalid conversion data' });
  }
});

// Get A/B test performance analytics
router.get('/analytics', async (req, res) => {
  try {
    const { testName, timeframe = 'week' } = req.query;
    
    // Get session analytics for timeframe
    const sessionAnalytics = await analyticsService.getSessionAnalytics(
      timeframe as 'day' | 'week' | 'month'
    );

    // Get conversion analytics
    const conversionAnalytics = await analyticsService.getConversionAnalytics();

    // Get top performing elements
    const topElements = await analyticsService.getTopPerformingElements();

    // TODO: Implement specific A/B test variant performance comparison
    // This would require additional database queries to compare variant performance

    res.json({
      success: true,
      analytics: {
        sessions: sessionAnalytics,
        conversions: conversionAnalytics,
        topElements,
        testName: testName || 'all'
      }
    });

  } catch (error) {
    console.error('Analytics fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Get statistical significance analysis
router.get('/significance/:testName', async (req, res) => {
  try {
    const { testName } = req.params;
    
    // This would require more complex statistical analysis
    // For now, return a placeholder response
    res.json({
      success: true,
      testName,
      significance: {
        isSignificant: false,
        confidence: 0,
        sampleSize: 0,
        message: 'Statistical analysis requires more data'
      }
    });

  } catch (error) {
    console.error('Significance analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze significance' });
  }
});

export default router;