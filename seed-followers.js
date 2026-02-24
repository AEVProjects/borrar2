/**
 * Seed script: Import followers from seguidores_formateados.json into Supabase
 * 
 * Usage:
 *   node seed-followers.js
 * 
 * Prerequisites:
 *   npm install @supabase/supabase-js
 *   
 * Make sure config.js values are set or update the SUPABASE_URL/SUPABASE_KEY below.
 */

const { createClient } = require('@supabase/supabase-js');
const followers = require('./seguidores_formateados.json');

// --- Configuration ---
// Read from environment or hardcode your Supabase credentials
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://vahqhxfdropstvklvzej.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_KEY || 'sb_publishable_xt7qY64rVMowaSris2Zs0Q_2DEbzjpy';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const BATCH_SIZE = 100; // Insert in batches to avoid timeouts

async function seedFollowers() {
    console.log(`📋 Total followers to insert: ${followers.length}`);
    
    let inserted = 0;
    let errors = 0;

    for (let i = 0; i < followers.length; i += BATCH_SIZE) {
        const batch = followers.slice(i, i + BATCH_SIZE).map(f => ({
            nombre: f.nombre,
            grado_conexion: f.grado_conexion,
            titular: f.titular || '',
            fecha_seguimiento: f.fecha_seguimiento
        }));

        const { data, error } = await supabase
            .from('followers')
            .insert(batch)
            .select('id');

        if (error) {
            console.error(`❌ Error inserting batch ${Math.floor(i / BATCH_SIZE) + 1}:`, error.message);
            errors += batch.length;
        } else {
            inserted += data.length;
            console.log(`✅ Batch ${Math.floor(i / BATCH_SIZE) + 1}: inserted ${data.length} rows (total: ${inserted}/${followers.length})`);
        }
    }

    console.log(`\n🏁 Done! Inserted: ${inserted}, Errors: ${errors}`);
}

seedFollowers().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
