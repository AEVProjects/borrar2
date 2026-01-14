// ========== SIMPLE PASSWORD AUTH ==========
// Must run before any other code
(function() {
    console.log('Auth: Starting...');
    console.log('Auth: APP_CONFIG exists?', !!window.APP_CONFIG);
    
    const APP_PASSWORD = window.APP_CONFIG?.appPassword || 'Msi@2026#SecureApp!x7K';
    const AUTH_KEY = 'msi_authenticated';
    
    console.log('Auth: Password configured?', !!APP_PASSWORD);
    console.log('Auth: Already authenticated?', sessionStorage.getItem(AUTH_KEY) === 'true');
    
    // Skip if already authenticated this session
    if (sessionStorage.getItem(AUTH_KEY) === 'true') {
        console.log('Auth: Skipping - already authenticated');
        return;
    }
    
    // Function to show auth prompt
    function showAuthPrompt() {
        console.log('Auth: Showing prompt...');
        
        // First make body visible but hide content
        document.body.style.visibility = 'visible';
        
        const overlay = document.createElement('div');
        overlay.id = 'auth-overlay';
        overlay.innerHTML = `
            <div style="position:fixed;inset:0;background:linear-gradient(135deg,#f0f4f8 0%,#e2e8f0 100%);display:flex;justify-content:center;align-items:center;z-index:99999;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
                <div style="background:white;padding:48px;border-radius:20px;box-shadow:0 20px 60px rgba(0,0,0,0.15);text-align:center;max-width:400px;width:90%;">
                    <div style="width:72px;height:72px;background:linear-gradient(135deg,#207CE5,#004AAD);border-radius:16px;display:flex;align-items:center;justify-content:center;margin:0 auto 24px;">
                        <svg width="36" height="36" fill="none" stroke="white" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                    </div>
                    <h2 style="margin:0 0 8px;color:#1a202c;font-size:24px;font-weight:700;">MSI Social Manager</h2>
                    <p style="color:#718096;margin:0 0 28px;font-size:14px;">Enter your access password to continue</p>
                    <input type="password" id="auth-pwd" placeholder="Password" 
                        style="width:100%;padding:14px 18px;border:2px solid #e2e8f0;border-radius:12px;font-size:16px;margin-bottom:16px;box-sizing:border-box;outline:none;transition:all 0.2s;">
                    <button id="auth-btn" style="width:100%;padding:14px;background:linear-gradient(135deg,#207CE5,#004AAD);color:white;border:none;border-radius:12px;font-size:16px;font-weight:600;cursor:pointer;">
                        Continue →
                    </button>
                    <p id="auth-err" style="color:#e53e3e;margin:16px 0 0;font-size:13px;display:none;">❌ Incorrect password. Try again.</p>
                </div>
            </div>`;
        document.body.insertBefore(overlay, document.body.firstChild);
        
        console.log('Auth: Overlay added to DOM');
        
        const pwdInput = document.getElementById('auth-pwd');
        const authBtn = document.getElementById('auth-btn');
        
        const verify = () => {
            console.log('Auth: Verifying password...');
            if (pwdInput.value === APP_PASSWORD) {
                console.log('Auth: Password correct!');
                sessionStorage.setItem(AUTH_KEY, 'true');
                overlay.remove();
            } else {
                console.log('Auth: Password incorrect');
                document.getElementById('auth-err').style.display = 'block';
                pwdInput.value = '';
                pwdInput.style.borderColor = '#e53e3e';
                pwdInput.focus();
                setTimeout(() => { pwdInput.style.borderColor = '#e2e8f0'; }, 2000);
            }
        };
        
        authBtn.addEventListener('click', verify);
        pwdInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') verify(); });
        setTimeout(() => pwdInput.focus(), 100);
    }
    
    // Run immediately if DOM is ready, otherwise wait
    if (document.readyState === 'loading') {
        console.log('Auth: Waiting for DOM...');
        document.addEventListener('DOMContentLoaded', showAuthPrompt);
    } else {
        console.log('Auth: DOM already ready');
        showAuthPrompt();
    }
})();
// ========== END AUTH ==========

// Configuration
// Option 1: Use external config.js (recommended)
// Copy config.example.js to config.js and update values
const CONFIG = window.APP_CONFIG || {
    // Option 2: Or edit values directly here
    supabase: {
        url: 'YOUR_SUPABASE_URL', // e.g., https://xxxxx.supabase.co
        anonKey: 'YOUR_SUPABASE_ANON_KEY'
    },
    n8n: {
        publishWebhook: 'YOUR_N8N_PUBLISH_WEBHOOK_URL', // From first flow
        generateWebhook: 'YOUR_N8N_GENERATE_WEBHOOK_URL', // From second flow (msi-content-form)
        editWebhook: 'YOUR_N8N_EDIT_WEBHOOK_URL' // From image edit flow
    }
};

// Legacy support - convert old CONFIG format if needed
const supabaseUrl = CONFIG.supabaseUrl || CONFIG.supabase?.url;
const supabaseKey = CONFIG.supabaseKey || CONFIG.supabase?.anonKey;
const n8nPublishWebhook = CONFIG.n8nPublishWebhook || CONFIG.n8n?.publishWebhook;
const n8nGenerateWebhook = CONFIG.n8nGenerateWebhook || CONFIG.n8n?.generateWebhook;
const n8nEditWebhook = CONFIG.n8nEditWebhook || CONFIG.n8n?.editWebhook;
const n8nVideoWebhook = CONFIG.n8nVideoWebhook || CONFIG.n8n?.videoWebhook;
const n8nCarouselWebhook = CONFIG.n8nCarouselWebhook || CONFIG.n8n?.carouselWebhook;

// Supabase Client
let supabaseClient;
if (typeof window !== 'undefined' && supabaseUrl && supabaseKey && 
    supabaseUrl !== 'YOUR_SUPABASE_URL' && supabaseKey !== 'TU_ANON_KEY_AQUI') {
    // Load Supabase from CDN
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
    script.onload = () => {
        if (window.supabase && window.supabase.createClient) {
            try {
                supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);
                console.log('✅ Supabase conectado correctamente');
                loadPosts(); // Load posts after Supabase is initialized
            } catch (error) {
                console.error('❌ Error initializing Supabase:', error);
                showToast('Error: Verify your Supabase key in config.example.js', 'error');
            }
        } else {
            console.error('❌ Error: Supabase CDN did not load correctly');
        }
    };
    script.onerror = () => {
        console.error('❌ Error loading Supabase from CDN');
    };
    document.head.appendChild(script);
} else {
    console.warn('⚠️ Supabase not configured. Update config.example.js with your Supabase key.');
    setTimeout(() => {
        showToast('⚠️ Configure your Supabase key in config.example.js to view saved posts', 'warning');
    }, 1000);
}

// State
let selectedPosts = new Set();

// DOM Elements
const publishMode = document.getElementById('publish-mode');
const generateMode = document.getElementById('generate-mode');
const editMode = document.getElementById('edit-mode');
const videoMode = document.getElementById('video-mode');
const carouselMode = document.getElementById('carousel-mode');
const dailyMode = document.getElementById('daily-mode');
const publishForm = document.getElementById('publish-form');
const generateForm = document.getElementById('generate-form');
const editImageForm = document.getElementById('edit-image-form');
const videoForm = document.getElementById('video-form');
const carouselForm = document.getElementById('carousel-form');
const postsListEl = document.getElementById('posts-list');
const editPostsListEl = document.getElementById('edit-posts-list');
const imageInput = document.getElementById('image');
const imagePreview = document.getElementById('image-preview');
const refreshBtn = document.getElementById('refresh-posts');
const refreshEditBtn = document.getElementById('refresh-edit-posts');
const generatedResults = document.getElementById('generated-results');

// Tab Navigation
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const mode = btn.dataset.mode;
        
        // Update active tab
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Show/hide modes
        publishMode?.classList.remove('active');
        generateMode?.classList.remove('active');
        editMode?.classList.remove('active');
        videoMode?.classList.remove('active');
        carouselMode?.classList.remove('active');
        dailyMode?.classList.remove('active');
        
        if (mode === 'publish') {
            publishMode?.classList.add('active');
        } else if (mode === 'generate') {
            generateMode?.classList.add('active');
        } else if (mode === 'edit') {
            editMode?.classList.add('active');
            loadEditPosts(); // Load posts when switching to edit tab
        } else if (mode === 'video') {
            videoMode?.classList.add('active');
        } else if (mode === 'carousel') {
            carouselMode?.classList.add('active');
        } else if (mode === 'daily') {
            dailyMode?.classList.add('active');
            initDailyMode();
        }
    });
});

// Image Preview - Multiple Images
imageInput.addEventListener('change', (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length > 10) {
        showToast('Maximum 10 images allowed', 'error');
        e.target.value = '';
        return;
    }
    
    if (files.length > 0) {
        imagePreview.innerHTML = '';
        imagePreview.classList.add('active');
        
        files.forEach((file, index) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const imgContainer = document.createElement('div');
                imgContainer.className = 'preview-item';
                imgContainer.innerHTML = `
                    <img src="${e.target.result}" alt="Preview ${index + 1}">
                    <span class="preview-number">${index + 1}</span>
                `;
                imagePreview.appendChild(imgContainer);
            };
            reader.readAsDataURL(file);
        });
    } else {
        imagePreview.classList.remove('active');
        imagePreview.innerHTML = '';
    }
});

// Publish Form Submit
publishForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const imageFile = formData.get('image');
    
    // Check if at least one platform is selected
    const hasLinkedIn = document.getElementById('publish_linkedin').checked;
    const hasFacebook = document.getElementById('publish_facebook').checked;
    const hasInstagram = document.getElementById('publish_instagram').checked;
    
    if (!hasLinkedIn && !hasFacebook && !hasInstagram) {
        showToast('Please select at least one platform', 'error');
        return;
    }
    
    // Prepare data for n8n
    const data = {
        post_type: formData.get('post_type'),
        publish_linkedin: hasLinkedIn ? 'Yes' : 'No',
        publish_facebook: hasFacebook ? 'Yes' : 'No',
        publish_instagram: hasInstagram ? 'Yes' : 'No',
    };
    
    // Check if we have pending image URLs (from "Use in Create Post")
    const imageFiles = imageInput.files;
    const hasPendingUrls = window.pendingImageUrls && window.pendingImageUrls.length > 0;
    const hasNewFiles = imageFiles && imageFiles.length > 0;
    
    if (hasPendingUrls && !hasNewFiles) {
        // Use existing URLs - download and convert to base64
        showToast('Preparing images from URLs...', 'info');
        try {
            const imagesArray = await Promise.all(
                window.pendingImageUrls.map(async (url) => {
                    try {
                        const response = await fetch(url);
                        if (!response.ok) throw new Error(`HTTP ${response.status}`);
                        const blob = await response.blob();
                        const base64 = await blobToBase64(blob);
                        
                        const extension = url.split('.').pop().split('?')[0].toLowerCase();
                        const validExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
                        const fileExtension = validExtensions.includes(extension) ? extension : 'jpg';
                        const mimeType = `image/${fileExtension === 'jpg' ? 'jpeg' : fileExtension}`;
                        
                        return {
                            data: base64,
                            mimeType: mimeType,
                            fileName: `image.${fileExtension}`
                        };
                    } catch (error) {
                        console.error('Error downloading image:', url, error);
                        return null;
                    }
                })
            );
            
            const validImages = imagesArray.filter(img => img !== null);
            if (validImages.length > 0) {
                if (validImages.length === 1) {
                    data.Image = validImages[0];
                } else {
                    data.Images = validImages;
                }
            }
        } catch (error) {
            console.error('Error processing URLs:', error);
            showToast('Error preparing images: ' + error.message, 'error');
            return;
        }
    } else if (hasNewFiles) {
        // Convert new files to base64 array
        const imagesArray = [];
        
        for (let i = 0; i < imageFiles.length; i++) {
            const file = imageFiles[i];
            if (file.size > 0) {
                const base64 = await fileToBase64(file);
                imagesArray.push({
                    data: base64,
                    mimeType: file.type,
                    fileName: file.name
                });
            }
        }
        
        // If only one image, send as single object for backward compatibility
        // If multiple, send as array
        if (imagesArray.length === 1) {
            data.Image = imagesArray[0];
        } else if (imagesArray.length > 1) {
            data.Images = imagesArray; // Multiple images
        }
    }
    
    try {
        const btn = e.target.querySelector('button[type="submit"]');
        btn.disabled = true;
        btn.textContent = 'Publishing...';
        
        // Send to n8n webhook
        fetch(n8nPublishWebhook, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        // Clear pending URLs
        window.pendingImageUrls = null;
        
        // Show progress alert for publishing
        showProgressAlert(
            'Publishing Post',
            'Sending post to social media platforms...',
            'Connecting to workflow...'
        );
        updateProgress(30, 'Processing content...');
        
        // Wait for workflow to complete and verify in database
        if (supabaseClient) {
            // Get current post count
            const { count: initialCount } = await supabaseClient
                .from('social_posts')
                .select('*', { count: 'exact', head: true });
            
            updateProgress(50, 'Uploading to platforms...');
            
            // Poll database for new post (check every 2 seconds, max 15 seconds)
            let attempts = 0;
            const maxAttempts = 7;
            let postCreated = false;
            
            while (attempts < maxAttempts && !postCreated) {
                await new Promise(resolve => setTimeout(resolve, 2000));
                attempts++;
                
                updateProgress(50 + (attempts * 7), 'Verifying publication...');
                
                const { count: newCount } = await supabaseClient
                    .from('social_posts')
                    .select('*', { count: 'exact', head: true });
                
                if (newCount > initialCount) {
                    postCreated = true;
                    updateProgress(100, 'Published!');
                    
                    // Get platforms that were selected
                    const platformsSelected = [];
                    if (data.Platforms?.includes('linkedin')) platformsSelected.push('LinkedIn');
                    if (data.Platforms?.includes('twitter')) platformsSelected.push('Twitter');
                    if (data.Platforms?.includes('facebook')) platformsSelected.push('Facebook');
                    
                    setTimeout(() => {
                        showSuccessAlert(
                            'Post Published',
                            `Post successfully published${platformsSelected.length ? ' to ' + platformsSelected.join(', ') : ''}.`
                        );
                    }, 500);
                    
                    publishForm.reset();
                    imagePreview.classList.remove('active');
                    imagePreview.innerHTML = '';
                    loadPosts(); // Refresh immediately
                    break;
                }
            }
            
            if (!postCreated) {
                hideProgressAlert();
                showToast('Post sent to workflow. It should appear shortly - refresh to check.', 'warning');
            }
        } else {
            // No Supabase, just show success after delay
            updateProgress(70, 'Sending...');
            await new Promise(resolve => setTimeout(resolve, 2000));
            updateProgress(100, 'Sent!');
            
            setTimeout(() => {
                showSuccessAlert(
                    'Post Sent',
                    'Post sent to publishing workflow.'
                );
            }, 500);
            
            publishForm.reset();
            imagePreview.classList.remove('active');
            imagePreview.innerHTML = '';
        }
        
    } catch (error) {
        console.error('Error:', error);
        hideProgressAlert();
        showToast('Error publishing. Check webhook configuration.', 'error');
    } finally {
        const btn = e.target.querySelector('button[type="submit"]');
        btn.disabled = false;
        btn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
                <polyline points="16 6 12 2 8 6"></polyline>
                <line x1="12" y1="2" x2="12" y2="15"></line>
            </svg>
            Publish to Social Media
        `;
    }
});

// Generate Form Submit
generateForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const useCustomColors = document.getElementById('use_custom_colors')?.checked || false;
    
    const data = {
        topic: formData.get('topic'),
        post_type: formData.get('post_type'),
        visual_style: formData.get('visual_style'),
        orientation: formData.get('orientation'),
        headline: formData.get('headline'),
        data_points: formData.get('data_points') || '',
        context: formData.get('context') || '',
        // Color palette
        use_custom_colors: useCustomColors,
        color_primary: useCustomColors ? formData.get('color_primary') : '#207CE5',
        color_secondary: useCustomColors ? formData.get('color_secondary') : '#004AAD',
        color_accent: useCustomColors ? formData.get('color_accent') : '#FFFDF1',
        color_dark: useCustomColors ? formData.get('color_dark') : '#2B2B2B'
    };
    
    try {
        const btn = e.target.querySelector('button[type="submit"]');
        btn.disabled = true;
        btn.textContent = 'Generating...';
        
        // Show progress alert
        showProgressAlert(
            'Generating Content',
            'AI is creating LinkedIn post and custom image...',
            'Sending request to AI...'
        );
        updateProgress(10, 'Sending request to AI...');
        
        // Send to n8n webhook
        fetch(n8nGenerateWebhook, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        updateProgress(20, 'AI is analyzing topic...');
        
        generatedResults.style.display = 'block';
        document.getElementById('generated-copy').textContent = 
            'Content is being generated. The result will appear shortly...';
        document.getElementById('generated-image').innerHTML = 
            '<p style="color: var(--text-secondary);">Image will appear when generation completes.</p>';
        
        // Wait for post to appear in database WITH image
        if (supabaseClient) {
            const { data: initialPosts } = await supabaseClient
                .from('social_posts')
                .select('id')
                .order('created_at', { ascending: false })
                .limit(1);
            
            const lastPostId = initialPosts?.[0]?.id || 0;
            
            let attempts = 0;
            const maxAttempts = 45; // 90 seconds max for generation (image takes time)
            let postComplete = false;
            
            updateProgress(30, 'Generating LinkedIn copy...');
            
            // Status to display text mapping
            const statusMessages = {
                'copy_completed': { text: 'Copy completed. Creating image prompt...', percent: 45 },
                'prompt_completed': { text: 'Prompt completed. Downloading assets...', percent: 55 },
                'image_generated': { text: 'Generating image with Gemini...', percent: 70 },
                'completed': { text: 'Generation complete', percent: 100 }
            };
            
            while (attempts < maxAttempts && !postComplete) {
                await new Promise(resolve => setTimeout(resolve, 2000));
                attempts++;
                
                // Check for new post with status
                const { data: newPosts } = await supabaseClient
                    .from('social_posts')
                    .select('id, post_type, image_url, topic, status')
                    .order('created_at', { ascending: false })
                    .limit(1);
                
                if (newPosts && newPosts.length > 0) {
                    const latestPost = newPosts[0];
                    
                    // Check if this is a new post (different ID than before)
                    if (latestPost.id !== lastPostId) {
                        // Get status-based progress
                        const statusInfo = statusMessages[latestPost.status];
                        
                        if (statusInfo) {
                            updateProgress(statusInfo.percent, statusInfo.text);
                        } else {
                            // Fallback for unknown status
                            const progressPercent = Math.min(30 + (attempts * 1.5), 90);
                            updateProgress(progressPercent, 'Processing...');
                        }
                        
                        // Check if complete (has image URL)
                        if (latestPost.image_url && latestPost.image_url.startsWith('http')) {
                            postComplete = true;
                            updateProgress(100, 'Generation complete');
                            
                            // Show success alert and navigate to publish tab
                            setTimeout(() => {
                                showSuccessAlert(
                                    'Content Generated',
                                    `Topic: "${latestPost.topic || data.topic}" - Copy and image ready. Navigate to Publish to post on LinkedIn.`
                                );
                                // Switch to Publish tab
                                document.querySelector('[data-mode="publish"]')?.click();
                            }, 500);
                            
                            loadPosts();
                            break;
                        }
                    }
                }
            }
            
            if (!postComplete) {
                // Final check and load whatever we have
                hideProgressAlert();
                loadPosts();
                showToast('Content created. Image may still be processing - refresh in a moment.', 'warning');
            }
        } else {
            // No Supabase - simulate progress
            for (let i = 0; i < 5; i++) {
                await new Promise(resolve => setTimeout(resolve, 2000));
                updateProgress(30 + (i * 15), 'Processing...');
            }
            hideProgressAlert();
            showToast('Content sent for generation!', 'success');
        }
        
    } catch (error) {
        console.error('Error:', error);
        hideProgressAlert();
        showToast('Error generating content. Check webhook configuration.', 'error');
    } finally {
        const btn = e.target.querySelector('button[type="submit"]');
        btn.disabled = false;
        btn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
            </svg>
            Generate Content
        `;
    }
});

// Load Posts from Supabase
async function loadPosts() {
    if (!supabaseClient) {
        postsListEl.innerHTML = `
            <div class="empty-state">
                <h3>Configuration Required</h3>
                <p>Please configure Supabase in app.js to view saved posts.</p>
            </div>
        `;
        return;
    }
    
    try {
        postsListEl.innerHTML = '<div class="loading">Loading posts...</div>';
        
        const { data, error } = await supabaseClient
            .from('social_posts')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        if (!data || data.length === 0) {
            postsListEl.innerHTML = `
                <div class="empty-state">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="9" y1="9" x2="15" y2="15"></line>
                        <line x1="15" y1="9" x2="9" y2="15"></line>
                    </svg>
                    <h3>No posts yet</h3>
                    <p>Generate new content to get started</p>
                </div>
            `;
            return;
        }
        
        postsListEl.innerHTML = data.map(post => renderPost(post)).join('');
        
    } catch (error) {
        console.error('Error loading posts:', error);
        postsListEl.innerHTML = `
            <div class="empty-state">
                <h3>Error loading</h3>
                <p>${error.message}</p>
            </div>
        `;
    }
}

// Render Post Item
function renderPost(post) {
    const date = new Date(post.created_at).toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    const isCompleted = post.status === 'completed';
    
    // Determine published platforms
    const platforms = [];
    if (post.publish_linkedin === 'Yes') platforms.push('linkedin');
    if (post.publish_facebook === 'Yes') platforms.push('facebook');
    if (post.publish_instagram === 'Yes') platforms.push('instagram');
    
    // Parse image_url - can be JSON array, comma-separated, or single URL
    let imageUrls = [];
    if (post.image_url) {
        // Try JSON array format FIRST (because it might contain commas inside)
        if (post.image_url.startsWith('[')) {
            try {
                const parsed = JSON.parse(post.image_url);
                if (Array.isArray(parsed)) {
                    imageUrls = parsed;
                }
            } catch (e) {
                // Silent fail
            }
        }
        // Try comma-separated URLs (simple format)
        else if (post.image_url.includes(',')) {
            imageUrls = post.image_url.split(',').map(url => url.trim()).filter(url => url);
        }
        // Single URL
        else if (post.image_url.startsWith('http')) {
            imageUrls = [post.image_url];
        }
    }
    
    return `
        <div class="post-item" data-post-id="${post.id}">
            <div class="post-header">
                <div>
                    <span class="post-meta">${date}</span>
                </div>
                <div style="display: flex; align-items: center; gap: 8px;">
                    ${platforms.length > 0 ? `
                        <div style="display: flex; gap: 4px;">
                            ${platforms.includes('linkedin') ? `<span class="platform-badge" style="background: #0077b5; color: white; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 600;">LinkedIn</span>` : ''}
                            ${platforms.includes('facebook') ? `<span class="platform-badge" style="background: #1877f2; color: white; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 600;">Facebook</span>` : ''}
                            ${platforms.includes('instagram') ? `<span class="platform-badge" style="background: #e4405f; color: white; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 600;">Instagram</span>` : ''}
                        </div>
                    ` : ''}
                </div>
            </div>
            
            ${post.post_type ? `
                <div class="post-content" style="margin: 16px 0; font-size: 15px; line-height: 1.6; color: #1d2129; white-space: pre-wrap; word-wrap: break-word;">${escapeHtml(post.post_type)}</div>
            ` : ''}
            
            ${imageUrls.length > 0 ? `
                <div class="post-images-grid" style="display: grid; grid-template-columns: ${imageUrls.length === 1 ? '1fr' : imageUrls.length === 2 ? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(200px, 1fr))'}; gap: 8px; margin-top: 12px;">
                    ${imageUrls.map((url, idx) => {
                        const cleanUrl = url.trim().replace(/'/g, '%27');
                        return `
                        <div class="image-container" style="position: relative; width: 100%; aspect-ratio: 4/5; background: linear-gradient(135deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%); background-size: 200% 200%; animation: shimmer 1.5s infinite; border-radius: 8px; overflow: hidden;">
                            <img 
                                src="${cleanUrl}" 
                                alt="Post image ${idx + 1}" 
                                loading="lazy"
                                class="post-grid-image"
                                data-url="${cleanUrl}"
                                onload="this.style.opacity='1'; this.parentElement.style.background='none'; this.parentElement.style.animation='none';"
                                onerror="this.style.display='none'; this.parentElement.classList.add('image-error');"
                            >
                        </div>
                    `;
                    }).join('')}
                </div>
            ` : ''}
            
            ${platforms.length === 0 ? `
                <div class="publish-section" style="margin-top: 16px; padding: 16px; background: #f8f9fa; border-radius: 8px;">
                    <div style="margin-bottom: 12px; font-weight: 600; color: #333;">Not published yet</div>
                    <button class="btn btn-small btn-use-content" onclick="useInCreatePost('${post.id}')" style="background: #3b82f6; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 600;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                        Use in Create Post
                    </button>
                </div>
            ` : ''}
        </div>
    `;
}

// Use Post Content in Create New Post Form
async function useInCreatePost(postId) {
    if (!supabaseClient) {
        showToast('Supabase is not configured', 'error');
        return;
    }
    
    try {
        showToast('Loading post content...', 'info');
        
        // CLEAR PREVIOUS CONTENT FIRST
        const postTypeInput = document.getElementById('post_type');
        const previewArea = document.getElementById('image-preview');
        const imageFileInput = document.getElementById('image');
        
        // Reset form fields
        if (postTypeInput) postTypeInput.value = '';
        if (previewArea) {
            previewArea.innerHTML = '';
            previewArea.classList.remove('active');
        }
        if (imageFileInput) imageFileInput.value = '';
        window.pendingImageUrls = null;
        
        // Uncheck all platform checkboxes
        document.getElementById('publish_linkedin').checked = false;
        document.getElementById('publish_facebook').checked = false;
        document.getElementById('publish_instagram').checked = false;
        
        // Get post data from database
        const { data: post, error } = await supabaseClient
            .from('social_posts')
            .select('*')
            .eq('id', postId)
            .single();
        
        if (error) throw error;
        
        // Fill the Post Content textarea
        if (postTypeInput && post.post_type) {
            postTypeInput.value = post.post_type;
        }
        
        // Handle images - download and add to file input preview
        let imageUrls = [];
        if (post.image_url) {
            // Parse image_url - can be JSON array, comma-separated, or single URL
            if (post.image_url.startsWith('[')) {
                try {
                    const parsed = JSON.parse(post.image_url);
                    if (Array.isArray(parsed)) {
                        // If array of objects with url property
                        if (parsed.length > 0 && parsed[0].url) {
                            imageUrls = parsed.map(img => img.url);
                        } else {
                            imageUrls = parsed;
                        }
                    }
                } catch (e) {
                    // Silent fail
                }
            } else if (post.image_url.includes(',')) {
                imageUrls = post.image_url.split(',').map(url => url.trim()).filter(url => url);
            } else if (post.image_url.startsWith('http')) {
                imageUrls = [post.image_url];
            }
        }
        
        // Show images in preview area
        if (imageUrls.length > 0) {
            const previewArea = document.getElementById('image-preview');
            previewArea.innerHTML = '';
            previewArea.classList.add('active');
            
            // Store image URLs for later use when publishing
            window.pendingImageUrls = imageUrls;
            
            imageUrls.forEach((url, index) => {
                const imgContainer = document.createElement('div');
                imgContainer.className = 'preview-item';
                imgContainer.innerHTML = `
                    <img src="${url}" alt="Preview ${index + 1}" onerror="this.parentElement.style.display='none'">
                    <span class="preview-number">${index + 1}</span>
                    <span class="preview-url-indicator" style="position: absolute; bottom: 4px; left: 4px; background: rgba(0,0,0,0.7); color: white; padding: 2px 6px; border-radius: 4px; font-size: 10px;">From URL</span>
                `;
                previewArea.appendChild(imgContainer);
            });
            
            // Clear file input since we're using URLs
            document.getElementById('image').value = '';
        }
        
        // Switch to Publish tab
        document.querySelector('[data-mode="publish"]').click();
        
        // Scroll to form
        document.getElementById('publish-form').scrollIntoView({ behavior: 'smooth' });
        
        showToast('Content loaded! Select platforms and publish.', 'success');
        
    } catch (error) {
        console.error('Error loading post:', error);
        showToast('Error loading post: ' + error.message, 'error');
    }
}

// Publish Single Post
async function publishPost(postId) {
    if (!supabaseClient) {
        showToast('Supabase is not configured', 'error');
        return;
    }
    
    try {
        // Get post data
        const { data: post, error } = await supabaseClient
            .from('social_posts')
            .select('*')
            .eq('id', postId)
            .single();
        
        if (error) throw error;
        
        // Get selected platforms from checkboxes
        const linkedinChecked = document.getElementById(`linkedin_${postId}`)?.checked || false;
        const facebookChecked = document.getElementById(`facebook_${postId}`)?.checked || false;
        const instagramChecked = document.getElementById(`instagram_${postId}`)?.checked || false;
        
        if (!linkedinChecked && !facebookChecked && !instagramChecked) {
            showToast('Please select at least one platform', 'warning');
            return;
        }
        
        // Validate post has content
        if (!post.post_type || post.post_type.trim() === '') {
            showToast('Post has no content to publish', 'error');
            return;
        }
        
        // Prepare data for n8n webhook - matching current-flow.json format
        const publishData = {
            post_id: post.id,  // ID para verificar si existe en n8n
            post_type: post.post_type || '',
            publish_linkedin: linkedinChecked ? 'Yes' : 'No',
            publish_facebook: facebookChecked ? 'Yes' : 'No',
            publish_instagram: instagramChecked ? 'Yes' : 'No',
        };
        
        // Handle image_url - current-flow expects Images array with base64 format
        if (post.image_url) {
            // Parse image_url if it's a string
            let imageUrls = [];
            if (typeof post.image_url === 'string') {
                if (post.image_url.startsWith('[')) {
                    try {
                        const parsed = JSON.parse(post.image_url);
                        // Si es un array de objetos con url, extraer las URLs
                        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].url) {
                            imageUrls = parsed.map(img => img.url);
                        } else {
                            imageUrls = parsed;
                        }
                    } catch (e) {
                        imageUrls = post.image_url.split(',').map(url => url.trim()).filter(u => u);
                    }
                } else if (post.image_url.includes(',')) {
                    imageUrls = post.image_url.split(',').map(url => url.trim()).filter(u => u);
                } else {
                    imageUrls = [post.image_url];
                }
            } else if (Array.isArray(post.image_url)) {
                // Si es un array de objetos con url, extraer las URLs
                if (post.image_url.length > 0 && post.image_url[0].url) {
                    imageUrls = post.image_url.map(img => img.url);
                } else {
                    imageUrls = post.image_url;
                }
            }
            
            // Download images and convert to base64 format (matching create new post format)
            if (imageUrls.length > 0) {
                showToast('Downloading images...', 'info');
                try {
                    const imagesBase64 = await Promise.all(
                        imageUrls.map(async (url) => {
                            try {
                                console.log('Downloading image from:', url);
                                // Download image from URL
                                const response = await fetch(url);
                                if (!response.ok) {
                                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                                }
                                const blob = await response.blob();
                                console.log('Image downloaded, size:', blob.size, 'type:', blob.type);
                                const base64 = await blobToBase64(blob);
                                console.log('Base64 conversion complete, length:', base64.length);
                                
                                // Get file extension from URL or default to jpg
                                const extension = url.split('.').pop().split('?')[0].toLowerCase();
                                const validExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
                                const fileExtension = validExtensions.includes(extension) ? extension : 'jpg';
                                const mimeType = `image/${fileExtension === 'jpg' ? 'jpeg' : fileExtension}`;
                                
                                const imageData = {
                                    data: `data:${mimeType};base64,${base64}`,
                                    mimeType: mimeType,
                                    fileName: `image.${fileExtension}`
                                };
                                console.log('Image data prepared:', { mimeType, fileName: imageData.fileName, dataLength: imageData.data.length });
                                return imageData;
                            } catch (error) {
                                console.error('Error downloading image:', url, error);
                                return null;
                            }
                        })
                    );
                    
                    // Filter out failed downloads
                    const validImages = imagesBase64.filter(img => img !== null);
                    console.log('Valid images after filtering:', validImages.length);
                    
                    if (validImages.length === 0) {
                        throw new Error('Failed to download any images');
                    }
                    
                    // Use Images array format (same as create new post)
                    publishData.Images = validImages;
                    console.log('Added Images to publishData:', publishData.Images.length, 'images');
                    
                } catch (error) {
                    console.error('Error processing images:', error);
                    showToast('Error downloading images: ' + error.message, 'error');
                    return;
                }
            }
        }
        
        // Safety check: ensure we're not sending to generation webhook
        if (!n8nPublishWebhook || n8nPublishWebhook.includes('70738d02-4bd8-4dac-853f-ba4836aafaf5')) {
            showToast('Error: Publish webhook not configured correctly', 'error');
            console.error('WEBHOOK ERROR: n8nPublishWebhook is:', n8nPublishWebhook);
            console.error('This should be the PUBLISH webhook (025d6de3...), not the GENERATE webhook (70738d02...)');
            return;
        }
        
        // Send to n8n webhook
        const response = await fetch(n8nPublishWebhook, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(publishData)
        });
        
        // Note: no-cors mode doesn't allow reading response
        // So we'll show success and reload posts
        showToast(`Publishing to ${[linkedinChecked && 'LinkedIn', facebookChecked && 'Facebook', instagramChecked && 'Instagram'].filter(Boolean).join(', ')}...`, 'success');
        
        // Update post status in database
        await supabaseClient
            .from('social_posts')
            .update({
                publish_linkedin: linkedinChecked ? 'Yes' : 'No',
                publish_facebook: facebookChecked ? 'Yes' : 'No',
                publish_instagram: instagramChecked ? 'Yes' : 'No'
            })
            .eq('id', postId);
        
        // Reload posts to show updated status
        setTimeout(() => loadPosts(), 1000);
        
    } catch (error) {
        console.error('Error:', error);
        showToast('Error publishing: ' + error.message, 'error');
    }
}

// Publish Multiple Selected Posts
async function publishSelectedPosts() {
    if (selectedPosts.size === 0) {
        showToast('Select at least one post', 'warning');
        return;
    }
    
    const platforms = prompt('Which platforms do you want to publish to?\nEnter: linkedin, facebook, instagram (separated by commas)');
    if (!platforms) return;
    
    const platformList = platforms.toLowerCase().split(',').map(p => p.trim());
    
    for (const postId of selectedPosts) {
        await publishPost(postId);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Delay between posts
    }
    
    selectedPosts.clear();
    loadPosts();
}

// Utility Functions
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const base64 = reader.result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const base64 = reader.result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    
    // Add icon based on type
    const icons = {
        success: '✓',
        error: '✗',
        warning: '⚠',
        info: 'ℹ'
    };
    
    toast.innerHTML = `<span style="font-size: 18px;">${icons[type] || icons.info}</span> ${message}`;
    toast.className = `toast ${type} show`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 4000);
}

// Progress Alert Functions
function showProgressAlert(title, message, status = 'Starting...') {
    const alert = document.getElementById('progress-alert');
    const progressBar = document.getElementById('progress-bar');
    
    document.getElementById('progress-title').textContent = title;
    document.getElementById('progress-message').textContent = message;
    document.getElementById('progress-status').textContent = status;
    progressBar.style.width = '0%';
    
    alert.classList.add('show');
}

function updateProgress(percent, status) {
    const progressBar = document.getElementById('progress-bar');
    const statusEl = document.getElementById('progress-status');
    
    progressBar.style.width = `${percent}%`;
    if (status) {
        statusEl.textContent = status;
    }
}

function hideProgressAlert() {
    const alert = document.getElementById('progress-alert');
    alert.classList.remove('show');
}

// Success Alert Functions
function showSuccessAlert(title, message) {
    hideProgressAlert(); // Hide progress if showing
    
    const alert = document.getElementById('success-alert');
    document.getElementById('success-title').textContent = title;
    document.getElementById('success-message').textContent = message;
    
    alert.classList.add('show');
}

function hideSuccessAlert() {
    const alert = document.getElementById('success-alert');
    alert.classList.remove('show');
}

// Close success alert button
document.getElementById('success-close')?.addEventListener('click', hideSuccessAlert);

// Event Listeners
refreshBtn.addEventListener('click', loadPosts);

// Use Generated Content
document.getElementById('use-generated-content')?.addEventListener('click', () => {
    const copy = document.getElementById('generated-copy').textContent;
    if (copy) {
        document.getElementById('post_type').value = copy;
        document.querySelector('[data-mode="publish"]').click();
        showToast('Contenido copiado al formulario de publicación', 'success');
    }
});

// Regenerate Content
document.getElementById('regenerate-content')?.addEventListener('click', () => {
    generatedResults.style.display = 'none';
    showToast('Rellena el formulario para generar nuevo contenido', 'info');
});

// Click handler for post grid images (open in new tab)
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('post-grid-image')) {
        const url = e.target.dataset.url;
        if (url) {
            window.open(url.replace(/%27/g, "'"), '_blank');
        }
    }
});

// Show descriptions for Post Type and Visual Style
document.getElementById('post_type_gen')?.addEventListener('change', (e) => {
    const selected = e.target.options[e.target.selectedIndex];
    const description = selected.getAttribute('data-description');
    const descEl = document.getElementById('post_type_description');
    if (descEl) {
        descEl.textContent = description || '';
        descEl.style.display = description ? 'block' : 'none';
    }
});

document.getElementById('visual_style')?.addEventListener('change', (e) => {
    const selected = e.target.options[e.target.selectedIndex];
    const description = selected.getAttribute('data-description');
    const descEl = document.getElementById('visual_style_description');
    if (descEl) {
        descEl.textContent = description || '';
        descEl.style.display = description ? 'block' : 'none';
    }
});

// ============================================
// IMAGE EDIT FUNCTIONALITY
// ============================================

// Preview image URL input
document.getElementById('edit_image_url')?.addEventListener('input', (e) => {
    const url = e.target.value.trim();
    const previewEl = document.getElementById('edit-image-preview');
    
    if (url && url.startsWith('http')) {
        previewEl.innerHTML = `
            <div class="image-container" style="aspect-ratio: 4/5; background: linear-gradient(135deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%); background-size: 200% 200%; animation: shimmer 1.5s infinite;">
                <img 
                    src="${url}" 
                    alt="Preview" 
                    style="width: 100%; height: 100%; object-fit: cover; opacity: 0; transition: opacity 0.3s;"
                    onload="this.style.opacity='1'; this.parentElement.style.background='none'; this.parentElement.style.animation='none';"
                    onerror="this.parentElement.innerHTML='<div style=\\'display: flex; align-items: center; justify-content: center; height: 100%; color: #dc3545; font-size: 14px;\\'>Invalid image URL</div>';"
                >
            </div>
        `;
    } else {
        previewEl.innerHTML = `
            <div class="preview-placeholder">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                    <polyline points="21 15 16 10 5 21"></polyline>
                </svg>
                <span>Paste URL above to preview</span>
            </div>
        `;
    }
});

// Load posts for editing
async function loadEditPosts() {
    if (!supabaseClient) {
        editPostsListEl.innerHTML = `
            <div class="empty-state">
                <h3>Configuration Required</h3>
                <p>Please configure Supabase to view posts.</p>
            </div>
        `;
        return;
    }
    
    try {
        editPostsListEl.innerHTML = '<div class="loading">Loading posts...</div>';
        
        const { data, error } = await supabaseClient
            .from('social_posts')
            .select('*')
            .not('image_url', 'is', null)
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        if (!data || data.length === 0) {
            editPostsListEl.innerHTML = `
                <div class="empty-state">
                    <h3>No images to edit</h3>
                    <p>Generate some content first to have images to edit.</p>
                </div>
            `;
            return;
        }
        
        editPostsListEl.innerHTML = data.map(post => renderEditPost(post)).join('');
        
    } catch (error) {
        console.error('Error loading edit posts:', error);
        editPostsListEl.innerHTML = `
            <div class="empty-state">
                <h3>Error loading</h3>
                <p>${error.message}</p>
            </div>
        `;
    }
}

// Render post for edit selection
function renderEditPost(post) {
    const date = new Date(post.created_at).toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    // Get first image URL
    let imageUrl = '';
    if (post.image_url) {
        if (post.image_url.startsWith('[')) {
            try {
                const parsed = JSON.parse(post.image_url);
                imageUrl = Array.isArray(parsed) ? (parsed[0]?.url || parsed[0]) : '';
            } catch (e) { }
        } else if (post.image_url.startsWith('http')) {
            imageUrl = post.image_url.split(',')[0].trim();
        }
    }
    
    if (!imageUrl) return '';
    
    const truncatedCopy = post.post_type ? 
        (post.post_type.length > 100 ? post.post_type.substring(0, 100) + '...' : post.post_type) : 
        'No copy';
    
    return `
        <div class="edit-post-item" data-post-id="${post.id}" style="display: flex; gap: 12px; padding: 12px; border: 1px solid #e0e0e0; border-radius: 8px; margin-bottom: 12px; cursor: pointer; transition: all 0.2s;" onclick="selectPostForEdit('${post.id}', '${imageUrl.replace(/'/g, "\\'")}')">
            <div class="edit-post-thumbnail" style="width: 80px; height: 100px; flex-shrink: 0; border-radius: 6px; overflow: hidden; background: #f0f0f0;">
                <img src="${imageUrl}" alt="Post" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.style.display='none'">
            </div>
            <div class="edit-post-info" style="flex: 1; min-width: 0;">
                <div style="font-size: 12px; color: #666; margin-bottom: 4px;">${date}</div>
                <div style="font-size: 13px; color: #333; line-height: 1.4; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical;">${escapeHtml(truncatedCopy)}</div>
            </div>
        </div>
    `;
}

// Select post for editing
function selectPostForEdit(postId, imageUrl) {
    // Fill form with selected post data
    document.getElementById('edit_image_url').value = imageUrl;
    document.getElementById('edit_post_id').value = postId;
    
    // Trigger preview update
    document.getElementById('edit_image_url').dispatchEvent(new Event('input'));
    
    // Highlight selected post
    document.querySelectorAll('.edit-post-item').forEach(item => {
        item.style.border = '1px solid #e0e0e0';
        item.style.background = 'white';
    });
    const selectedItem = document.querySelector(`.edit-post-item[data-post-id="${postId}"]`);
    if (selectedItem) {
        selectedItem.style.border = '2px solid #3b82f6';
        selectedItem.style.background = '#f0f7ff';
    }
    
    // Scroll to form
    document.getElementById('edit-image-form').scrollIntoView({ behavior: 'smooth' });
    
    showToast('Post selected. Enter your edit instructions.', 'success');
}

// Edit Image Form Submit
editImageForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const imageUrl = document.getElementById('edit_image_url').value.trim();
    const editInstructions = document.getElementById('edit_instructions').value.trim();
    const postId = document.getElementById('edit_post_id').value || null;
    
    if (!imageUrl || !editInstructions) {
        showToast('Please provide image URL and edit instructions', 'error');
        return;
    }
    
    const data = {
        image_url: imageUrl,
        edit_instructions: editInstructions,
        post_id: postId
    };
    
    try {
        const btn = e.target.querySelector('button[type="submit"]');
        btn.disabled = true;
        btn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="spin">
                <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
            </svg>
            Editing Image...
        `;
        
        // Show progress alert
        showProgressAlert(
            'Editing Image',
            'AI is modifying image based on instructions...',
            'Analyzing original image...'
        );
        updateProgress(10, 'Analyzing original image...');
        
        // Send to n8n webhook
        fetch(n8nEditWebhook, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        updateProgress(20, 'Processing edit instructions...');
        
        // Status to display text mapping for edit flow
        const editStatusMessages = {
            'editing_started': { text: 'Downloading original image...', percent: 30 },
            'generating_edit': { text: 'Generating edited image with Gemini...', percent: 70 },
            'completed': { text: 'Edit complete', percent: 100 }
        };
        
        // Wait for edit to complete and check database
        if (supabaseClient && postId) {
            // Get initial image URL
            const { data: initialPost } = await supabaseClient
                .from('social_posts')
                .select('image_url')
                .eq('id', postId)
                .single();
            
            const initialUrl = initialPost?.image_url || '';
            
            let attempts = 0;
            const maxAttempts = 45; // 90 seconds max
            let editComplete = false;
            
            while (attempts < maxAttempts && !editComplete) {
                await new Promise(resolve => setTimeout(resolve, 2000));
                attempts++;
                
                const { data: updatedPost } = await supabaseClient
                    .from('social_posts')
                    .select('image_url, status')
                    .eq('id', postId)
                    .single();
                
                // Get status-based progress
                const statusInfo = editStatusMessages[updatedPost?.status];
                if (statusInfo) {
                    updateProgress(statusInfo.percent, statusInfo.text);
                } else {
                    // Fallback for unknown status
                    const progressPercent = Math.min(20 + (attempts * 1.8), 95);
                    updateProgress(progressPercent, 'Processing...');
                }
                
                if (updatedPost && updatedPost.image_url !== initialUrl) {
                    editComplete = true;
                    updateProgress(100, 'Edit complete');
                    
                    setTimeout(() => {
                        showSuccessAlert(
                            'Image Edited',
                            'Image successfully edited. Changes applied and saved.'
                        );
                    }, 500);
                    
                    // Update the preview
                    document.getElementById('edit_image_url').value = updatedPost.image_url;
                    document.getElementById('edit_image_url').dispatchEvent(new Event('input'));
                    
                    // Clear instructions
                    document.getElementById('edit_instructions').value = '';
                    
                    // Reload posts
                    loadEditPosts();
                    loadPosts();
                    break;
                }
            }
            
            if (!editComplete) {
                hideProgressAlert();
                showToast('Edit is taking longer than expected. Check posts in a moment.', 'warning');
            }
        } else {
            // No Supabase or no postId - simulate progress
            for (let i = 0; i < 15; i++) {
                await new Promise(resolve => setTimeout(resolve, 2000));
                updateProgress(20 + (i * 5), 'Processing...');
            }
            hideProgressAlert();
            showToast('Edit request sent. Refresh to see changes.', 'success');
        }
        
    } catch (error) {
        console.error('Error:', error);
        hideProgressAlert();
        showToast('Error editing image: ' + error.message, 'error');
    } finally {
        const btn = e.target.querySelector('button[type="submit"]');
        btn.disabled = false;
        btn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
            Apply Edit
        `;
    }
});

// Refresh edit posts button
refreshEditBtn?.addEventListener('click', loadEditPosts);

// =============================================
// Color Palette Functionality
// =============================================

// Initialize color palette interactivity
function initColorPalette() {
    const useCustomColorsCheckbox = document.getElementById('use_custom_colors');
    const colorInputsContainer = document.getElementById('color-inputs');
    const colorPickers = ['primary', 'secondary', 'accent', 'dark'];
    
    if (!useCustomColorsCheckbox || !colorInputsContainer) return;
    
    // Toggle color inputs visibility
    useCustomColorsCheckbox.addEventListener('change', function() {
        if (this.checked) {
            colorInputsContainer.classList.add('active');
        } else {
            colorInputsContainer.classList.remove('active');
        }
    });
    
    // Sync color pickers with hex inputs and preview swatches
    colorPickers.forEach(colorName => {
        const colorPicker = document.getElementById(`color_${colorName}`);
        const hexInput = document.getElementById(`color_${colorName}_hex`);
        const swatch = document.getElementById(`swatch_${colorName}`);
        
        if (!colorPicker || !hexInput) return;
        
        // Color picker changes → update hex input and swatch
        colorPicker.addEventListener('input', function() {
            hexInput.value = this.value.toUpperCase();
            if (swatch) swatch.style.backgroundColor = this.value;
        });
        
        // Hex input changes → update color picker and swatch
        hexInput.addEventListener('input', function() {
            let value = this.value.trim();
            
            // Add # if missing
            if (value && !value.startsWith('#')) {
                value = '#' + value;
            }
            
            // Validate hex color
            if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
                colorPicker.value = value;
                if (swatch) swatch.style.backgroundColor = value;
                this.style.borderColor = '';
            } else if (value.length > 0) {
                this.style.borderColor = 'var(--danger-color)';
            }
        });
        
        // Format hex on blur
        hexInput.addEventListener('blur', function() {
            let value = this.value.trim().toUpperCase();
            if (value && !value.startsWith('#')) {
                value = '#' + value;
            }
            if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
                this.value = value;
                colorPicker.value = value;
                if (swatch) swatch.style.backgroundColor = value;
            } else if (value) {
                // Reset to color picker value if invalid
                this.value = colorPicker.value.toUpperCase();
            }
            this.style.borderColor = '';
        });
    });
    
    // Reset colors to MSI defaults
    window.resetToMSIColors = function() {
        const defaults = {
            primary: '#207CE5',
            secondary: '#004AAD',
            accent: '#FFFDF1',
            dark: '#2B2B2B'
        };
        
        colorPickers.forEach(colorName => {
            const colorPicker = document.getElementById(`color_${colorName}`);
            const hexInput = document.getElementById(`color_${colorName}_hex`);
            const swatch = document.getElementById(`swatch_${colorName}`);
            
            if (colorPicker) colorPicker.value = defaults[colorName];
            if (hexInput) hexInput.value = defaults[colorName];
            if (swatch) swatch.style.backgroundColor = defaults[colorName];
        });
        
        showToast('Colors reset to MSI defaults', 'info');
    };
}

// Call initialization on DOM ready
document.addEventListener('DOMContentLoaded', initColorPalette);
// Also call immediately in case DOM is already loaded
if (document.readyState !== 'loading') {
    initColorPalette();
}

// ========== VIDEO GENERATION ==========

// Reference image preview for video
const videoReferenceInput = document.getElementById('video_reference_image');
const videoReferencePreviewContainer = document.getElementById('video-reference-preview-container');
const videoReferenceImg = document.getElementById('video-reference-img');

if (videoReferenceInput) {
    videoReferenceInput.addEventListener('input', (e) => {
        const url = e.target.value.trim();
        if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
            videoReferenceImg.src = url;
            videoReferencePreviewContainer.style.display = 'block';
            videoReferenceImg.onerror = () => {
                videoReferencePreviewContainer.style.display = 'none';
            };
        } else {
            videoReferencePreviewContainer.style.display = 'none';
        }
    });
}

// Video Form Submit
if (videoForm) {
    videoForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        
        const data = {
            prompt: formData.get('prompt'),
            style: formData.get('style'),
            duration: formData.get('duration'),
            aspect_ratio: formData.get('aspect_ratio'),
            topic: formData.get('topic') || '',
            reference_image_url: formData.get('reference_image_url') || null
        };
        
        if (!data.prompt) {
            showToast('Please enter a video description', 'error');
            return;
        }
        
        const btn = e.target.querySelector('button[type="submit"]');
        const originalText = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner"></span> Generating...';
        
        // Show progress
        showProgressAlert(
            'Generating Video',
            'Creating your video with Veo 3 AI...',
            'Initializing video generation...'
        );
        
        try {
            updateProgress(10, 'Sending request to Veo 3...');
            
            const response = await fetch(n8nVideoWebhook, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            
            updateProgress(30, 'Processing prompt...');
            
            // Video generation takes time - poll or wait for response
            let result;
            try {
                result = await response.json();
            } catch (parseError) {
                // If response is not JSON, assume it's processing
                updateProgress(50, 'Video is being generated (this may take a few minutes)...');
                
                // Wait and show progress updates
                for (let i = 0; i < 12; i++) {
                    await new Promise(resolve => setTimeout(resolve, 5000));
                    updateProgress(50 + (i * 4), `Still generating... (${(i + 1) * 5}s elapsed)`);
                }
                
                hideProgressAlert();
                showToast('Video generation submitted. It may take a few minutes to complete.', 'warning');
                btn.disabled = false;
                btn.innerHTML = originalText;
                return;
            }
            
            if (result.success && result.data?.video_url) {
                updateProgress(100, 'Video ready!');
                
                setTimeout(() => {
                    hideProgressAlert();
                    
                    // Show video results
                    const videoResults = document.getElementById('video-results');
                    const videoPlayer = document.getElementById('generated-video');
                    const downloadLink = document.getElementById('download-video');
                    const promptUsed = document.getElementById('video-prompt-used');
                    
                    if (videoPlayer) {
                        videoPlayer.src = result.data.video_url;
                        videoPlayer.load();
                    }
                    
                    if (downloadLink) {
                        downloadLink.href = result.data.video_url;
                    }
                    
                    if (promptUsed && result.data.prompt) {
                        promptUsed.innerHTML = `<strong>Optimized Prompt:</strong> ${result.data.prompt}`;
                    }
                    
                    if (videoResults) {
                        videoResults.style.display = 'block';
                        videoResults.scrollIntoView({ behavior: 'smooth' });
                    }
                    
                    showSuccessAlert('Video Generated!', 'Your AI video has been created successfully.');
                }, 500);
            } else {
                hideProgressAlert();
                showToast(result.message || 'Video generation failed', 'error');
            }
            
        } catch (error) {
            console.error('Video generation error:', error);
            hideProgressAlert();
            showToast('Error generating video: ' + error.message, 'error');
        } finally {
            btn.disabled = false;
            btn.innerHTML = originalText;
        }
    });
}

// Regenerate video button
const regenerateVideoBtn = document.getElementById('regenerate-video');
if (regenerateVideoBtn) {
    regenerateVideoBtn.addEventListener('click', () => {
        const videoResults = document.getElementById('video-results');
        if (videoResults) {
            videoResults.style.display = 'none';
        }
        // Scroll to form
        videoForm?.scrollIntoView({ behavior: 'smooth' });
    });
}

// ========== END VIDEO GENERATION ==========

// ========== CAROUSEL GENERATION ==========

// Carousel slide counter
let carouselSlideCount = 3;
const MAX_SLIDES = 10;
const MIN_SLIDES = 2;

// Add slide button handler
const addSlideBtn = document.getElementById('add-slide-btn');
const slidesContainer = document.getElementById('slides-container');

if (addSlideBtn && slidesContainer) {
    addSlideBtn.addEventListener('click', () => {
        if (carouselSlideCount >= MAX_SLIDES) {
            showToast(`Maximum ${MAX_SLIDES} slides allowed`, 'warning');
            return;
        }
        
        carouselSlideCount++;
        
        const slideCard = document.createElement('div');
        slideCard.className = 'slide-card';
        slideCard.dataset.slide = carouselSlideCount;
        slideCard.innerHTML = `
            <div class="slide-header">
                <span class="slide-number">Slide ${carouselSlideCount}</span>
                <button type="button" class="remove-slide-btn" title="Remove slide">×</button>
            </div>
            <div class="slide-inputs">
                <input type="text" name="slide_${carouselSlideCount}_headline" class="slide-headline" placeholder="Headline" required>
                <input type="text" name="slide_${carouselSlideCount}_subtext" class="slide-subtext" placeholder="Subtext (optional)">
            </div>
        `;
        
        slidesContainer.appendChild(slideCard);
        
        // Add event listener for remove button
        slideCard.querySelector('.remove-slide-btn').addEventListener('click', function() {
            removeSlide(slideCard);
        });
        
        updateRemoveButtonVisibility();
    });
}

// Remove slide function
function removeSlide(slideCard) {
    if (carouselSlideCount <= MIN_SLIDES) {
        showToast(`Minimum ${MIN_SLIDES} slides required`, 'warning');
        return;
    }
    
    slideCard.remove();
    carouselSlideCount--;
    
    // Renumber remaining slides
    const slides = slidesContainer.querySelectorAll('.slide-card');
    slides.forEach((slide, index) => {
        const num = index + 1;
        slide.dataset.slide = num;
        slide.querySelector('.slide-number').textContent = `Slide ${num}`;
        slide.querySelector('.slide-headline').name = `slide_${num}_headline`;
        slide.querySelector('.slide-subtext').name = `slide_${num}_subtext`;
    });
    
    updateRemoveButtonVisibility();
}

// Update remove button visibility (hide for first slide if only minimum)
function updateRemoveButtonVisibility() {
    const slides = slidesContainer?.querySelectorAll('.slide-card');
    slides?.forEach((slide, index) => {
        const removeBtn = slide.querySelector('.remove-slide-btn');
        if (removeBtn) {
            if (slides.length <= MIN_SLIDES) {
                removeBtn.style.display = 'none';
            } else {
                removeBtn.style.display = index === 0 ? 'none' : 'block';
            }
        }
    });
}

// Event delegation for remove buttons
if (slidesContainer) {
    slidesContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-slide-btn')) {
            const slideCard = e.target.closest('.slide-card');
            if (slideCard) {
                removeSlide(slideCard);
            }
        }
    });
}

// Carousel form submit handler
if (carouselForm) {
    carouselForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        
        // Collect slides data
        const slides = [];
        const slideCards = slidesContainer.querySelectorAll('.slide-card');
        slideCards.forEach((card, index) => {
            const num = index + 1;
            slides.push({
                slide_number: num,
                headline: formData.get(`slide_${num}_headline`) || '',
                subtext: formData.get(`slide_${num}_subtext`) || ''
            });
        });
        
        const data = {
            topic: formData.get('topic') || '',
            visual_style: formData.get('visual_style'),
            context: formData.get('context') || '',
            color_palette: {
                primary: formData.get('color_primary'),
                secondary: formData.get('color_secondary'),
                accent: formData.get('color_accent'),
                dark: formData.get('color_dark')
            },
            slides: slides
        };
        
        if (slides.length < MIN_SLIDES) {
            showToast(`Minimum ${MIN_SLIDES} slides required`, 'error');
            return;
        }
        
        if (!slides.every(s => s.headline)) {
            showToast('Please fill in all slide headlines', 'error');
            return;
        }
        
        const btn = e.target.querySelector('button[type="submit"]');
        const originalText = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner"></span> Generating...';
        
        // Show progress
        showProgressAlert(
            'Generating Carousel',
            `Creating ${slides.length} slides with consistent style...`,
            'Initializing style strategy...'
        );
        
        try {
            updateProgress(5, 'Sending request to AI...');
            
            const response = await fetch(n8nCarouselWebhook, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            
            updateProgress(15, 'Creating unified style strategy...');
            
            // Carousel generation takes time
            let result;
            try {
                result = await response.json();
            } catch (parseError) {
                // If response takes too long
                updateProgress(25, 'Generating slides (this may take a minute per slide)...');
                
                for (let i = 0; i < slides.length * 4; i++) {
                    await new Promise(resolve => setTimeout(resolve, 5000));
                    const slideNum = Math.floor(i / 4) + 1;
                    updateProgress(25 + (i * 5), `Processing slide ${slideNum}...`);
                }
                
                hideProgressAlert();
                showToast('Carousel generation submitted. Check back in a few minutes.', 'warning');
                btn.disabled = false;
                btn.innerHTML = originalText;
                return;
            }
            
            if (result.success && result.data?.slides) {
                updateProgress(100, 'Carousel ready!');
                
                setTimeout(() => {
                    hideProgressAlert();
                    
                    // Show carousel results
                    const carouselResults = document.getElementById('carousel-results');
                    const carouselPreview = document.getElementById('carousel-preview');
                    
                    if (carouselPreview) {
                        carouselPreview.innerHTML = '';
                        
                        result.data.slides.forEach((slide, index) => {
                            const slideEl = document.createElement('div');
                            slideEl.className = 'carousel-slide';
                            slideEl.innerHTML = `
                                <div class="slide-image-container">
                                    <img src="${slide.image_url}" alt="Slide ${index + 1}" class="slide-image">
                                    <span class="slide-badge">${index + 1}</span>
                                </div>
                                <div class="slide-info">
                                    <h4>${slide.headline || ''}</h4>
                                    <p>${slide.subtext || ''}</p>
                                    <a href="${slide.image_url}" download="carousel-slide-${index + 1}.png" class="btn btn-small btn-secondary">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                            <polyline points="7 10 12 15 17 10"></polyline>
                                            <line x1="12" y1="15" x2="12" y2="3"></line>
                                        </svg>
                                        Download
                                    </a>
                                </div>
                            `;
                            carouselPreview.appendChild(slideEl);
                        });
                    }
                    
                    if (carouselResults) {
                        carouselResults.style.display = 'block';
                        carouselResults.scrollIntoView({ behavior: 'smooth' });
                    }
                    
                    showSuccessAlert('Carousel Generated!', `${result.data.slides.length} slides created with consistent style.`);
                }, 500);
            } else {
                hideProgressAlert();
                showToast(result.message || 'Carousel generation failed', 'error');
            }
            
        } catch (error) {
            console.error('Carousel generation error:', error);
            hideProgressAlert();
            showToast('Error generating carousel: ' + error.message, 'error');
        } finally {
            btn.disabled = false;
            btn.innerHTML = originalText;
        }
    });
}

// Download all carousel images
const downloadAllCarouselBtn = document.getElementById('download-all-carousel');
if (downloadAllCarouselBtn) {
    downloadAllCarouselBtn.addEventListener('click', async () => {
        const slides = document.querySelectorAll('#carousel-preview .carousel-slide');
        for (let i = 0; i < slides.length; i++) {
            const img = slides[i].querySelector('img');
            if (img && img.src) {
                try {
                    const response = await fetch(img.src);
                    const blob = await response.blob();
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `carousel-slide-${i + 1}.png`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    window.URL.revokeObjectURL(url);
                    await new Promise(r => setTimeout(r, 500)); // Delay between downloads
                } catch (err) {
                    console.error('Download error:', err);
                }
            }
        }
        showToast('Downloading all slides...', 'success');
    });
}

// Regenerate carousel button
const regenerateCarouselBtn = document.getElementById('regenerate-carousel');
if (regenerateCarouselBtn) {
    regenerateCarouselBtn.addEventListener('click', () => {
        const carouselResults = document.getElementById('carousel-results');
        if (carouselResults) {
            carouselResults.style.display = 'none';
        }
        carouselForm?.scrollIntoView({ behavior: 'smooth' });
    });
}

// Use in post button
const useCarouselInPostBtn = document.getElementById('use-carousel-in-post');
if (useCarouselInPostBtn) {
    useCarouselInPostBtn.addEventListener('click', () => {
        // Collect all image URLs
        const slides = document.querySelectorAll('#carousel-preview .carousel-slide img');
        const urls = Array.from(slides).map(img => img.src).join('\n');
        
        // Copy to clipboard
        navigator.clipboard.writeText(urls).then(() => {
            showToast('Image URLs copied to clipboard!', 'success');
        });
        
        // Switch to publish tab
        document.querySelector('.tab-btn[data-mode="publish"]')?.click();
    });
}

// ========== END CAROUSEL GENERATION ==========

// ========== AUTO DAILY / CONTENT PLANNER ==========

// Initialize daily mode
function initDailyMode() {
    // Set current date
    const now = new Date();
    const dateStr = now.toLocaleDateString('es-ES', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    const currentDateEl = document.getElementById('current-date');
    if (currentDateEl) {
        currentDateEl.textContent = dateStr;
    }
    
    // Set default date for scheduler
    const dateInput = document.getElementById('daily_schedule_date');
    if (dateInput) {
        dateInput.value = now.toISOString().split('T')[0];
    }
    
    // Load saved drafts
    loadDrafts();
}

// Analyze idea with AI button
const analyzeIdeaBtn = document.getElementById('analyze-idea-btn');
if (analyzeIdeaBtn) {
    analyzeIdeaBtn.addEventListener('click', async () => {
        const ideaText = document.getElementById('daily_idea')?.value?.trim();
        
        if (!ideaText) {
            showToast('Por favor escribe una idea primero', 'error');
            return;
        }
        
        const btn = analyzeIdeaBtn;
        const originalText = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner"></span> Analizando...';
        
        showProgressAlert('Analizando tu idea', 'La IA está generando la mejor estrategia...');
        
        try {
            // Call OpenAI directly to analyze the idea
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${CONFIG.openai?.apiKey || ''}`
                },
                body: JSON.stringify({
                    model: 'gpt-4o',
                    messages: [
                        {
                            role: 'system',
                            content: `Eres un estratega de contenido para MSI Technologies, una empresa de consultoría tecnológica.
                            
Analiza la idea del usuario y genera una estrategia de contenido para LinkedIn.

RESPONDE ÚNICAMENTE EN ESTE FORMATO JSON (sin markdown, sin backticks):
{
  "topic": "Título del tema (máximo 10 palabras)",
  "headline": "Headline para la imagen (máximo 6 palabras, impactante)",
  "post_type": "Educational|Thought Leadership|Case Study/Storytelling|Company News|Standard Infographic",
  "visual_style": "Infographic|Glassmorphism|Modern 3D|Isometric|Data Hero",
  "data_points": "2-3 estadísticas o datos relevantes separados por coma",
  "context": "Contexto adicional de 2-3 oraciones sobre por qué es relevante"
}

MSI Technologies se especializa en:
- Modernización de infraestructura IT
- Soluciones cloud
- Optimización de redes
- Ciberseguridad
- Transformación digital`
                        },
                        {
                            role: 'user',
                            content: `Analiza esta idea y genera la estrategia: "${ideaText}"`
                        }
                    ],
                    temperature: 0.7
                })
            });
            
            const result = await response.json();
            
            if (result.choices && result.choices[0]) {
                let content = result.choices[0].message.content;
                
                // Clean up the response (remove markdown if present)
                content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
                
                const strategy = JSON.parse(content);
                
                // Fill in the form fields
                document.getElementById('daily_s_topic').value = strategy.topic || '';
                document.getElementById('daily_s_headline').value = strategy.headline || '';
                document.getElementById('daily_s_post_type').value = strategy.post_type || 'Educational';
                document.getElementById('daily_s_visual_style').value = strategy.visual_style || 'Infographic';
                document.getElementById('daily_s_data_points').value = strategy.data_points || '';
                document.getElementById('daily_s_context').value = strategy.context || '';
                
                // Show step 2
                document.getElementById('daily-step-1').style.display = 'none';
                document.getElementById('daily-step-2').style.display = 'block';
                
                hideProgressAlert();
                showToast('¡Estrategia generada! Revisa y modifica si necesitas.', 'success');
            } else {
                throw new Error('No se pudo generar la estrategia');
            }
            
        } catch (error) {
            console.error('Error analyzing idea:', error);
            hideProgressAlert();
            
            // Fallback: generate basic strategy locally
            const fallbackStrategy = generateLocalStrategy(ideaText);
            
            document.getElementById('daily_s_topic').value = fallbackStrategy.topic;
            document.getElementById('daily_s_headline').value = fallbackStrategy.headline;
            document.getElementById('daily_s_post_type').value = fallbackStrategy.post_type;
            document.getElementById('daily_s_visual_style').value = fallbackStrategy.visual_style;
            document.getElementById('daily_s_data_points').value = fallbackStrategy.data_points;
            document.getElementById('daily_s_context').value = fallbackStrategy.context;
            
            document.getElementById('daily-step-1').style.display = 'none';
            document.getElementById('daily-step-2').style.display = 'block';
            
            showToast('Estrategia básica generada. Mejórala manualmente.', 'warning');
        } finally {
            btn.disabled = false;
            btn.innerHTML = originalText;
        }
    });
}

// Fallback local strategy generator
function generateLocalStrategy(idea) {
    const words = idea.split(' ').slice(0, 5).join(' ');
    return {
        topic: words + '...',
        headline: words.split(' ').slice(0, 4).join(' '),
        post_type: 'Educational',
        visual_style: 'Infographic',
        data_points: '',
        context: idea
    };
}

// Back button
const dailyBackBtn = document.getElementById('daily-back-btn');
if (dailyBackBtn) {
    dailyBackBtn.addEventListener('click', () => {
        document.getElementById('daily-step-2').style.display = 'none';
        document.getElementById('daily-step-1').style.display = 'block';
    });
}

// Save draft button
const dailySaveBtn = document.getElementById('daily-save-btn');
if (dailySaveBtn) {
    dailySaveBtn.addEventListener('click', async () => {
        const draft = collectStrategyData();
        draft.status = 'draft';
        draft.created_at = new Date().toISOString();
        
        // Save to localStorage
        const drafts = JSON.parse(localStorage.getItem('msi_content_drafts') || '[]');
        draft.id = Date.now().toString();
        drafts.unshift(draft);
        localStorage.setItem('msi_content_drafts', JSON.stringify(drafts.slice(0, 20))); // Keep last 20
        
        showToast('Borrador guardado', 'success');
        loadDrafts();
        
        // Reset to step 1
        document.getElementById('daily-step-2').style.display = 'none';
        document.getElementById('daily-step-1').style.display = 'block';
        document.getElementById('daily_idea').value = '';
    });
}

// Generate now button
const dailyStrategyForm = document.getElementById('daily-strategy-form');
if (dailyStrategyForm) {
    dailyStrategyForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const data = collectStrategyData();
        
        // Check if scheduled for later
        const scheduleDate = document.getElementById('daily_schedule_date')?.value;
        const scheduleTime = document.getElementById('daily_schedule_time')?.value;
        
        if (scheduleDate && scheduleTime) {
            const scheduledDateTime = new Date(`${scheduleDate}T${scheduleTime}`);
            const now = new Date();
            
            if (scheduledDateTime > now) {
                // Save as scheduled
                data.status = 'scheduled';
                data.scheduled_for = scheduledDateTime.toISOString();
                data.created_at = new Date().toISOString();
                data.id = Date.now().toString();
                
                const drafts = JSON.parse(localStorage.getItem('msi_content_drafts') || '[]');
                drafts.unshift(data);
                localStorage.setItem('msi_content_drafts', JSON.stringify(drafts.slice(0, 20)));
                
                showSuccessAlert('¡Programado!', `El contenido se generará el ${scheduledDateTime.toLocaleString()}`);
                loadDrafts();
                
                // Reset
                document.getElementById('daily-step-2').style.display = 'none';
                document.getElementById('daily-step-1').style.display = 'block';
                document.getElementById('daily_idea').value = '';
                return;
            }
        }
        
        // Generate now - send to content generation webhook
        await sendToGenerate(data);
    });
}

// Collect strategy form data
function collectStrategyData() {
    return {
        topic: document.getElementById('daily_s_topic')?.value || '',
        headline: document.getElementById('daily_s_headline')?.value || '',
        post_type: document.getElementById('daily_s_post_type')?.value || 'Educational',
        visual_style: document.getElementById('daily_s_visual_style')?.value || 'Infographic',
        data_points: document.getElementById('daily_s_data_points')?.value || '',
        context: document.getElementById('daily_s_context')?.value || '',
        orientation: '4:5',
        original_idea: document.getElementById('daily_idea')?.value || ''
    };
}

// Send to generate content
async function sendToGenerate(data) {
    const btn = document.getElementById('daily-generate-btn');
    const originalText = btn?.innerHTML;
    
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner"></span> Generando...';
    }
    
    showProgressAlert('Generando Contenido', 'Enviando a Generate Content...');
    
    try {
        const response = await fetch(n8nGenerateWebhook, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        updateProgressAlert('Finalizando...', 90);
        
        setTimeout(() => {
            hideProgressAlert();
            
            if (result.success) {
                showSuccessAlert('¡Contenido Generado!', 'Tu post está listo. Ve a la pestaña Publish para verlo.');
                
                // Reset form
                document.getElementById('daily-step-2').style.display = 'none';
                document.getElementById('daily-step-1').style.display = 'block';
                document.getElementById('daily_idea').value = '';
            } else {
                showToast(result.message || 'Error generando contenido', 'error');
            }
        }, 500);
        
    } catch (error) {
        console.error('Generate error:', error);
        hideProgressAlert();
        showToast('Error: ' + error.message, 'error');
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = originalText;
        }
    }
}

// Load drafts
function loadDrafts() {
    const listEl = document.getElementById('daily-drafts-list');
    if (!listEl) return;
    
    const drafts = JSON.parse(localStorage.getItem('msi_content_drafts') || '[]');
    
    if (drafts.length === 0) {
        listEl.innerHTML = '<p class="no-drafts">No hay borradores guardados.</p>';
        return;
    }
    
    listEl.innerHTML = drafts.map(draft => `
        <div class="draft-item ${draft.status}">
            <div class="draft-header">
                <h4 class="draft-topic">${draft.topic || 'Sin título'}</h4>
                <span class="draft-status ${draft.status}">${draft.status === 'scheduled' ? '📅 Programado' : '📝 Borrador'}</span>
            </div>
            <p class="draft-meta">
                ${draft.headline || ''} • ${draft.visual_style || ''}<br>
                ${draft.status === 'scheduled' && draft.scheduled_for ? 
                    `<strong>Programado:</strong> ${new Date(draft.scheduled_for).toLocaleString()}` : 
                    `Creado: ${new Date(draft.created_at).toLocaleDateString()}`}
            </p>
            <div class="draft-actions">
                <button class="btn btn-small btn-primary" onclick="editDraft('${draft.id}')">Editar</button>
                <button class="btn btn-small btn-secondary" onclick="generateDraft('${draft.id}')">Generar</button>
                <button class="btn btn-small btn-danger" onclick="deleteDraft('${draft.id}')">Eliminar</button>
            </div>
        </div>
    `).join('');
}

// Edit draft
window.editDraft = function(id) {
    const drafts = JSON.parse(localStorage.getItem('msi_content_drafts') || '[]');
    const draft = drafts.find(d => d.id === id);
    
    if (draft) {
        document.getElementById('daily_idea').value = draft.original_idea || '';
        document.getElementById('daily_s_topic').value = draft.topic || '';
        document.getElementById('daily_s_headline').value = draft.headline || '';
        document.getElementById('daily_s_post_type').value = draft.post_type || 'Educational';
        document.getElementById('daily_s_visual_style').value = draft.visual_style || 'Infographic';
        document.getElementById('daily_s_data_points').value = draft.data_points || '';
        document.getElementById('daily_s_context').value = draft.context || '';
        
        document.getElementById('daily-step-1').style.display = 'none';
        document.getElementById('daily-step-2').style.display = 'block';
        
        // Delete the draft being edited
        deleteDraft(id, true);
    }
};

// Generate from draft
window.generateDraft = async function(id) {
    const drafts = JSON.parse(localStorage.getItem('msi_content_drafts') || '[]');
    const draft = drafts.find(d => d.id === id);
    
    if (draft) {
        await sendToGenerate(draft);
        deleteDraft(id, true);
    }
};

// Delete draft
window.deleteDraft = function(id, silent = false) {
    let drafts = JSON.parse(localStorage.getItem('msi_content_drafts') || '[]');
    drafts = drafts.filter(d => d.id !== id);
    localStorage.setItem('msi_content_drafts', JSON.stringify(drafts));
    
    if (!silent) {
        showToast('Borrador eliminado', 'success');
    }
    loadDrafts();
};

// Refresh drafts button
const refreshDraftsBtn = document.getElementById('refresh-drafts-btn');
if (refreshDraftsBtn) {
    refreshDraftsBtn.addEventListener('click', () => {
        loadDrafts();
        showToast('Lista actualizada', 'success');
    });
}

// Initialize daily mode when tab is clicked
document.querySelector('.tab-btn[data-mode="daily"]')?.addEventListener('click', () => {
    initDailyMode();
});

// Check for scheduled posts periodically
setInterval(() => {
    const drafts = JSON.parse(localStorage.getItem('msi_content_drafts') || '[]');
    const now = new Date();
    
    drafts.forEach(draft => {
        if (draft.status === 'scheduled' && draft.scheduled_for) {
            const scheduledTime = new Date(draft.scheduled_for);
            if (scheduledTime <= now) {
                // Time to generate!
                console.log('Generating scheduled post:', draft.topic);
                generateDraft(draft.id);
            }
        }
    });
}, 60000); // Check every minute

// ========== END AUTO DAILY / CONTENT PLANNER ==========

// Initialize
if (supabaseUrl === 'YOUR_SUPABASE_URL' || !supabaseUrl) {
    console.warn('⚠️ Por favor configura las credenciales de Supabase en config.js o app.js');
    console.warn('📖 Lee SETUP_GUIDE.md para instrucciones detalladas');
}

if (n8nPublishWebhook === 'YOUR_N8N_PUBLISH_WEBHOOK_URL' || !n8nPublishWebhook) {
    console.warn('⚠️ Por favor configura los webhooks de n8n en config.js o app.js');
    console.warn('📖 Lee SETUP_GUIDE.md para instrucciones detalladas');
}
