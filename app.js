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
                console.error('❌ Error al inicializar Supabase:', error);
                showToast('Error: Verifica tu clave de Supabase en config.example.js', 'error');
            }
        } else {
            console.error('❌ Error: Supabase CDN no cargó correctamente');
        }
    };
    script.onerror = () => {
        console.error('❌ Error al cargar Supabase desde CDN');
    };
    document.head.appendChild(script);
} else {
    console.warn('⚠️ Supabase no configurado. Actualiza config.example.js con tu clave de Supabase.');
    setTimeout(() => {
        showToast('⚠️ Configura tu clave de Supabase en config.example.js para ver los posts guardados', 'warning');
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

// Image Preview
imageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const isVideo = file.type.startsWith('video/');
            imagePreview.innerHTML = isVideo 
                ? `<video src="${e.target.result}" controls></video>`
                : `<img src="${e.target.result}" alt="Preview">`;
            imagePreview.classList.add('active');
        };
        reader.readAsDataURL(file);
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
        showToast('Por favor selecciona al menos una plataforma', 'error');
        return;
    }
    
    // Prepare data for n8n
    const data = {
        post_type: formData.get('post_type'),
        publish_linkedin: hasLinkedIn ? 'Yes' : 'No',
        publish_facebook: hasFacebook ? 'Yes' : 'No',
        publish_instagram: hasInstagram ? 'Yes' : 'No',
    };
    
    // Convert image to base64 if exists
    // n8n subirá a ImgBB y guardará la URL en la BD
    if (imageFile && imageFile.size > 0) {
        const base64 = await fileToBase64(imageFile);
        data.Image = {
            data: base64,
            mimeType: imageFile.type,
            fileName: imageFile.name
        };
    }
    
    try {
        const btn = e.target.querySelector('button[type="submit"]');
        btn.disabled = true;
        btn.textContent = 'Publicando...';
        
        console.log('📤 Enviando a n8n:', n8nPublishWebhook);
        console.log('📦 Datos:', data);
        
        const response = await fetch(n8nPublishWebhook, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            showToast('¡Publicación enviada exitosamente!', 'success');
            publishForm.reset();
            imagePreview.classList.remove('active');
            imagePreview.innerHTML = '';
        } else {
            throw new Error('Error en la publicación');
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('Error al publicar. Verifica la configuración del webhook.', 'error');
    } finally {
        const btn = e.target.querySelector('button[type="submit"]');
        btn.disabled = false;
        btn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
                <polyline points="16 6 12 2 8 6"></polyline>
                <line x1="12" y1="2" x2="12" y2="15"></line>
            </svg>
            Publicar en Redes
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
        
        const response = await fetch(n8nGenerateWebhook, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            showToast('Contenido generado exitosamente. Revisa la base de datos.', 'success');
            
            // Show a message to check the database
            generatedResults.style.display = 'block';
            document.getElementById('generated-copy').textContent = 
                'El contenido se está generando. Por favor, actualiza la lista de posts en unos momentos para ver el resultado.';
            document.getElementById('generated-image').innerHTML = 
                '<p style="color: var(--text-secondary);">La imagen aparecerá en la base de datos cuando se complete la generación.</p>';
            
            // Load posts after a delay
            setTimeout(() => loadPosts(), 3000);
        } else {
            throw new Error('Error en la generación');
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
                <h3>Configuración Requerida</h3>
                <p>Por favor configura Supabase en app.js para ver los posts guardados.</p>
            </div>
        `;
        return;
    }
    
    try {
        postsListEl.innerHTML = '<div class="loading">Cargando posts...</div>';
        
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
                    <h3>No hay posts</h3>
                    <p>Genera contenido nuevo para comenzar</p>
                </div>
            `;
            return;
        }
        
        postsListEl.innerHTML = data.map(post => renderPost(post)).join('');
        
        // Add event listeners to checkboxes
        document.querySelectorAll('.post-checkbox').forEach(cb => {
            cb.addEventListener('change', (e) => {
                const postId = e.target.dataset.postId;
                if (e.target.checked) {
                    selectedPosts.add(postId);
                    e.target.closest('.post-item').classList.add('selected');
                } else {
                    selectedPosts.delete(postId);
                    e.target.closest('.post-item').classList.remove('selected');
                }
            });
        });
        
    } catch (error) {
        console.error('Error loading posts:', error);
        postsListEl.innerHTML = `
            <div class="empty-state">
                <h3>Error al cargar</h3>
                <p>${error.message}</p>
            </div>
        `;
    }
}

// Render Post Item
function renderPost(post) {
    const date = new Date(post.created_at).toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    const statusClass = post.status === 'completed' ? 'completed' : 'pending';
    
    return `
        <div class="post-item" data-post-id="${post.id}">
            <div class="post-header">
                <div>
                    <input type="checkbox" class="post-checkbox" data-post-id="${post.id}">
                    <span class="post-meta">${date}</span>
                    ${post.post_type ? `<span class="post-meta"> • ${post.post_type}</span>` : ''}
                </div>
                <span class="post-status ${statusClass}">${post.status}</span>
            </div>
            
            ${post.post_copy ? `
                <div class="post-copy">${escapeHtml(post.post_copy)}</div>
            ` : ''}
            
            ${post.image_url ? `
                <div class="post-image">
                    <img src="${post.image_url}" alt="Post image">
                </div>
            ` : ''}
            
            <div class="post-actions">
                <button class="btn btn-small btn-publish" onclick="publishPost('${post.id}')">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
                        <polyline points="16 6 12 2 8 6"></polyline>
                        <line x1="12" y1="2" x2="12" y2="15"></line>
                    </svg>
                    Publicar
                </button>
            </div>
        </div>
    `;
}

// Publish Single Post
async function publishPost(postId) {
    if (!supabaseClient) {
        showToast('Supabase no está configurado', 'error');
        return;
    }
    
    try {
        const { data: post, error } = await supabaseClient
            .from('social_posts')
            .select('*')
            .eq('id', postId)
            .single();
        
        if (error) throw error;
        
        // Show platform selection modal (simplified - you can enhance this)
        const platforms = prompt('¿En qué plataformas quieres publicar?\nIngresa: linkedin, facebook, instagram (separadas por comas)');
        
        if (!platforms) return;
        
        const platformList = platforms.toLowerCase().split(',').map(p => p.trim());
        
        const publishData = {
            post_type: post.post_copy || post.topic,
            publish_linkedin: platformList.includes('linkedin') ? 'Yes' : 'No',
            publish_facebook: platformList.includes('facebook') ? 'Yes' : 'No',
            publish_instagram: platformList.includes('instagram') ? 'Yes' : 'No',
        };
        
        // Send the image URL from database directly to n8n
        // n8n will use this URL to publish on social media
        if (post.image_url) {
            publishData.image_url = post.image_url;
        }
        
        const response = await fetch(n8nPublishWebhook, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(publishData)
        });
        
        if (response.ok) {
            showToast('¡Post publicado exitosamente!', 'success');
        } else {
            throw new Error('Error en la publicación');
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('Error al publicar: ' + error.message, 'error');
    }
}

// Publish Multiple Selected Posts
async function publishSelectedPosts() {
    if (selectedPosts.size === 0) {
        showToast('Selecciona al menos un post', 'warning');
        return;
    }
    
    const platforms = prompt('¿En qué plataformas quieres publicar?\nIngresa: linkedin, facebook, instagram (separadas por comas)');
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
