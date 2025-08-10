# Feature 008: Automatisation n8n

## Description
Intégration complète de n8n pour l'automatisation des processus métier, incluant la collecte de données, les notifications, et les workflows de validation.

## Objectifs
- Automatiser la collecte de données d'entreprises
- Créer des workflows de notification intelligents
- Implémenter des processus de validation automatique
- Développer des intégrations avec des services externes
- Optimiser les performances des workflows

## Tâches Techniques

### Backend (NestJS)

#### 1. Service n8n
```typescript
// src/modules/n8n/n8n.service.ts
@Injectable()
export class N8nService {
  private readonly n8nClient: N8nClient;

  async executeWorkflow(workflowId: string, data: any) {
    return await this.n8nClient.execute(workflowId, data);
  }

  async createWebhook(workflowId: string, endpoint: string) {
    return await this.n8nClient.createWebhook(workflowId, endpoint);
  }

  async getWorkflowStatus(executionId: string) {
    return await this.n8nClient.getExecution(executionId);
  }
}
```

#### 2. Contrôleurs Automation
```typescript
// src/modules/automation/automation.controller.ts
@Controller('automation')
export class AutomationController {
  @Post('trigger/:workflowId')
  async triggerWorkflow(
    @Param('workflowId') workflowId: string,
    @Body() data: any
  ) {
    return await this.n8nService.executeWorkflow(workflowId, data);
  }

  @Post('webhook/:endpoint')
  async handleWebhook(
    @Param('endpoint') endpoint: string,
    @Body() payload: any
  ) {
    return await this.automationService.processWebhook(endpoint, payload);
  }
}
```

#### 3. Modèles de Données
```typescript
// src/modules/automation/entities/workflow.entity.ts
export class Workflow {
  id: string;
  name: string;
  description: string;
  n8nWorkflowId: string;
  isActive: boolean;
  triggers: WorkflowTrigger[];
  executions: WorkflowExecution[];
  createdAt: Date;
  updatedAt: Date;
}

export class WorkflowExecution {
  id: string;
  workflowId: string;
  n8nExecutionId: string;
  status: 'running' | 'success' | 'error';
  input: any;
  output: any;
  error?: string;
  startedAt: Date;
  finishedAt?: Date;
}
```

### Frontend (Next.js)

#### 1. Pages Automation
```typescript
// app/dashboard/automation/page.tsx
export default function AutomationPage() {
  const { workflows, isLoading } = useWorkflows();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Automatisation</h1>
        <Button onClick={() => setShowCreateModal(true)}>
          Nouveau Workflow
        </Button>
      </div>
      
      <WorkflowList workflows={workflows} />
      <WorkflowExecutions />
    </div>
  );
}
```

#### 2. Composants Workflow
```typescript
// app/dashboard/automation/components/WorkflowBuilder.tsx
export function WorkflowBuilder({ workflow }: { workflow?: Workflow }) {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);

  return (
    <div className="h-screen">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
      >
        <Controls />
        <MiniMap />
        <Background />
      </ReactFlow>
    </div>
  );
}
```

#### 3. Hooks Automation
```typescript
// hooks/useWorkflows.ts
export function useWorkflows() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const executeWorkflow = async (workflowId: string, data: any) => {
    const response = await fetch(`/api/automation/trigger/${workflowId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  };

  return { workflows, isLoading, executeWorkflow };
}
```

## Configuration n8n

### 1. Docker Compose
```yaml
# docker/n8n.yml
version: '3.8'
services:
  n8n:
    image: n8nio/n8n:latest
    ports:
      - "5678:5678"
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=${N8N_PASSWORD}
      - WEBHOOK_URL=https://ecosyste.com/
    volumes:
      - n8n_data:/home/node/.n8n
    depends_on:
      - postgres
```

### 2. Workflows Prédéfinis
- Collecte automatique d'entreprises
- Notifications par email/SMS
- Validation de données
- Synchronisation avec APIs externes
- Rapports automatiques

## Tests

### Tests d'Intégration
```typescript
// tests/automation.e2e.spec.ts
describe('Automation E2E', () => {
  it('should execute workflow successfully', async () => {
    const response = await request(app)
      .post('/automation/trigger/test-workflow')
      .send({ data: 'test' })
      .expect(200);

    expect(response.body.status).toBe('success');
  });
});
```

## Dépendances
```json
{
  "dependencies": {
    "n8n-client": "^1.0.0",
    "reactflow": "^11.0.0",
    "@n8n/client-oauth2": "^1.0.0",
    "node-cron": "^3.0.0"
  }
}
```

## Critères d'Acceptation
- [ ] Interface de gestion des workflows
- [ ] Exécution automatique des workflows
- [ ] Monitoring des exécutions
- [ ] Gestion des erreurs et retry
- [ ] Webhooks fonctionnels
- [ ] Intégration avec l'API principale
- [ ] Documentation des workflows
- [ ] Tests automatisés

## Métriques de Succès
- Réduction de 80% du temps de collecte manuelle
- 99% de disponibilité des workflows
- Temps de réponse < 2s pour les triggers
- 0 perte de données dans les workflows

## Intégrations
- API ECOSYSTE
- Services de notification (Email, SMS)
- APIs externes (Google Maps, réseaux sociaux)
- Base de données PostgreSQL
- Redis pour le cache

## Durée Estimée
**12-15 jours**

## Notes Techniques
- Utiliser n8n en mode self-hosted
- Implémenter la haute disponibilité
- Configurer la surveillance des workflows
- Prévoir la scalabilité horizontale