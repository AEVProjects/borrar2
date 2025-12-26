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
        generateWebhook: 'YOUR_N8N_GENERATE_WEBHOOK_URL' // From second flow (msi-content-form)
    }
};

// Legacy support - convert old CONFIG format if needed
const supabaseUrl = CONFIG.supabaseUrl || CONFIG.supabase?.url;
const supabaseKey = CONFIG.supabaseKey || CONFIG.supabase?.anonKey;
const n8nPublishWebhook = CONFIG.n8nPublishWebhook || CONFIG.n8n?.publishWebhook;
const n8nGenerateWebhook = CONFIG.n8nGenerateWebhook || CONFIG.n8n?.generateWebhook;

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
const publishForm = document.getElementById('publish-form');
const generateForm = document.getElementById('generate-form');
const postsListEl = document.getElementById('posts-list');
const imageInput = document.getElementById('image');
const imagePreview = document.getElementById('image-preview');
const refreshBtn = document.getElementById('refresh-posts');
const generatedResults = document.getElementById('generated-results');

// Tab Navigation
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const mode = btn.dataset.mode;
        
        // Update active tab
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Show/hide modes
        if (mode === 'publish') {
            publishMode.classList.add('active');
            generateMode.classList.remove('active');
        } else {
            publishMode.classList.remove('active');
            generateMode.classList.add('active');
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
    
    // Convert multiple images to base64 array
    const imageFiles = imageInput.files;
    if (imageFiles && imageFiles.length > 0) {
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
        
        // Wait for workflow to complete and verify in database
        if (supabaseClient) {
            // Get current post count
            const { count: initialCount } = await supabaseClient
                .from('social_posts')
                .select('*', { count: 'exact', head: true });
            
            // Poll database for new post (check every 2 seconds, max 10 seconds)
            let attempts = 0;
            const maxAttempts = 5;
            let postCreated = false;
            
            while (attempts < maxAttempts && !postCreated) {
                await new Promise(resolve => setTimeout(resolve, 2000));
                attempts++;
                
                const { count: newCount } = await supabaseClient
                    .from('social_posts')
                    .select('*', { count: 'exact', head: true });
                
                if (newCount > initialCount) {
                    postCreated = true;
                    showToast('Post published successfully!', 'success');
                    publishForm.reset();
                    imagePreview.classList.remove('active');
                    imagePreview.innerHTML = '';
                    loadPosts(); // Refresh immediately
                    break;
                }
            }
            
            if (!postCreated) {
                showToast('Post sent to workflow. Refresh posts in a moment to see it.', 'warning');
            }
        } else {
            // No Supabase, just show success after delay
            await new Promise(resolve => setTimeout(resolve, 3000));
            showToast('Post sent successfully!', 'success');
            publishForm.reset();
            imagePreview.classList.remove('active');
            imagePreview.innerHTML = '';
        }
        
    } catch (error) {
        console.error('Error:', error);
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
    const data = {
        topic: formData.get('topic'),
        post_type: formData.get('post_type'),
        visual_style: formData.get('visual_style'),
        orientation: formData.get('orientation'),
        headline: formData.get('headline'),
        data_points: formData.get('data_points') || '',
        context: formData.get('context') || ''
    };
    
    try {
        const btn = e.target.querySelector('button[type="submit"]');
        btn.disabled = true;
        btn.textContent = 'Generando...';
        
        // Send to n8n webhook
        fetch(n8nGenerateWebhook, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        // Show message that content is being generated
        showToast('Contenido en generación...', 'success');
        
        generatedResults.style.display = 'block';
        document.getElementById('generated-copy').textContent = 
            'El contenido se está generando. Por favor, actualiza la lista de posts en unos momentos para ver el resultado.';
        document.getElementById('generated-image').innerHTML = 
            '<p style="color: var(--text-secondary);">La imagen aparecerá en la base de datos cuando se complete la generación.</p>';
        
        // Wait for post to appear in database
        if (supabaseClient) {
            const { count: initialCount } = await supabaseClient
                .from('social_posts')
                .select('*', { count: 'exact', head: true });
            
            let attempts = 0;
            const maxAttempts = 10; // 20 seconds max for generation
            let postCreated = false;
            
            while (attempts < maxAttempts && !postCreated) {
                await new Promise(resolve => setTimeout(resolve, 2000));
                attempts++;
                
                const { count: newCount } = await supabaseClient
                    .from('social_posts')
                    .select('*', { count: 'exact', head: true });
                
                if (newCount > initialCount) {
                    postCreated = true;
                    showToast('Contenido generado exitosamente!', 'success');
                    loadPosts(); // Refresh immediately
                    break;
                }
            }
            
            if (!postCreated) {
                showToast('La generación está tomando más tiempo. Refresca los posts en unos momentos.', 'warning');
            }
        }
        
    } catch (error) {
        console.error('Error:', error);
        showToast('Error al generar contenido. Verifica la configuración del webhook.', 'error');
    } finally {
        const btn = e.target.querySelector('button[type="submit"]');
        btn.disabled = false;
        btn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
            </svg>
            Generar Contenido
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
                <div class="post-images-grid" style="display: grid; grid-template-columns: ${imageUrls.length === 1 ? '1fr' : imageUrls.length === 2 ? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(250px, 1fr))'}; gap: 8px; margin-top: 12px;">
                    ${imageUrls.map(url => `
                        <img src="${url.trim()}" alt="Post image" style="width: 100%; height: ${imageUrls.length === 1 ? 'auto' : '250px'}; max-height: 500px; object-fit: cover; border-radius: 8px; cursor: pointer;" onerror="this.style.display='none'" onclick="window.open('${url.trim()}', '_blank')">
                    `).join('')}
                </div>
            ` : ''}
            
            ${platforms.length === 0 ? `
                <div class="publish-section" style="margin-top: 16px; padding: 16px; background: #f8f9fa; border-radius: 8px;">
                    <div style="margin-bottom: 12px; font-weight: 600; color: #333;">Select platforms to publish:</div>
                    <div style="display: flex; gap: 12px; margin-bottom: 12px; flex-wrap: wrap;">
                        <label style="display: flex; align-items: center; gap: 6px; cursor: pointer;">
                            <input type="checkbox" id="linkedin_${post.id}" style="width: 16px; height: 16px; cursor: pointer;">
                            <span style="font-size: 14px;">LinkedIn</span>
                        </label>
                        <label style="display: flex; align-items: center; gap: 6px; cursor: pointer;">
                            <input type="checkbox" id="facebook_${post.id}" style="width: 16px; height: 16px; cursor: pointer;">
                            <span style="font-size: 14px;">Facebook</span>
                        </label>
                        <label style="display: flex; align-items: center; gap: 6px; cursor: pointer;">
                            <input type="checkbox" id="instagram_${post.id}" style="width: 16px; height: 16px; cursor: pointer;">
                            <span style="font-size: 14px;">Instagram</span>
                        </label>
                    </div>
                    <button class="btn btn-small btn-publish" onclick="publishPost('${post.id}')" style="background: #10b981; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 6px; font-size: 14px; font-weight: 600;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
                            <polyline points="16 6 12 2 8 6"></polyline>
                            <line x1="12" y1="2" x2="12" y2="15"></line>
                        </svg>
                        Publish Now
                    </button>
                </div>
            ` : ''}
        </div>
    `;
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
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

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

// Initialize
if (supabaseUrl === 'YOUR_SUPABASE_URL' || !supabaseUrl) {
    console.warn('⚠️ Por favor configura las credenciales de Supabase en config.js o app.js');
    console.warn('📖 Lee SETUP_GUIDE.md para instrucciones detalladas');
}

if (n8nPublishWebhook === 'YOUR_N8N_PUBLISH_WEBHOOK_URL' || !n8nPublishWebhook) {
    console.warn('⚠️ Por favor configura los webhooks de n8n en config.js o app.js');
    console.warn('📖 Lee SETUP_GUIDE.md para instrucciones detalladas');
}
