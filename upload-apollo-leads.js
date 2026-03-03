// Upload Apollo CSV to Supabase
// 1. First run migration-apollo-leads.sql in Supabase SQL Editor
// 2. Then run: node upload-apollo-leads.js

const { createClient } = require('@supabase/supabase-js');
const { parse } = require('csv-parse/sync');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://vahqhxfdropstvklvzej.supabase.co';
const SUPABASE_KEY = 'sb_publishable_xt7qY64rVMowaSris2Zs0Q_2DEbzjpy';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Map CSV headers to DB column names
const COLUMN_MAP = {
  'First Name': 'first_name',
  'Last Name': 'last_name',
  'Title': 'title',
  'Company Name': 'company_name',
  'Company Name for Emails': 'company_name_for_emails',
  'Email': 'email',
  'Email Status': 'email_status',
  'Primary Email Source': 'primary_email_source',
  'Primary Email Verification Source': 'primary_email_verification_source',
  'Email Confidence': 'email_confidence',
  'Primary Email Catch-all Status': 'primary_email_catch_all_status',
  'Primary Email Last Verified At': 'primary_email_last_verified_at',
  'Seniority': 'seniority',
  'Departments': 'departments',
  'Contact Owner': 'contact_owner',
  'Work Direct Phone': 'work_direct_phone',
  'Home Phone': 'home_phone',
  'Mobile Phone': 'mobile_phone',
  'Corporate Phone': 'corporate_phone',
  'Other Phone': 'other_phone',
  'Stage': 'stage',
  'Lists': 'lists',
  'Last Contacted': 'last_contacted',
  'Account Owner': 'account_owner',
  '# Employees': 'num_employees',
  'Industry': 'industry',
  'Keywords': 'keywords',
  'Person Linkedin Url': 'person_linkedin_url',
  'Website': 'website',
  'Company Linkedin Url': 'company_linkedin_url',
  'Facebook Url': 'facebook_url',
  'Twitter Url': 'twitter_url',
  'City': 'city',
  'State': 'state',
  'Country': 'country',
  'Company Address': 'company_address',
  'Company City': 'company_city',
  'Company State': 'company_state',
  'Company Country': 'company_country',
  'Company Phone': 'company_phone',
  'Technologies': 'technologies',
  'Annual Revenue': 'annual_revenue',
  'Total Funding': 'total_funding',
  'Latest Funding': 'latest_funding',
  'Latest Funding Amount': 'latest_funding_amount',
  'Last Raised At': 'last_raised_at',
  'Subsidiary of': 'subsidiary_of',
  'Email Sent': 'email_sent',
  'Email Open': 'email_open',
  'Email Bounced': 'email_bounced',
  'Replied': 'replied',
  'Demoed': 'demoed',
  'Number of Retail Locations': 'number_of_retail_locations',
  'Apollo Contact Id': 'apollo_contact_id',
  'Apollo Account Id': 'apollo_account_id',
  'Secondary Email': 'secondary_email',
  'Secondary Email Source': 'secondary_email_source',
  'Secondary Email Status': 'secondary_email_status',
  'Secondary Email Verification Source': 'secondary_email_verification_source',
  'Tertiary Email': 'tertiary_email',
  'Tertiary Email Source': 'tertiary_email_source',
  'Tertiary Email Status': 'tertiary_email_status',
  'Tertiary Email Verification Source': 'tertiary_email_verification_source',
  'Primary Intent Topic': 'primary_intent_topic',
  'Primary Intent Score': 'primary_intent_score',
  'Secondary Intent Topic': 'secondary_intent_topic',
  'Secondary Intent Score': 'secondary_intent_score',
  'Qualify Contact': 'qualify_contact'
};

async function uploadApolloLeads() {
  const csvPath = path.join(__dirname, 'Apollo List_29012026 (1).csv');
  
  console.log('Reading CSV file...');
  let csvContent = fs.readFileSync(csvPath, 'utf-8');
  // Strip BOM if present
  if (csvContent.charCodeAt(0) === 0xFEFF) {
    csvContent = csvContent.substring(1);
    console.log('Stripped BOM character');
  }
  
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    relax_quotes: true,
    relax_column_count: true,
    trim: true
  });
  
  console.log(`Parsed ${records.length} records from CSV`);
  
  // Transform records: map CSV headers to DB columns, clean values
  const dbRecords = records.map((row, idx) => {
    const dbRow = {};
    for (const [csvHeader, dbColumn] of Object.entries(COLUMN_MAP)) {
      let value = row[csvHeader] || null;
      // Clean phone numbers (remove leading ')
      if (value && typeof value === 'string') {
        value = value.replace(/^'+/, '').trim();
        if (value === '' || value === 'FALSO') value = null;
        // Convert FALSO/VERDADERO to proper values
        if (value === 'VERDADERO') value = 'true';
      }
      dbRow[dbColumn] = value;
    }
    return dbRow;
  });
  
  console.log(`Transformed ${dbRecords.length} records`);
  console.log('Sample record:', JSON.stringify(dbRecords[0], null, 2).substring(0, 500));
  
  // Delete existing records first (re-upload safe)
  console.log('Clearing existing records...');
  const { error: deleteError } = await supabase
    .from('apollo_leads')
    .delete()
    .neq('id', 0); // delete all
  if (deleteError) {
    console.error('Warning: Could not clear table:', deleteError.message);
  }
  
  // Upload in batches of 50
  const BATCH_SIZE = 50;
  let uploaded = 0;
  let errors = 0;
  
  for (let i = 0; i < dbRecords.length; i += BATCH_SIZE) {
    const batch = dbRecords.slice(i, i + BATCH_SIZE);
    
    const { data, error } = await supabase
      .from('apollo_leads')
      .insert(batch)
      .select('id');
    
    if (error) {
      console.error(`Error in batch ${Math.floor(i/BATCH_SIZE) + 1}:`, error.message);
      errors += batch.length;
      
      // Try one by one for failed batch
      for (const record of batch) {
        const { error: singleError } = await supabase
          .from('apollo_leads')
          .insert(record);
        
        if (singleError) {
          console.error(`  Failed record: ${record.first_name} ${record.last_name} - ${singleError.message}`);
        } else {
          uploaded++;
          errors--;
        }
      }
    } else {
      uploaded += batch.length;
    }
    
    process.stdout.write(`\rUploaded: ${uploaded}/${dbRecords.length} (errors: ${errors})`);
  }
  
  console.log(`\n\nDone! Uploaded ${uploaded} leads, ${errors} errors`);
}

uploadApolloLeads().catch(console.error);
