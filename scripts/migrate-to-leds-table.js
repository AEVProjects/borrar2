// Migrate LED leads from apollo_leads (stage='leds') → apollo_leads_leds
// Steps:
//   1. Run migrations/migration-leads-leds.sql in Supabase SQL Editor
//   2. Run: node scripts/migrate-to-leds-table.js

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://vahqhxfdropstvklvzej.supabase.co';
const SUPABASE_KEY = 'sb_publishable_xt7qY64rVMowaSris2Zs0Q_2DEbzjpy';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function migrateToLedsTable() {
  console.log('🔄 Starting migration: apollo_leads (stage=leds) → apollo_leads_leds\n');

  // 1. Fetch all leds from apollo_leads
  console.log('📥 Fetching LED leads from apollo_leads...');
  const { data: leads, error: fetchError } = await supabase
    .from('apollo_leads')
    .select('*')
    .eq('stage', 'leds');

  if (fetchError) {
    console.error('❌ Error fetching leads:', fetchError.message);
    process.exit(1);
  }

  if (!leads || leads.length === 0) {
    console.log('⚠️  No leads with stage=leds found in apollo_leads. Nothing to migrate.');
    process.exit(0);
  }

  console.log(`✅ Found ${leads.length} LED leads to migrate\n`);

  // 2. Insert into apollo_leads_leds (strip the identity id, let DB auto-assign)
  console.log('📤 Inserting into apollo_leads_leds...');
  const cleanLeads = leads.map(({ id, ...rest }) => rest); // remove old id

  const BATCH_SIZE = 50;
  let inserted = 0;
  let errors = 0;

  for (let i = 0; i < cleanLeads.length; i += BATCH_SIZE) {
    const batch = cleanLeads.slice(i, i + BATCH_SIZE);
    const { error: insertError } = await supabase
      .from('apollo_leads_leds')
      .insert(batch);

    if (insertError) {
      console.error(`❌ Insert error (batch ${Math.floor(i / BATCH_SIZE) + 1}):`, insertError.message);
      errors += batch.length;
    } else {
      inserted += batch.length;
      console.log(`  ✅ Inserted ${inserted}/${cleanLeads.length}`);
    }
  }

  if (errors > 0) {
    console.error(`\n❌ ${errors} records failed to insert. NOT deleting from apollo_leads.`);
    process.exit(1);
  }

  // 3. Delete from apollo_leads
  console.log('\n🗑️  Removing LED leads from apollo_leads...');
  const { error: deleteError } = await supabase
    .from('apollo_leads')
    .delete()
    .eq('stage', 'leds');

  if (deleteError) {
    console.error('❌ Error deleting from apollo_leads:', deleteError.message);
    process.exit(1);
  }

  console.log(`\n${'═'.repeat(50)}
✨ Migration Complete!
${'═'.repeat(50)}
Migrated: ${inserted} leads
From:     apollo_leads (stage='leds')
To:       apollo_leads_leds
Deleted:  ${inserted} records from apollo_leads
${'═'.repeat(50)}`);
}

migrateToLedsTable();
