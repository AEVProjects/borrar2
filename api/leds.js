// API Endpoint for LED stage leads
// GET /api/leds - Get all LED batch leads
// GET /api/leds/messages - Get leads with AI messages
// POST /api/leds/messages - Generate AI messages for selected leads

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://vahqhxfdropstvklvzej.supabase.co';
const SUPABASE_KEY = 'sb_publishable_xt7qY64rVMowaSris2Zs0Q_2DEbzjpy';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

module.exports = {
  // Get all LED leads (stage='leds')
  async getLedsLeads(req, res) {
    try {
      const { data, error } = await supabase
        .from('apollo_leads')
        .select('*')
        .eq('stage', 'leds')
        .order('id', { ascending: true });

      if (error) throw error;

      res.status(200).json({
        success: true,
        count: data.length,
        data
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  // Get LED leads with AI messages
  async getLedsWithMessages(req, res) {
    try {
      const { data, error } = await supabase
        .from('apollo_leads')
        .select('*')
        .eq('stage', 'leds')
        .eq('ai_message_status', 'generated')
        .not('personalized_message', 'is', null)
        .order('ai_message_generated_at', { ascending: false });

      if (error) throw error;

      const summary = {
        total: 0,
        with_messages: 0,
        ai_generated: 0
      };

      const enriched = data.map(lead => ({
        ...lead,
        message_count: [lead.personalized_message, lead.personalized_followup, lead.personalized_email3]
          .filter(Boolean).length,
        messages: {
          email1: {
            subject: lead.personalized_subject1 || '',
            body: lead.personalized_message || ''
          },
          email2: {
            subject: lead.personalized_subject2 || '',
            body: lead.personalized_followup || ''
          },
          email3: {
            subject: lead.personalized_subject3 || '',
            body: lead.personalized_email3 || ''
          }
        }
      }));

      res.status(200).json({
        success: true,
        count: enriched.length,
        summary,
        data: enriched
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  // Get single led lead with full details
  async getLedDetail(req, res) {
    try {
      const { id } = req.params;
      
      const { data, error } = await supabase
        .from('apollo_leads')
        .select('*')
        .eq('id', parseInt(id))
        .eq('stage', 'leds')
        .single();

      if (error) throw error;
      if (!data) return res.status(404).json({ success: false, error: 'Led not found' });

      // Enrich with message details
      const enriched = {
        ...data,
        message_count: [data.personalized_message, data.personalized_followup, data.personalized_email3]
          .filter(Boolean).length,
        messages: {
          email1: {
            subject: data.personalized_subject1 || '',
            body: data.personalized_message || ''
          },
          email2: {
            subject: data.personalized_subject2 || '',
            body: data.personalized_followup || ''
          },
          email3: {
            subject: data.personalized_subject3 || '',
            body: data.personalized_email3 || ''
          }
        }
      };

      res.status(200).json({
        success: true,
        data: enriched
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  // Get batch info for LED batch
  async getLedsBatch(req, res) {
    try {
      const { data, error } = await supabase
        .from('lead_batches')
        .select('*')
        .eq('batch_name', 'Workshop Leds')
        .single();

      if (error) throw error;

      // Get lead count for this batch
      const { count } = await supabase
        .from('apollo_leads')
        .select('*', { count: 'exact', head: true })
        .eq('stage', 'leds')
        .eq('batch_name', 'Workshop Leds');

      res.status(200).json({
        success: true,
        data: {
          ...data,
          current_lead_count: count
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  // Get statistics for LED batch
  async getLedsStats(req, res) {
    try {
      // Total leads
      const { count: totalLeads } = await supabase
        .from('apollo_leads')
        .select('*', { count: 'exact', head: true })
        .eq('stage', 'leds');

      // With AI messages
      const { count: withMessages } = await supabase
        .from('apollo_leads')
        .select('*', { count: 'exact', head: true })
        .eq('stage', 'leds')
        .eq('ai_message_status', 'generated');

      // Generating
      const { count: generating } = await supabase
        .from('apollo_leads')
        .select('*', { count: 'exact', head: true })
        .eq('stage', 'leds')
        .eq('ai_message_status', 'generating');

      // Get seniority distribution
      const { data: seniorities } = await supabase
        .from('apollo_leads')
        .select('seniority')
        .eq('stage', 'leds');

      const seniorityDist = {};
      seniorities?.forEach(lead => {
        const sen = lead.seniority || 'Unknown';
        seniorityDist[sen] = (seniorityDist[sen] || 0) + 1;
      });

      res.status(200).json({
        success: true,
        stats: {
          total_leads: totalLeads,
          with_ai_messages: withMessages,
          generating_messages: generating,
          pending_messages: totalLeads - withMessages - generating,
          seniority_distribution: seniorityDist
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
};
