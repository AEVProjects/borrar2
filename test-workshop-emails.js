#!/usr/bin/env node
const https = require('https');

// Minimal test - call Gemini with a test lead to see if emails are Workshop-focused
const testLead = {
  id: 'test-1',
  first_name: 'Arturo',
  last_name: 'Kinetik',
  title: 'VP Technology',
  seniority: 'vp',
  company_name: 'Swinerton',
  industry: 'Real Estate',
  num_employees: '450',
  city: 'San Francisco',
  state: 'CA',
  country: 'USA',
  website: 'swinerton.com',
  technologies: 'Salesforce, AWS, custom web portals',
  description: 'Major commercial real estate developer'
};

// This should trigger the Workshop-focused email generation
console.log('📧 Test: Generating emails for', testLead.first_name, 'at', testLead.company_name);
console.log('Industry:', testLead.industry);
console.log('Expected: All 3 emails should ONLY mention AI Discovery Workshop');
console.log('NOT expected: Cloud migration, IT outsourcing, custom software, talent augmentation');
console.log('\n✓ Test parameters ready. Run this via n8n webhook to test actual generation.');
