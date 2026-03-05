import { workflow, node, links } from '@n8n-as-code/transformer';

// <workflow-map>
// Workflow : MSI Profile Interactions Scraper
// Nodes   : 25  |  Connections: 27
//
// NODE INDEX
// ──────────────────────────────────────────────────────────────────
// Property name                    Node type (short)         Flags
// ScheduleTrigger                    scheduleTrigger
// ManualTrigger                      manualTrigger
// WebhookTrigger                     webhook
// WorkflowConfiguration              code
// LogScrapeStart                     postgres                   [onError→regular] [creds]
// MergeConfigLog                     code
// FetchLinkedinPosts                 httpRequest                [onError→regular] [creds]
// ExtractPosts                       code
// HasPosts                           if
// FetchPostReactions                 httpRequest                [onError→regular] [creds]
// FetchPostComments                  httpRequest                [onError→regular] [creds]
// ProcessReactions                   code
// ProcessComments                    code
// AggregateAllInteractions           code
// PrepareProfileUpsert               code
// UpsertProfilesToDb                 postgres                   [onError→regular] [creds]
// BuildProfileIdMap                  code
// PrepareInteractionsInsert          code
// HasInteractions                    if
// SaveInteractionsToDb               postgres                   [onError→regular] [creds]
// CountSaved                         code
// NoInteractions                     code
// UpdateScrapeLog                    postgres                   [onError→regular] [creds]
// NoPostsFound                       code
// FinalSummary                       code
//
// ROUTING MAP
// ──────────────────────────────────────────────────────────────────
// ScheduleTrigger
//    → WorkflowConfiguration
//      → LogScrapeStart
//        → MergeConfigLog
//          → FetchLinkedinPosts
//            → ExtractPosts
//              → HasPosts
//                → FetchPostReactions
//                  → ProcessReactions
//                    → AggregateAllInteractions
//                      → PrepareProfileUpsert
//                        → UpsertProfilesToDb
//                          → BuildProfileIdMap
//                            → PrepareInteractionsInsert
//                              → HasInteractions
//                                → SaveInteractionsToDb
//                                  → CountSaved
//                                    → UpdateScrapeLog
//                                      → FinalSummary
//                               .out(1) → NoInteractions
//                                  → UpdateScrapeLog (↩ loop)
//                → FetchPostComments
//                  → ProcessComments
//                    → AggregateAllInteractions (↩ loop)
//               .out(1) → NoPostsFound
//                  → UpdateScrapeLog (↩ loop)
// ManualTrigger
//    → WorkflowConfiguration (↩ loop)
// WebhookTrigger
//    → WorkflowConfiguration (↩ loop)
// </workflow-map>

// =====================================================================
// METADATA DU WORKFLOW
// =====================================================================

@workflow({
    id: 'O5dNJpChooGrNDNT',
    name: 'MSI Profile Interactions Scraper',
    active: true,
    settings: { executionOrder: 'v1' },
})
export class MsiProfileInteractionsScraperWorkflow {
    // =====================================================================
    // CONFIGURATION DES NOEUDS
    // =====================================================================

    @node({
        name: 'Schedule Trigger',
        type: 'n8n-nodes-base.scheduleTrigger',
        version: 1.2,
        position: [512, 416],
    })
    ScheduleTrigger = {
        rule: {
            interval: [
                {
                    field: 'hours',
                    hoursInterval: 12,
                },
            ],
        },
    };

    @node({
        name: 'Manual Trigger',
        type: 'n8n-nodes-base.manualTrigger',
        version: 1,
        position: [512, 224],
    })
    ManualTrigger = {};

    @node({
        name: 'Webhook Trigger',
        type: 'n8n-nodes-base.webhook',
        version: 2,
        position: [512, 608],
    })
    WebhookTrigger = {
        httpMethod: 'POST',
        path: 'msi-profile-scraper',
        responseMode: 'lastNode',
        options: {},
    };

    @node({
        name: 'Workflow Configuration',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [736, 416],
    })
    WorkflowConfiguration = {
        jsCode: "// ========================================\n// CONFIGURATION - MSI Profile Interactions Scraper\n// ========================================\n// INSTRUCCIONES:\n// 1. Reemplaza YOUR_LINKEDIN_PROFILE_URL con tu URL de LinkedIn\n// 2. Configura tu método de scraping preferido\n// 3. Para RapidAPI: crea cuenta en rapidapi.com y suscríbete a 'Fresh LinkedIn Profile Data'\n// 4. Para Phantombuster: configura tu API key y agent IDs\n\nconst runId = `scrape_${Date.now()}_${Math.random().toString(36).substring(7)}`;\n\nreturn [{\n  json: {\n    // === Tu perfil de LinkedIn ===\n    linkedinProfileUrl: 'https://www.linkedin.com/in/TU-PERFIL/',\n    linkedinCompanyUrl: 'https://www.linkedin.com/company/msi-technologies/',\n    \n    // === Método de scraping ===\n    // Opciones: 'rapidapi', 'phantombuster', 'apify'\n    scrapeMethod: 'rapidapi',\n    \n    // === RapidAPI Config (Fresh LinkedIn Profile Data) ===\n    rapidapi: {\n      host: 'fresh-linkedin-profile-data.p.rapidapi.com',\n      // La API key se configura en las credenciales de n8n (Header Auth)\n      maxPostsToScrape: 20,\n      includeReactions: true,\n      includeComments: true\n    },\n    \n    // === Phantombuster Config (alternativa) ===\n    phantombuster: {\n      apiKey: '',\n      postLikersAgentId: '',\n      postCommentersAgentId: '',\n      profileVisitorsAgentId: ''\n    },\n    \n    // === Scrape run metadata ===\n    runId: runId,\n    scrapeSource: 'rapidapi',\n    timestamp: new Date().toISOString()\n  }\n}];",
    };

    @node({
        name: 'Log Scrape Start',
        type: 'n8n-nodes-base.postgres',
        version: 2.5,
        position: [960, 416],
        credentials: { postgres: { id: 'WnTYs2zvPoE7hDJE', name: 'Postgres account' } },
        onError: 'continueRegularOutput',
    })
    LogScrapeStart = {
        operation: 'executeQuery',
        query: "=INSERT INTO scrape_runs (run_id, trigger_type, scrape_source, status, started_at)\nVALUES ('{{ $json.runId }}', 'scheduled', '{{ $json.scrapeSource }}', 'running', NOW())\nRETURNING id, run_id",
        options: {},
    };

    @node({
        name: 'Merge Config + Log',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [1184, 416],
    })
    MergeConfigLog = {
        jsCode: "// Pasar datos de configuración junto con el resultado del log\nconst config = $('Workflow Configuration').first().json;\nconst logResult = $input.first().json;\n\nreturn [{\n  json: {\n    ...config,\n    scrapeDbId: logResult.id || null\n  }\n}];",
    };

    @node({
        name: 'Fetch LinkedIn Posts',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.3,
        position: [1408, 416],
        credentials: { httpHeaderAuth: { id: 'ZUD8MiHh1QRjBAMi', name: 'Vertex AI API Key' } },
        onError: 'continueRegularOutput',
    })
    FetchLinkedinPosts = {
        url: '=https://{{ $json.rapidapi.host }}/get-profile-posts',
        authentication: 'genericCredentialType',
        genericAuthType: 'httpHeaderAuth',
        sendQuery: true,
        queryParameters: {
            parameters: [
                {
                    name: 'linkedin_url',
                    value: '={{ $json.linkedinProfileUrl }}',
                },
                {
                    name: 'type',
                    value: 'posts',
                },
            ],
        },
        sendHeaders: true,
        headerParameters: {
            parameters: [
                {
                    name: 'x-rapidapi-host',
                    value: '={{ $json.rapidapi.host }}',
                },
            ],
        },
        options: {
            timeout: 60000,
        },
    };

    @node({
        name: 'Extract Posts',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [1632, 416],
    })
    ExtractPosts = {
        jsCode: "// Extraer posts y preparar para scraping de reacciones\nconst input = $input.first().json;\nconst config = $('Merge Config + Log').first().json;\nconst maxPosts = config.rapidapi?.maxPostsToScrape || 20;\n\nlet posts = [];\n\n// Manejar diferentes formatos de respuesta de la API\nif (input.data && Array.isArray(input.data)) {\n  posts = input.data;\n} else if (input.posts && Array.isArray(input.posts)) {\n  posts = input.posts;\n} else if (Array.isArray(input)) {\n  posts = input;\n}\n\nconsole.log(`Found ${posts.length} posts, processing up to ${maxPosts}`);\n\nconst processedPosts = posts.slice(0, maxPosts).map((post, index) => {\n  // Extraer URN/ID del post para consultar reacciones\n  const postUrn = post.urn || post.post_urn || post.activity_id || post.id || '';\n  const postUrl = post.post_url || post.url || post.share_url || '';\n  const postText = (post.text || post.commentary || post.content || '').substring(0, 200);\n  \n  // Extraer reacciones directas si la API las incluye\n  const reactions = post.reactions || post.likes || [];\n  const comments = post.comments || [];\n  const totalLikes = post.num_likes || post.likes_count || post.total_reactions || reactions.length || 0;\n  const totalComments = post.num_comments || post.comments_count || comments.length || 0;\n  const totalShares = post.num_shares || post.shares_count || post.reposts || 0;\n  \n  return {\n    index: index + 1,\n    postUrn,\n    postUrl,\n    postText,\n    reactions,\n    comments,\n    totalLikes,\n    totalComments,\n    totalShares,\n    postedAt: post.posted_at || post.created_at || post.date || null\n  };\n});\n\n// Si no hay posts, devolver un item vacío para que el flujo continúe\nif (processedPosts.length === 0) {\n  return [{\n    json: {\n      posts: [],\n      totalPosts: 0,\n      runId: config.runId,\n      scrapeDbId: config.scrapeDbId,\n      scrapeSource: config.scrapeSource,\n      hasData: false\n    }\n  }];\n}\n\n// Devolver cada post como item separado para procesamiento paralelo\nreturn processedPosts.map(post => ({\n  json: {\n    ...post,\n    runId: config.runId,\n    scrapeDbId: config.scrapeDbId,\n    scrapeSource: config.scrapeSource,\n    linkedinProfileUrl: config.linkedinProfileUrl,\n    rapidapiHost: config.rapidapi?.host,\n    hasData: true\n  }\n}));",
    };

    @node({
        name: 'Has Posts?',
        type: 'n8n-nodes-base.if',
        version: 2.2,
        position: [1856, 416],
    })
    HasPosts = {
        conditions: {
            options: {
                caseSensitive: true,
                leftValue: '',
                typeValidation: 'strict',
            },
            conditions: [
                {
                    id: 'has-data',
                    leftValue: '={{ $json.hasData }}',
                    rightValue: true,
                    operator: {
                        type: 'boolean',
                        operation: 'equals',
                    },
                },
            ],
            combinator: 'and',
        },
        options: {},
    };

    @node({
        name: 'Fetch Post Reactions',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.3,
        position: [2080, 224],
        credentials: { httpHeaderAuth: { id: 'ZUD8MiHh1QRjBAMi', name: 'Vertex AI API Key' } },
        onError: 'continueRegularOutput',
    })
    FetchPostReactions = {
        url: '=https://{{ $json.rapidapiHost }}/get-post-reactions',
        authentication: 'genericCredentialType',
        genericAuthType: 'httpHeaderAuth',
        sendQuery: true,
        queryParameters: {
            parameters: [
                {
                    name: 'post_url',
                    value: '={{ $json.postUrl }}',
                },
                {
                    name: 'limit',
                    value: '50',
                },
            ],
        },
        sendHeaders: true,
        headerParameters: {
            parameters: [
                {
                    name: 'x-rapidapi-host',
                    value: '={{ $json.rapidapiHost }}',
                },
            ],
        },
        options: {
            timeout: 30000,
        },
    };

    @node({
        name: 'Fetch Post Comments',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.3,
        position: [2080, 416],
        credentials: { httpHeaderAuth: { id: 'ZUD8MiHh1QRjBAMi', name: 'Vertex AI API Key' } },
        onError: 'continueRegularOutput',
    })
    FetchPostComments = {
        url: '=https://{{ $json.rapidapiHost }}/get-post-comments',
        authentication: 'genericCredentialType',
        genericAuthType: 'httpHeaderAuth',
        sendQuery: true,
        queryParameters: {
            parameters: [
                {
                    name: 'post_url',
                    value: '={{ $json.postUrl }}',
                },
                {
                    name: 'limit',
                    value: '50',
                },
            ],
        },
        sendHeaders: true,
        headerParameters: {
            parameters: [
                {
                    name: 'x-rapidapi-host',
                    value: '={{ $json.rapidapiHost }}',
                },
            ],
        },
        options: {
            timeout: 30000,
        },
    };

    @node({
        name: 'Process Reactions',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [2304, 224],
    })
    ProcessReactions = {
        jsCode: "// Procesar reacciones de un post\nconst input = $input.first().json;\nconst postData = $('Extract Posts').first().json;\n\nlet reactors = [];\n\n// Extraer reactores según formato de respuesta\nconst data = input.data || input.reactions || input.results || [];\nconst reactionList = Array.isArray(data) ? data : [];\n\nfor (const reactor of reactionList) {\n  reactors.push({\n    full_name: reactor.full_name || reactor.name || `${reactor.first_name || ''} ${reactor.last_name || ''}`.trim(),\n    first_name: reactor.first_name || '',\n    last_name: reactor.last_name || '',\n    headline: reactor.headline || reactor.title || '',\n    company: reactor.company || reactor.current_company || '',\n    linkedin_url: reactor.linkedin_url || reactor.profile_url || reactor.url || '',\n    linkedin_id: reactor.linkedin_id || reactor.member_id || '',\n    avatar_url: reactor.profile_picture || reactor.avatar || reactor.image_url || '',\n    location: reactor.location || '',\n    connection_degree: reactor.degree || reactor.connection_degree || null,\n    reaction_type: reactor.reaction_type || reactor.type || 'LIKE',\n    interaction_type: 'reaction'\n  });\n}\n\nconsole.log(`Post ${postData.index}: Found ${reactors.length} reactions`);\n\nreturn [{\n  json: {\n    postIndex: postData.index,\n    postUrl: postData.postUrl,\n    postText: postData.postText,\n    reactors: reactors,\n    runId: postData.runId,\n    scrapeDbId: postData.scrapeDbId,\n    scrapeSource: postData.scrapeSource\n  }\n}];",
    };

    @node({
        name: 'Process Comments',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [2304, 416],
    })
    ProcessComments = {
        jsCode: "// Procesar comentarios de un post\nconst input = $input.first().json;\nconst postData = $('Extract Posts').first().json;\n\nlet commenters = [];\n\n// Extraer comentaristas según formato de respuesta\nconst data = input.data || input.comments || input.results || [];\nconst commentList = Array.isArray(data) ? data : [];\n\nfor (const comment of commentList) {\n  const author = comment.author || comment.commenter || comment;\n  commenters.push({\n    full_name: author.full_name || author.name || `${author.first_name || ''} ${author.last_name || ''}`.trim(),\n    first_name: author.first_name || '',\n    last_name: author.last_name || '',\n    headline: author.headline || author.title || '',\n    company: author.company || author.current_company || '',\n    linkedin_url: author.linkedin_url || author.profile_url || author.url || '',\n    linkedin_id: author.linkedin_id || author.member_id || '',\n    avatar_url: author.profile_picture || author.avatar || author.image_url || '',\n    location: author.location || '',\n    connection_degree: author.degree || author.connection_degree || null,\n    comment_text: comment.text || comment.comment || comment.content || '',\n    comment_url: comment.comment_url || comment.url || '',\n    interaction_type: 'comment'\n  });\n}\n\nconsole.log(`Post ${postData.index}: Found ${commenters.length} comments`);\n\nreturn [{\n  json: {\n    postIndex: postData.index,\n    postUrl: postData.postUrl,\n    postText: postData.postText,\n    commenters: commenters,\n    runId: postData.runId,\n    scrapeDbId: postData.scrapeDbId,\n    scrapeSource: postData.scrapeSource\n  }\n}];",
    };

    @node({
        name: 'Aggregate All Interactions',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [2528, 320],
    })
    AggregateAllInteractions = {
        jsCode: "// Agregar todas las interacciones de todos los posts\nconst reactionItems = $('Process Reactions').all();\nconst commentItems = $('Process Comments').all();\n\nconst allInteractions = [];\nconst profileMap = new Map(); // Deduplicate by linkedin_url\n\nlet runId = '';\nlet scrapeDbId = '';\nlet scrapeSource = '';\n\n// Procesar reacciones\nfor (const item of reactionItems) {\n  const data = item.json;\n  runId = data.runId || runId;\n  scrapeDbId = data.scrapeDbId || scrapeDbId;\n  scrapeSource = data.scrapeSource || scrapeSource;\n  \n  for (const reactor of (data.reactors || [])) {\n    const key = reactor.linkedin_url || reactor.full_name;\n    if (!key) continue;\n    \n    // Agregar/actualizar perfil\n    if (!profileMap.has(key)) {\n      profileMap.set(key, {\n        full_name: reactor.full_name,\n        first_name: reactor.first_name,\n        last_name: reactor.last_name,\n        headline: reactor.headline,\n        company: reactor.company,\n        linkedin_url: reactor.linkedin_url,\n        linkedin_id: reactor.linkedin_id,\n        avatar_url: reactor.avatar_url,\n        location: reactor.location,\n        connection_degree: reactor.connection_degree\n      });\n    }\n    \n    allInteractions.push({\n      profile_key: key,\n      interaction_type: 'reaction',\n      reaction_type: reactor.reaction_type,\n      post_url: data.postUrl,\n      post_content_preview: data.postText,\n      comment_text: null,\n      comment_url: null\n    });\n  }\n}\n\n// Procesar comentarios\nfor (const item of commentItems) {\n  const data = item.json;\n  runId = data.runId || runId;\n  \n  for (const commenter of (data.commenters || [])) {\n    const key = commenter.linkedin_url || commenter.full_name;\n    if (!key) continue;\n    \n    if (!profileMap.has(key)) {\n      profileMap.set(key, {\n        full_name: commenter.full_name,\n        first_name: commenter.first_name,\n        last_name: commenter.last_name,\n        headline: commenter.headline,\n        company: commenter.company,\n        linkedin_url: commenter.linkedin_url,\n        linkedin_id: commenter.linkedin_id,\n        avatar_url: commenter.avatar_url,\n        location: commenter.location,\n        connection_degree: commenter.connection_degree\n      });\n    }\n    \n    allInteractions.push({\n      profile_key: key,\n      interaction_type: 'comment',\n      reaction_type: null,\n      post_url: data.postUrl,\n      post_content_preview: data.postText,\n      comment_text: commenter.comment_text,\n      comment_url: commenter.comment_url\n    });\n  }\n}\n\nconsole.log(`Total unique profiles: ${profileMap.size}`);\nconsole.log(`Total interactions: ${allInteractions.length}`);\n\nreturn [{\n  json: {\n    profiles: Array.from(profileMap.entries()).map(([key, profile]) => ({ key, ...profile })),\n    interactions: allInteractions,\n    totalProfiles: profileMap.size,\n    totalInteractions: allInteractions.length,\n    runId,\n    scrapeDbId,\n    scrapeSource\n  }\n}];",
    };

    @node({
        name: 'Prepare Profile Upsert',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [2752, 320],
    })
    PrepareProfileUpsert = {
        jsCode: "// UPSERT perfiles: insertar nuevos o actualizar existentes\nconst data = $input.first().json;\nconst profiles = data.profiles || [];\n\nif (profiles.length === 0) {\n  return [{ json: { profileIdMap: {}, newProfiles: 0, updatedProfiles: 0 } }];\n}\n\n// Construir query UPSERT masivo\nconst values = profiles.map((p, i) => {\n  const esc = (s) => (s || '').replace(/'/g, \"''\").substring(0, 500);\n  const deg = p.connection_degree ? parseInt(p.connection_degree) : 'NULL';\n  return `(\n    '${esc(p.linkedin_url)}',\n    '${esc(p.linkedin_id)}',\n    '${esc(p.full_name)}',\n    '${esc(p.first_name)}',\n    '${esc(p.last_name)}',\n    '${esc(p.headline)}',\n    '${esc(p.company)}',\n    '${esc(p.location)}',\n    '${esc(p.avatar_url)}',\n    ${deg}\n  )`;\n}).join(',\\n');\n\nconst query = `\nINSERT INTO scraped_profiles (\n  linkedin_url, linkedin_id, full_name, first_name, last_name,\n  headline, company, location, avatar_url, connection_degree\n)\nVALUES ${values}\nON CONFLICT (linkedin_url) DO UPDATE SET\n  full_name = COALESCE(NULLIF(EXCLUDED.full_name, ''), scraped_profiles.full_name),\n  headline = COALESCE(NULLIF(EXCLUDED.headline, ''), scraped_profiles.headline),\n  company = COALESCE(NULLIF(EXCLUDED.company, ''), scraped_profiles.company),\n  avatar_url = COALESCE(NULLIF(EXCLUDED.avatar_url, ''), scraped_profiles.avatar_url),\n  location = COALESCE(NULLIF(EXCLUDED.location, ''), scraped_profiles.location),\n  connection_degree = COALESCE(EXCLUDED.connection_degree, scraped_profiles.connection_degree),\n  last_interaction_at = NOW(),\n  updated_at = NOW()\nRETURNING id, linkedin_url, full_name,\n  (xmax = 0) AS is_new\n`;\n\nreturn [{\n  json: {\n    query,\n    interactions: data.interactions,\n    totalProfiles: data.totalProfiles,\n    totalInteractions: data.totalInteractions,\n    runId: data.runId,\n    scrapeDbId: data.scrapeDbId,\n    scrapeSource: data.scrapeSource\n  }\n}];",
    };

    @node({
        name: 'Upsert Profiles to DB',
        type: 'n8n-nodes-base.postgres',
        version: 2.5,
        position: [2976, 320],
        credentials: { postgres: { id: 'WnTYs2zvPoE7hDJE', name: 'Postgres account' } },
        onError: 'continueRegularOutput',
    })
    UpsertProfilesToDb = {
        operation: 'executeQuery',
        query: '={{ $json.query }}',
        options: {},
    };

    @node({
        name: 'Build Profile ID Map',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [3200, 320],
    })
    BuildProfileIdMap = {
        jsCode: "// Crear mapa de linkedin_url -> profile_id desde el resultado del upsert\nconst upsertResults = $input.all();\nconst prevData = $('Prepare Profile Upsert').first().json;\n\nconst profileIdMap = {};\nlet newProfiles = 0;\nlet updatedProfiles = 0;\n\nfor (const item of upsertResults) {\n  const row = item.json;\n  if (row.linkedin_url) {\n    profileIdMap[row.linkedin_url] = row.id;\n    if (row.is_new) newProfiles++;\n    else updatedProfiles++;\n  }\n}\n\n// También mapear por full_name como fallback\nfor (const item of upsertResults) {\n  const row = item.json;\n  if (row.full_name && !profileIdMap[row.full_name]) {\n    profileIdMap[row.full_name] = row.id;\n  }\n}\n\nconsole.log(`Profile upsert complete: ${newProfiles} new, ${updatedProfiles} updated`);\nconsole.log(`Profile ID map has ${Object.keys(profileIdMap).length} entries`);\n\nreturn [{\n  json: {\n    profileIdMap,\n    newProfiles,\n    updatedProfiles,\n    interactions: prevData.interactions,\n    totalInteractions: prevData.totalInteractions,\n    runId: prevData.runId,\n    scrapeDbId: prevData.scrapeDbId,\n    scrapeSource: prevData.scrapeSource\n  }\n}];",
    };

    @node({
        name: 'Prepare Interactions Insert',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [3424, 320],
    })
    PrepareInteractionsInsert = {
        jsCode: "// Preparar INSERT masivo de interacciones\nconst data = $input.first().json;\nconst profileIdMap = data.profileIdMap || {};\nconst interactions = data.interactions || [];\n\nif (interactions.length === 0) {\n  return [{\n    json: {\n      query: null,\n      interactionsToSave: 0,\n      newProfiles: data.newProfiles,\n      updatedProfiles: data.updatedProfiles,\n      runId: data.runId,\n      scrapeDbId: data.scrapeDbId\n    }\n  }];\n}\n\nconst esc = (s) => (s || '').replace(/'/g, \"''\").substring(0, 1000);\n\nconst validInteractions = interactions.filter(i => {\n  const profileId = profileIdMap[i.profile_key];\n  return !!profileId;\n});\n\nif (validInteractions.length === 0) {\n  return [{\n    json: {\n      query: null,\n      interactionsToSave: 0,\n      newProfiles: data.newProfiles,\n      updatedProfiles: data.updatedProfiles,\n      runId: data.runId,\n      scrapeDbId: data.scrapeDbId\n    }\n  }];\n}\n\nconst values = validInteractions.map(i => {\n  const profileId = profileIdMap[i.profile_key];\n  const reactionType = i.reaction_type ? `'${esc(i.reaction_type)}'` : 'NULL';\n  const commentText = i.comment_text ? `'${esc(i.comment_text)}'` : 'NULL';\n  const commentUrl = i.comment_url ? `'${esc(i.comment_url)}'` : 'NULL';\n  const postUrl = i.post_url ? `'${esc(i.post_url)}'` : 'NULL';\n  const postPreview = i.post_content_preview ? `'${esc(i.post_content_preview)}'` : 'NULL';\n  const interactionType = i.interaction_type === 'reaction' ? 'reaction' : i.interaction_type;\n  \n  return `(\n    '${profileId}',\n    '${interactionType}',\n    ${reactionType},\n    ${postUrl},\n    ${postPreview},\n    ${commentText},\n    ${commentUrl},\n    '${esc(data.runId)}',\n    '${data.scrapeSource || 'rapidapi'}',\n    NOW()\n  )`;\n}).join(',\\n');\n\nconst query = `\nINSERT INTO profile_interactions (\n  profile_id, interaction_type, reaction_type,\n  post_url, post_content_preview,\n  comment_text, comment_url,\n  scrape_run_id, scraped_from, interaction_date\n)\nVALUES ${values}\nON CONFLICT DO NOTHING\nRETURNING id\n`;\n\nconsole.log(`Preparing to insert ${validInteractions.length} interactions`);\n\nreturn [{\n  json: {\n    query,\n    interactionsToSave: validInteractions.length,\n    newProfiles: data.newProfiles,\n    updatedProfiles: data.updatedProfiles,\n    runId: data.runId,\n    scrapeDbId: data.scrapeDbId\n  }\n}];",
    };

    @node({
        name: 'Has Interactions?',
        type: 'n8n-nodes-base.if',
        version: 2.2,
        position: [3648, 320],
    })
    HasInteractions = {
        conditions: {
            options: {
                caseSensitive: true,
                leftValue: '',
                typeValidation: 'strict',
            },
            conditions: [
                {
                    id: 'has-query',
                    leftValue: '={{ $json.query }}',
                    rightValue: '',
                    operator: {
                        type: 'string',
                        operation: 'notEmpty',
                    },
                },
            ],
            combinator: 'and',
        },
        options: {},
    };

    @node({
        name: 'Save Interactions to DB',
        type: 'n8n-nodes-base.postgres',
        version: 2.5,
        position: [3872, 224],
        credentials: { postgres: { id: 'WnTYs2zvPoE7hDJE', name: 'Postgres account' } },
        onError: 'continueRegularOutput',
    })
    SaveInteractionsToDb = {
        operation: 'executeQuery',
        query: '={{ $json.query }}',
        options: {},
    };

    @node({
        name: 'Count Saved',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [4096, 224],
    })
    CountSaved = {
        jsCode: "// Contar interacciones guardadas\nconst insertResults = $input.all();\nconst prevData = $('Prepare Interactions Insert').first().json;\n\nconst savedCount = insertResults.length;\n\nconsole.log(`Saved ${savedCount} interactions to DB`);\n\nreturn [{\n  json: {\n    interactionsSaved: savedCount,\n    interactionsAttempted: prevData.interactionsToSave,\n    newProfiles: prevData.newProfiles,\n    updatedProfiles: prevData.updatedProfiles,\n    runId: prevData.runId,\n    scrapeDbId: prevData.scrapeDbId\n  }\n}];",
    };

    @node({
        name: 'No Interactions',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [4096, 416],
    })
    NoInteractions = {
        jsCode: "// No interactions to save path\nconst prevData = $('Prepare Interactions Insert').first().json;\n\nreturn [{\n  json: {\n    interactionsSaved: 0,\n    interactionsAttempted: 0,\n    newProfiles: prevData.newProfiles,\n    updatedProfiles: prevData.updatedProfiles,\n    runId: prevData.runId,\n    scrapeDbId: prevData.scrapeDbId\n  }\n}];",
    };

    @node({
        name: 'Update Scrape Log',
        type: 'n8n-nodes-base.postgres',
        version: 2.5,
        position: [4320, 416],
        credentials: { postgres: { id: 'WnTYs2zvPoE7hDJE', name: 'Postgres account' } },
        onError: 'continueRegularOutput',
    })
    UpdateScrapeLog = {
        operation: 'executeQuery',
        query: "=UPDATE scrape_runs SET\n  status = 'completed',\n  profiles_found = {{ $json.newProfiles + $json.updatedProfiles }},\n  new_profiles = {{ $json.newProfiles }},\n  interactions_saved = {{ $json.interactionsSaved }},\n  completed_at = NOW(),\n  duration_seconds = EXTRACT(EPOCH FROM (NOW() - started_at))::integer\nWHERE run_id = '{{ $json.runId }}'\nRETURNING *",
        options: {},
    };

    @node({
        name: 'No Posts Found',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [4096, 608],
    })
    NoPostsFound = {
        jsCode: "// No data path - update log as completed with 0 results\nconst config = $('Merge Config + Log').first().json;\n\nreturn [{\n  json: {\n    interactionsSaved: 0,\n    interactionsAttempted: 0,\n    newProfiles: 0,\n    updatedProfiles: 0,\n    runId: config.runId,\n    scrapeDbId: config.scrapeDbId,\n    message: 'No posts found to scrape'\n  }\n}];",
    };

    @node({
        name: 'Final Summary',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [4544, 416],
    })
    FinalSummary = {
        jsCode: "// Final summary\nconst logResult = $input.first().json;\nconst prevItems = $('Count Saved').all();\nconst noInteractionItems = $('No Interactions').all();\n\n// Get data from whichever path was taken\nlet stats;\nif (prevItems.length > 0) {\n  stats = prevItems[0].json;\n} else if (noInteractionItems.length > 0) {\n  stats = noInteractionItems[0].json;\n} else {\n  stats = { newProfiles: 0, updatedProfiles: 0, interactionsSaved: 0 };\n}\n\nreturn [{\n  json: {\n    success: true,\n    message: 'Profile interactions scrape completed',\n    stats: {\n      profiles_found: (stats.newProfiles || 0) + (stats.updatedProfiles || 0),\n      new_profiles: stats.newProfiles || 0,\n      updated_profiles: stats.updatedProfiles || 0,\n      interactions_saved: stats.interactionsSaved || 0,\n      duration_seconds: logResult.duration_seconds || 0\n    },\n    run_id: stats.runId || logResult.run_id,\n    timestamp: new Date().toISOString()\n  }\n}];",
    };

    // =====================================================================
    // ROUTAGE ET CONNEXIONS
    // =====================================================================

    @links()
    defineRouting() {
        this.ScheduleTrigger.out(0).to(this.WorkflowConfiguration.in(0));
        this.ManualTrigger.out(0).to(this.WorkflowConfiguration.in(0));
        this.WebhookTrigger.out(0).to(this.WorkflowConfiguration.in(0));
        this.WorkflowConfiguration.out(0).to(this.LogScrapeStart.in(0));
        this.LogScrapeStart.out(0).to(this.MergeConfigLog.in(0));
        this.MergeConfigLog.out(0).to(this.FetchLinkedinPosts.in(0));
        this.FetchLinkedinPosts.out(0).to(this.ExtractPosts.in(0));
        this.ExtractPosts.out(0).to(this.HasPosts.in(0));
        this.HasPosts.out(0).to(this.FetchPostReactions.in(0));
        this.HasPosts.out(0).to(this.FetchPostComments.in(0));
        this.HasPosts.out(1).to(this.NoPostsFound.in(0));
        this.FetchPostReactions.out(0).to(this.ProcessReactions.in(0));
        this.FetchPostComments.out(0).to(this.ProcessComments.in(0));
        this.ProcessReactions.out(0).to(this.AggregateAllInteractions.in(0));
        this.ProcessComments.out(0).to(this.AggregateAllInteractions.in(0));
        this.AggregateAllInteractions.out(0).to(this.PrepareProfileUpsert.in(0));
        this.PrepareProfileUpsert.out(0).to(this.UpsertProfilesToDb.in(0));
        this.UpsertProfilesToDb.out(0).to(this.BuildProfileIdMap.in(0));
        this.BuildProfileIdMap.out(0).to(this.PrepareInteractionsInsert.in(0));
        this.PrepareInteractionsInsert.out(0).to(this.HasInteractions.in(0));
        this.HasInteractions.out(0).to(this.SaveInteractionsToDb.in(0));
        this.HasInteractions.out(1).to(this.NoInteractions.in(0));
        this.SaveInteractionsToDb.out(0).to(this.CountSaved.in(0));
        this.CountSaved.out(0).to(this.UpdateScrapeLog.in(0));
        this.NoInteractions.out(0).to(this.UpdateScrapeLog.in(0));
        this.NoPostsFound.out(0).to(this.UpdateScrapeLog.in(0));
        this.UpdateScrapeLog.out(0).to(this.FinalSummary.in(0));
    }
}
