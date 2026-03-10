// Upload Apollo CSV to Supabase with Batch Tracking
// Usage: node scripts/upload-apollo-leads-batch.js "My Batch Name" [path-to-csv]
//
// Examples:
//   node scripts/upload-apollo-leads-batch.js "Week 10 - Tech Companies"
//   node scripts/upload-apollo-leads-batch.js "Healthcare Q1" "./data/healthcare-leads.csv"
//
// What it does:
//   1. Creates a batch record in lead_batches table
//   2. Uploads all CSV rows to apollo_leads with batch_id + batch_name
//   3. Updates batch lead_count
//   4. Does NOT delete existing leads — each batch is additive

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

async function uploadBatch() {
  // Parse arguments
  const batchName = process.argv[2];
  const csvPathArg = process.argv[3];

  if (!batchName) {
    console.error('Usage: node upload-apollo-leads-batch.js "Batch Name" [path-to-csv]');
    console.error('Example: node upload-apollo-leads-batch.js "Week 10 - Tech" "./data/my-leads.csv"');
    process.exit(1);
  }

  // Default CSV path: most recent CSV in data/ folder
  let csvPath;
  if (csvPathArg) {
    csvPath = path.resolve(csvPathArg);
  } else {
    const dataDir = path.join(__dirname, '..', 'data');
    const csvFiles = fs.readdirSync(dataDir).filter(f => f.endsWith('.csv')).sort();
    if (csvFiles.length === 0) {
      console.error('No CSV files found in data/ folder. Provide a path as second argument.');
      process.exit(1);
    }
    csvPath = path.join(dataDir, csvFiles[csvFiles.length - 1]);
    console.log(`Using most recent CSV: ${csvFiles[csvFiles.length - 1]}`);
  }

  if (!fs.existsSync(csvPath)) {
    console.error(`File not found: ${csvPath}`);
    process.exit(1);
  }

  // 1. Create batch record
  console.log(`\nCreating batch: "${batchName}"...`);
  const { data: batchData, error: batchError } = await supabase
    .from('lead_batches')
    .insert({ batch_name: batchName, status: 'uploaded' })
    .select('id')
    .single();

  if (batchError) {
    console.error('Error creating batch:', batchError.message);
    console.error('Did you run migration-lead-batches.sql?');
    process.exit(1);
  }

  const batchId = batchData.id;
  console.log(`Batch created with ID: ${batchId}`);

  // 2. Read and parse CSV
  console.log('Reading CSV file...');
  let csvContent = fs.readFileSync(csvPath, 'utf-8');
  if (csvContent.charCodeAt(0) === 0xFEFF) {
    csvContent = csvContent.substring(1);
  }

  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    relax_quotes: true,
    relax_column_count: true,
    trim: true
  });

  console.log(`Parsed ${records.length} records from CSV`);

  // 3. Transform records + attach batch
  const dbRecords = records.map(row => {
    const dbRow = {};
    for (const [csvHeader, dbColumn] of Object.entries(COLUMN_MAP)) {
      let value = row[csvHeader] || null;
      if (value && typeof value === 'string') {
        value = value.replace(/^'+/, '').trim();
        if (value === '' || value === 'FALSO') value = null;
        if (value === 'VERDADERO') value = 'true';
      }
      dbRow[dbColumn] = value;
    }
    // Attach batch info
    dbRow.batch_id = batchId;
    dbRow.batch_name = batchName;
    dbRow.ai_message_status = 'pending';
    return dbRow;
  });

  console.log(`Transformed ${dbRecords.length} records for batch "${batchName}" (ID: ${batchId})`);

  // 4. Upload in batches of 50
  const BATCH_SIZE = 50;
  let uploaded = 0;
  let errors = 0;

  for (let i = 0; i < dbRecords.length; i += BATCH_SIZE) {
    const batch = dbRecords.slice(i, i + BATCH_SIZE);

    const { error } = await supabase
      .from('apollo_leads')
      .insert(batch);

    if (error) {
      console.error(`\nError in batch ${Math.floor(i / BATCH_SIZE) + 1}:`, error.message);
      // Try one by one for failed batch
      for (const record of batch) {
        const { error: singleError } = await supabase
          .from('apollo_leads')
          .insert(record);
        if (singleError) {
          console.error(`  Failed: ${record.first_name} ${record.last_name} - ${singleError.message}`);
          errors++;
        } else {
          uploaded++;
        }
      }
    } else {
      uploaded += batch.length;
    }

    process.stdout.write(`\rUploaded: ${uploaded}/${dbRecords.length} (errors: ${errors})`);
  }

  // 5. Update batch with final count
  await supabase
    .from('lead_batches')
    .update({
      lead_count: uploaded,
      status: 'uploaded',
      updated_at: new Date().toISOString()
    })
    .eq('id', batchId);

  console.log(`\n\nDone! Batch "${batchName}" (ID: ${batchId})`);
  console.log(`  Uploaded: ${uploaded} leads`);
  console.log(`  Errors: ${errors}`);
  console.log(`\nNext steps:`);
  console.log(`  1. Open the web app → Leads → select batch "${batchName}"`);
  console.log(`  2. Click "Generate AI Messages" to create personalized messages`);
  console.log(`  3. Review messages, then "Download CSV" → import to Apollo`);
}

uploadBatch().catch(console.error);
