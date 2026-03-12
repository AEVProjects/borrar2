// Upload Workshop.csv to Supabase as LED stage with new batch
// Run: node upload-workshop-leds.js

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
  '# Employees': 'num_employees'
};

async function uploadWorkshopLeds() {
  try {
    const csvPath = path.join(__dirname, '..', 'Workshop.csv');
    
    console.log('Reading Workshop.csv...');
    let csvContent = fs.readFileSync(csvPath, 'utf-8');
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
    
    console.log(`Parsed ${records.length} records from Workshop.csv`);
    
    // Transform records: map CSV headers to DB columns
    const dbRecords = records.map((row) => {
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
      // Override stage to 'leds'
      dbRow['stage'] = 'leds';
      dbRow['batch_name'] = 'Workshop Leds';
      return dbRow;
    });
    
    console.log(`Transformed ${dbRecords.length} records`);
    console.log('Sample record (first):', JSON.stringify(dbRecords[0], null, 2).substring(0, 500));
    
    // Create batch first
    console.log('\n📦 Creating new batch: "Workshop Leds"...');
    const { data: batchData, error: batchError } = await supabase
      .from('lead_batches')
      .insert({
        batch_name: 'Workshop Leds',
        description: 'Workshop contacts with LED stage - imported from Workshop.csv',
        lead_count: dbRecords.length,
        status: 'uploaded'
      })
      .select('id');
    
    if (batchError) {
      console.error('❌ Error creating batch:', batchError);
      return;
    }
    
    const batchId = batchData[0].id;
    console.log(`✅ Batch created with ID: ${batchId}`);
    
    // Add batch_id to all records
    dbRecords.forEach(record => {
      record['batch_id'] = batchId;
    });
    
    // Upload in batches of 50
    console.log('\n📤 Uploading contacts to apollo_leads...');
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
        console.error(`❌ Error in batch ${i / BATCH_SIZE + 1}:`, error.message);
        errors += batch.length;
      } else {
        uploaded += batch.length;
        console.log(`✅ Uploaded ${uploaded}/${dbRecords.length} records`);
      }
    }
    
    console.log(`
═══════════════════════════════════════
✨ Upload Complete!
═══════════════════════════════════════
Batch ID: ${batchId}
Batch Name: Workshop Leds
Stage: leds
Total Records: ${dbRecords.length}
Successfully Uploaded: ${uploaded}
Errors: ${errors}

🔗 Access in workflows via:
  - Batch ID: ${batchId}
  - Batch Name: "Workshop Leds"
  - Filter by stage: "leds"
═══════════════════════════════════════
    `);
    
  } catch (error) {
    console.error('Fatal error:', error.message);
    process.exit(1);
  }
}

uploadWorkshopLeds();
