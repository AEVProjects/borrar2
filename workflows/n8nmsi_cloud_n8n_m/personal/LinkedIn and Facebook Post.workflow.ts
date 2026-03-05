import { workflow, node, links } from '@n8n-as-code/transformer';

// <workflow-map>
// Workflow : LinkedIn and Facebook Post
// Nodes   : 0  |  Connections: 0
//
// NODE INDEX
// ──────────────────────────────────────────────────────────────────
// Property name                    Node type (short)         Flags
//
// ROUTING MAP
// ──────────────────────────────────────────────────────────────────
// </workflow-map>

// =====================================================================
// METADATA DU WORKFLOW
// =====================================================================

@workflow({
    id: 'QqMhh8yJwonXt0Yr',
    name: 'LinkedIn and Facebook Post',
    active: false,
    settings: { executionOrder: 'v1' },
})
export class LinkedinAndFacebookPostWorkflow {
    // =====================================================================
    // CONFIGURATION DES NOEUDS
    // =====================================================================

    // =====================================================================
    // ROUTAGE ET CONNEXIONS
    // =====================================================================

    @links()
    defineRouting() {
        // No connections defined
    }
}
