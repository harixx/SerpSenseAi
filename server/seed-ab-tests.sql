-- Seed A/B tests for Imperius landing page optimization
INSERT INTO ab_tests (test_name, variant, description, is_active) VALUES
-- Hero CTA Test
('hero_cta', 'A', 'Control: Standard exclusive access CTA', true),
('hero_cta', 'B', 'Elite waitlist with urgency and gradient styling', true),
('hero_cta', 'C', 'Strategic advantage with pulse animation', true),

-- Hero Headline Test  
('hero_headline', 'A', 'Control: Beyond Keywords/Rankings message', true),
('hero_headline', 'B', 'Stop Guessing, Start Dominating approach', true),
('hero_headline', 'C', 'Intelligence Advantage positioning', true),

-- Social Proof Test
('social_proof', 'A', 'Control: Simple count display', true),
('social_proof', 'B', 'Animated count with testimonials', true),
('social_proof', 'C', 'Full social proof with trust badges', true),

-- Pricing Psychology Test
('pricing_psychology', 'A', 'Control: Standard pricing', true),
('pricing_psychology', 'B', 'Show original price with value emphasis', true),
('pricing_psychology', 'C', 'Full urgency with spots remaining', true);