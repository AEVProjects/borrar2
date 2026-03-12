// Enhanced LEDs Leads Management - Integrates with MSI platform
// This script adds improved UI for viewing and managing LED stage leads with AI messages

(function() {
    console.log('🔌 Loading LED Batch Management Module...');
    
    // Configuration
    const CONFIG = {
        batchName: 'Workshop Leds',
        stage: 'leds',
        apiEndpoint: '/api/leds',
        refreshInterval: 30000 // 30 seconds
    };

    let ledsData = [];
    let currentPage = 1;
    const PAGE_SIZE = 20;

    // Initialize LED Batch View
    window.initLEDBatchView = async function() {
        console.log('📲 Initializing LED Batch View...');
        
        // Create or get container
        let container = document.getElementById('led-batch-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'led-batch-container';
            container.innerHTML = await buildLEDBatchHTML();
            document.body.appendChild(container);
        }
        
        // Load data
        await loadLEDsData();
        
        // Setup event listeners
        setupLEDEventListeners();
        
        // Auto-refresh
        setInterval(loadLEDsData, CONFIG.refreshInterval);
        
        console.log('✅ LED Batch View initialized');
    };

    async function loadLEDsData() {
        try {
            if (!window.supabaseClient) {
                console.warn('⚠️ Supabase not connected');
                return;
            }
            
            // Load LED stage leads
            const { data, error } = await window.supabaseClient
                .from('apollo_leads')
                .select('*')
                .eq('stage', 'leds')
                .order('id', { ascending: true });
            
            if (error) throw error;
            
            ledsData = data || [];
            console.log(`📊 Loaded ${ledsData.length} LED stage leads`);
            
            // Get batch info
            const { data: batchData } = await window.supabaseClient
                .from('lead_batches')
                .select('*')
                .eq('batch_name', CONFIG.batchName)
                .single();
            
            // Update UI
            updateLEDStatistics(ledsData, batchData);
            renderLEDSTable(ledsData);
            
            return ledsData;
        } catch (error) {
            console.error('❌ Error loading LEDs data:', error);
            showLEDError(error.message);
        }
    }

    function buildLEDBatchHTML() {
        return `
        <div style="max-width: 1400px; margin: 0 auto; padding: 20px;">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #207CE5 0%, #004AAD 100%); color: white; padding: 28px; border-radius: 16px; margin-bottom: 24px; box-shadow: 0 8px 24px rgba(32, 124, 229, 0.3);">
                <h2 style="margin: 0 0 8px; font-size: 28px; font-weight: 700;">🔴 LED Batch Management</h2>
                <p style="margin: 0; opacity: 0.9; font-size: 14px;">Workshop Leds - 40 high-value leads ready for AI outreach</p>
            </div>

            <!-- Statistics Cards -->
            <div id="led-stats" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 28px;">
                <!-- Stats will be rendered here -->
            </div>

            <!-- Controls Bar -->
            <div style="background: white; padding: 16px; border-radius: 12px; margin-bottom: 20px; display: flex; gap: 12px; flex-wrap: wrap; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                <button onclick="loadLEDsData()" style="background: #3b82f6; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: 600; display: flex; align-items: center; gap: 8px;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 2.2"/></svg>
                    Refresh Data
                </button>
                <button onclick="exportLEDsToCSV()" style="background: #10b981; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: 600; display: flex; align-items: center; gap: 8px;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                    Export CSV
                </button>
                <button onclick="generateAIMessagesForLEDs()" style="background: #f59e0b; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: 600; display: flex; align-items: center; gap: 8px;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/></svg>
                    Generate AI Messages
                </button>
            </div>

            <!-- Leads Table -->
            <div style="background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.1);">
                <div id="led-table-container" style="overflow-x: auto;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="background: #f3f4f6; border-bottom: 2px solid #e5e7eb;">
                                <th style="padding: 12px 16px; text-align: left; font-weight: 600; color: #374151; font-size: 13px;">Name</th>
                                <th style="padding: 12px 16px; text-align: left; font-weight: 600; color: #374151; font-size: 13px;">Title</th>
                                <th style="padding: 12px 16px; text-align: left; font-weight: 600; color: #374151; font-size: 13px;">Company</th>
                                <th style="padding: 12px 16px; text-align: left; font-weight: 600; color: #374151; font-size: 13px;">Email</th>
                                <th style="padding: 12px 16px; text-align: left; font-weight: 600; color: #374151; font-size: 13px;">Seniority</th>
                                <th style="padding: 12px 16px; text-align: left; font-weight: 600; color: #374151; font-size: 13px;">AI Messages</th>
                                <th style="padding: 12px 16px; text-align: left; font-weight: 600; color: #374151; font-size: 13px;">Actions</th>
                            </tr>
                        </thead>
                        <tbody id="led-table-body">
                            <!-- Rows will be rendered here -->
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Pagination -->
            <div style="margin-top: 20px; display: flex; justify-content: center; gap: 8px; align-items: center;">
                <button onclick="ledPrevPage()" style="padding: 8px 12px; border: 1px solid #ddd; border-radius: 6px; cursor: pointer;">← Prev</button>
                <span id="led-page-info" style="font-size: 14px; color: #666; margin: 0 16px;">Page 1</span>
                <button onclick="ledNextPage()" style="padding: 8px 12px; border: 1px solid #ddd; border-radius: 6px; cursor: pointer;">Next →</button>
            </div>

            <!-- Error Alert -->
            <div id="led-error-alert" style="display: none; background: #fee; border: 1px solid #fcc; color: #c33; padding: 16px; border-radius: 8px; margin-top: 20px;"></div>
        </div>
        `;
    }

    function updateLEDStatistics(data, batchData) {
        const stats = {
            total: data.length,
            with_messages: data.filter(l => l.ai_message_status === 'generated').length,
            generating: data.filter(l => l.ai_message_status === 'generating').length,
            pending: data.filter(l => !l.ai_message_status || l.ai_message_status === 'pending').length
        };

        const container = document.getElementById('led-stats');
        if (!container) return;

        container.innerHTML = `
            <div style="background: white; padding: 20px; border-radius: 12px; border-left: 4px solid #207CE5; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                <div style="font-size: 28px; font-weight: 700; color: #207CE5;">${stats.total}</div>
                <div style="font-size: 12px; color: #666; font-weight: 600; text-transform: uppercase; margin-top: 4px;">Total Leads</div>
            </div>
            <div style="background: white; padding: 20px; border-radius: 12px; border-left: 4px solid #10b981; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                <div style="font-size: 28px; font-weight: 700; color: #10b981;">${stats.with_messages}</div>
                <div style="font-size: 12px; color: #666; font-weight: 600; text-transform: uppercase; margin-top: 4px;">AI Messages Ready</div>
            </div>
            <div style="background: white; padding: 20px; border-radius: 12px; border-left: 4px solid #f59e0b; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                <div style="font-size: 28px; font-weight: 700; color: #f59e0b;">${stats.generating}</div>
                <div style="font-size: 12px; color: #666; font-weight: 600; text-transform: uppercase; margin-top: 4px;">Generating...</div>
            </div>
            <div style="background: white; padding: 20px; border-radius: 12px; border-left: 4px solid #6b7280; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                <div style="font-size: 28px; font-weight: 700; color: #6b7280;">${stats.pending}</div>
                <div style="font-size: 12px; color: #666; font-weight: 600; text-transform: uppercase; margin-top: 4px;">Pending Messages</div>
            </div>
        `;
    }

    function renderLEDSTable(data) {
        const tbody = document.getElementById('led-table-body');
        if (!tbody) return;

        const start = (currentPage - 1) * PAGE_SIZE;
        const pageData = data.slice(start, start + PAGE_SIZE);

        tbody.innerHTML = pageData.map((lead, idx) => `
            <tr style="border-bottom: 1px solid #e5e7eb; hover: background: #f9fafb;">
                <td style="padding: 12px 16px; font-size: 13px; font-weight: 600; color: #1f2937;">
                    ${lead.first_name || ''} ${lead.last_name || ''}
                </td>
                <td style="padding: 12px 16px; font-size: 13px; color: #666;">${lead.title || '—'}</td>
                <td style="padding: 12px 16px; font-size: 13px; font-weight: 600; color: #207CE5;">${lead.company_name || '—'}</td>
                <td style="padding: 12px 16px; font-size: 13px; color: #666;">
                    <a href="mailto:${lead.email}" style="color: #3b82f6; text-decoration: none;">${lead.email || '—'}</a>
                </td>
                <td style="padding: 12px 16px; font-size: 13px; color: #666;">${lead.seniority || '—'}</td>
                <td style="padding: 12px 16px;">
                    ${renderAIMessageBadge(lead)}
                </td>
                <td style="padding: 12px 16px; display: flex; gap: 8px;">
                    ${lead.ai_message_status === 'generated' && lead.personalized_message ? 
                        `<button onclick="window.showAIMessages(${lead.id}, ${JSON.stringify(lead)})" style="background: #10b981; color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 600;">View Messages</button>` 
                        : ''}
                    <a href="mailto:${lead.email}" style="background: #3b82f6; color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 600; text-decoration: none; display: inline-block;">Email</a>
                </td>
            </tr>
        `).join('');

        // Update pagination
        const totalPages = Math.ceil(data.length / PAGE_SIZE);
        document.getElementById('led-page-info').textContent = `Page ${currentPage} of ${totalPages} (${data.length} leads)`;
    }

    function renderAIMessageBadge(lead) {
        const status = lead.ai_message_status || 'pending';
        if (status === 'generated' && lead.personalized_message) {
            const count = [lead.personalized_message, lead.personalized_followup, lead.personalized_email3].filter(Boolean).length;
            return `<span style="background: #d1fae5; color: #047857; padding: 6px 10px; border-radius: 6px; font-size: 12px; font-weight: 600;">✓ ${count}/3 Emails</span>`;
        }
        if (status === 'generating') {
            return `<span style="background: #fef3c7; color: #92400e; padding: 6px 10px; border-radius: 6px; font-size: 12px; font-weight: 600;">⏳ Generating...</span>`;
        }
        return `<span style="background: #f3f4f6; color: #6b7280; padding: 6px 10px; border-radius: 6px; font-size: 12px; font-weight: 600;">— Pending</span>`;
    }

    function setupLEDEventListeners() {
        // Already setup above
    }

    function showLEDError(message) {
        const alert = document.getElementById('led-error-alert');
        if (alert) {
            alert.textContent = '❌ ' + message;
            alert.style.display = 'block';
        }
    }

    // Pagination functions
    window.ledNextPage = function() {
        const totalPages = Math.ceil(ledsData.length / PAGE_SIZE);
        if (currentPage < totalPages) {
            currentPage++;
            renderLEDSTable(ledsData);
        }
    };

    window.ledPrevPage = function() {
        if (currentPage > 1) {
            currentPage--;
            renderLEDSTable(ledsData);
        }
    };

    // Export functions
    window.exportLEDsToCSV = function() {
        if (ledsData.length === 0) {
            showToast('No data to export', 'warning');
            return;
        }

        const headers = ['First Name', 'Last Name', 'Title', 'Company', 'Email', 'Seniority', 'City', 'AI Messages'];
        const rows = ledsData.map(l => [
            l.first_name || '',
            l.last_name || '',
            l.title || '',
            l.company_name || '',
            l.email || '',
            l.seniority || '',
            l.city || '',
            l.ai_message_status === 'generated' ? 'Yes' : 'No'
        ]);

        const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `LED-Batch-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);

        showToast(`✓ Exported ${ledsData.length} leads`, 'success');
    };

    window.generateAIMessagesForLEDs = function() {
        showToast('📧 AI message generation started. Messages will appear as they complete.', 'info');
        // Call the existing generateAIMessages function from app.js
        if (window.generateAIMessages) {
            window.generateAIMessages();
        }
    };

    // Export functions
    window.loadLEDsData = loadLEDsData;
    window.initLEDBatchView = window.initLEDBatchView;

    console.log('✅ LED Batch Management Module loaded');
})();
