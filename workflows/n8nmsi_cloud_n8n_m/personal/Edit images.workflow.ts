import { workflow, node, links } from '@n8n-as-code/transformer';

// <workflow-map>
// Workflow : Edit images
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
    id: 'wpamBm4SLW1rN2Y6',
    name: 'Edit images',
    active: false,
    settings: { executionOrder: 'v1' },
})
export class EditImagesWorkflow {
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
