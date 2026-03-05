import { workflow, node, links } from '@n8n-as-code/transformer';

// <workflow-map>
// Workflow : Scheduled Teams Database Content Messenger with Response Handler
// Nodes   : 9  |  Connections: 4
//
// NODE INDEX
// ──────────────────────────────────────────────────────────────────
// Property name                    Node type (short)         Flags
// ScheduleTrigger                    scheduleTrigger
// WorkflowConfiguration              set
// GetDatabaseContent                 postgres                   [creds]
// SendTeamsMessage                   microsoftTeams
// TeamsResponseTrigger               microsoftTeamsTrigger
// ResponseHandlerAgent               agent                      [AI]
// OpenaiChatModel                    lmChatOpenAi               [creds]
// SimpleMemory                       memoryBufferWindow
// MicrosoftTeamsTool                 microsoftTeamsTool
//
// ROUTING MAP
// ──────────────────────────────────────────────────────────────────
// ScheduleTrigger
//    → WorkflowConfiguration
//      → GetDatabaseContent
//        → SendTeamsMessage
// TeamsResponseTrigger
//    → ResponseHandlerAgent
//
// AI CONNECTIONS
// OpenaiChatModel.uses({ ai_languageModel: ResponseHandlerAgent })
// SimpleMemory.uses({ ai_memory: ResponseHandlerAgent })
// MicrosoftTeamsTool.uses({ ai_tool: [MicrosoftTeamsTool] })
// </workflow-map>

// =====================================================================
// METADATA DU WORKFLOW
// =====================================================================

@workflow({
    id: 'dWWKP5AuPMSEKBGF',
    name: 'Scheduled Teams Database Content Messenger with Response Handler',
    active: false,
    settings: { executionOrder: 'v1' },
})
export class ScheduledTeamsDatabaseContentMessengerWithResponseHandlerWorkflow {
    // =====================================================================
    // CONFIGURATION DES NOEUDS
    // =====================================================================

    @node({
        name: 'Schedule Trigger',
        type: 'n8n-nodes-base.scheduleTrigger',
        version: 1.3,
        position: [11104, -3680],
    })
    ScheduleTrigger = {
        rule: {
            interval: [
                {
                    triggerAtHour: 9,
                },
            ],
        },
    };

    @node({
        name: 'Workflow Configuration',
        type: 'n8n-nodes-base.set',
        version: 3.4,
        position: [11328, -3680],
    })
    WorkflowConfiguration = {
        assignments: {
            assignments: [
                {
                    id: 'id-1',
                    name: 'teamsChannelId',
                    value: '<__PLACEHOLDER_VALUE__Teams Channel ID__>',
                    type: 'string',
                },
                {
                    id: 'id-2',
                    name: 'teamId',
                    value: '<__PLACEHOLDER_VALUE__Teams Team ID__>',
                    type: 'string',
                },
            ],
        },
        includeOtherFields: true,
        options: {},
    };

    @node({
        name: 'Get Database Content',
        type: 'n8n-nodes-base.postgres',
        version: 2.6,
        position: [11552, -3680],
        credentials: { postgres: { id: 'WnTYs2zvPoE7hDJE', name: 'Postgres account' } },
    })
    GetDatabaseContent = {
        operation: 'executeQuery',
        query: '<__PLACEHOLDER_VALUE__SQL query to fetch content from database__>',
        options: {},
    };

    @node({
        name: 'Send Teams Message',
        type: 'n8n-nodes-base.microsoftTeams',
        version: 2,
        position: [11776, -3680],
    })
    SendTeamsMessage = {
        resource: 'channelMessage',
        teamId: {
            __rl: true,
            mode: 'id',
            value: "={{ $('Workflow Configuration').first().json.teamId }}",
        },
        channelId: {
            __rl: true,
            mode: 'id',
            value: "={{ $('Workflow Configuration').first().json.teamsChannelId }}",
        },
        message: "={{ $json.content || 'Database content: ' + JSON.stringify($json) }}",
        options: {},
    };

    @node({
        name: 'Teams Response Trigger',
        type: 'n8n-nodes-base.microsoftTeamsTrigger',
        version: 1,
        position: [11104, -3352],
    })
    TeamsResponseTrigger = {
        teamId: {
            __rl: true,
            mode: 'list',
            value: '',
        },
        channelId: {
            __rl: true,
            mode: 'list',
            value: '',
        },
    };

    @node({
        name: 'Response Handler Agent',
        type: '@n8n/n8n-nodes-langchain.agent',
        version: 3,
        position: [11384, -3352],
    })
    ResponseHandlerAgent = {
        promptType: 'define',
        text: '={{ $json.body.content }}',
        options: {
            systemMessage:
                'You are a helpful assistant that responds to messages in Microsoft Teams. When a user sends a message, analyze it and provide a helpful response. Use the Microsoft Teams Tool to send your response back to the user in the same channel where the message was received.',
        },
    };

    @node({
        name: 'OpenAI Chat Model',
        type: '@n8n/n8n-nodes-langchain.lmChatOpenAi',
        version: 1.3,
        position: [11328, -3128],
        credentials: { openAiApi: { id: 'M0WZXu7GNyjtA7Xx', name: 'n8n free OpenAI API credits' } },
    })
    OpenaiChatModel = {
        model: {
            __rl: true,
            mode: 'list',
            value: 'gpt-4.1-mini',
        },
        builtInTools: {},
        options: {},
    };

    @node({
        name: 'Simple Memory',
        type: '@n8n/n8n-nodes-langchain.memoryBufferWindow',
        version: 1.3,
        position: [11456, -3128],
    })
    SimpleMemory = {};

    @node({
        name: 'Microsoft Teams Tool',
        type: 'n8n-nodes-base.microsoftTeamsTool',
        version: 2,
        position: [11584, -3128],
    })
    MicrosoftTeamsTool = {
        resource: 'channelMessage',
        teamId: {
            __rl: true,
            mode: 'id',
            value: "={{ $fromAI('teamId', 'The Teams team ID where to send the message', 'string') }}",
        },
        channelId: {
            __rl: true,
            mode: 'id',
            value: "={{ $fromAI('channelId', 'The Teams channel ID where to send the message', 'string') }}",
        },
        message: "={{ $fromAI('message', 'The message content to send', 'string') }}",
        options: {},
    };

    // =====================================================================
    // ROUTAGE ET CONNEXIONS
    // =====================================================================

    @links()
    defineRouting() {
        this.ScheduleTrigger.out(0).to(this.WorkflowConfiguration.in(0));
        this.WorkflowConfiguration.out(0).to(this.GetDatabaseContent.in(0));
        this.GetDatabaseContent.out(0).to(this.SendTeamsMessage.in(0));
        this.TeamsResponseTrigger.out(0).to(this.ResponseHandlerAgent.in(0));

        this.ResponseHandlerAgent.uses({
            ai_languageModel: this.OpenaiChatModel.output,
            ai_memory: this.SimpleMemory.output,
            ai_tool: [this.MicrosoftTeamsTool.output],
        });
    }
}
