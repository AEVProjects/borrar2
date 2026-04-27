const fs = require('fs');

const cleanWf = JSON.parse(fs.readFileSync('migrations/calls/MSI Cold Calling - Laura Agent v4 CLEAN.json', 'utf8'));
const finalWf = JSON.parse(fs.readFileSync('migrations/calls/MSI_Laura_v8_FINAL.json', 'utf8'));

const pgNodes = {};
finalWf.nodes.forEach(n => {
    if (n.type === 'n8n-nodes-base.postgres') {
        pgNodes[n.name] = n;
    }
});

const nameMap = {
    "Leer Stats del Día": "Leer Stats del Día",
    "Leer Leads Pendientes": "Leer Leads Pendientes",
    "Marcar Lead En Proceso": "Marcar Lead En Proceso",
    "Actualizar Lead": "Actualizar Lead",
    "Registrar en Call_Log": "Registrar en Call_Log",
    "Actualizar Daily Stats": "Upsert Daily Stats",
    "Crear Daily Stats": "Upsert Daily Stats"
};

const newNodes = [];
cleanWf.nodes.forEach(node => {
    if (node.type === 'n8n-nodes-base.googleSheets') {
        const target = nameMap[node.name];
        if (target && pgNodes[target]) {
            const newNode = { ...pgNodes[target] };
            newNode.position = node.position;
            newNode.id = node.id;
            newNode.name = node.name;
            newNodes.push(newNode);
        } else {
            newNodes.push(node);
        }
    } else {
        newNodes.push(node);
    }
});

const centerPosition = cleanWf.nodes[9] ? cleanWf.nodes[9].position : [0, 0];

const apolloTool = {
  parameters: {
    name: "Add to Apollo Sequence",
    description: "Use this tool to add a lead to the Apollo sequence if they prefer an email follow-up or are hard to reach.",
    workflowId: "APOLLO_WORKFLOW_ID"
  },
  id: "tool-apollo-sequence",
  name: "Tool - Add Apollo Sequence",
  type: "@n8n/n8n-nodes-langchain.toolWorkflow",
  typeVersion: 1.1,
  position: [centerPosition[0] - 150, centerPosition[1] + 250]
};
newNodes.push(apolloTool);

cleanWf.nodes = newNodes;
cleanWf.name = "MSI Apollo Lead Qualifier Agent (Supabase)";

if (!cleanWf.connections["Tool - Add Apollo Sequence"]) {
    cleanWf.connections["Tool - Add Apollo Sequence"] = {
        main: [
            [
                {
                    node: "AI Agent Laura",
                    type: "main",
                    index: 1
                }
            ]
        ]
    };
}

fs.writeFileSync('MSI_Apollo_Agent_Supabase.json', JSON.stringify(cleanWf, null, 2), 'utf8');
console.log("File generated successfully!");