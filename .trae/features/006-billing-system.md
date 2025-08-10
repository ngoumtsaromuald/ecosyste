# Feature 006: Système de Facturation

## Description
Implémentation d'un système de facturation automatisé pour gérer les abonnements, les factures et les paiements des entreprises utilisant la plateforme ECOSYSTE.

## Objectifs
- Automatiser la génération de factures
- Gérer les abonnements et renouvellements
- Intégrer les systèmes de paiement Mobile Money
- Fournir un historique de facturation
- Gérer les relances et notifications

## Tâches Techniques

### Backend (NestJS)

#### 1. Modèles de Données
```typescript
// models/billing.model.ts
export interface Invoice {
  id: string;
  businessId: string;
  subscriptionId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  dueDate: Date;
  paidAt?: Date;
  items: InvoiceItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Subscription {
  id: string;
  businessId: string;
  planId: string;
  status: 'active' | 'cancelled' | 'expired' | 'suspended';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface BillingPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: 'monthly' | 'yearly';
  features: string[];
  maxListings: number;
  isActive: boolean;
}
```

#### 2. Service de Facturation
```typescript
// services/billing.service.ts
@Injectable()
export class BillingService {
  async generateInvoice(subscriptionId: string): Promise<Invoice> {
    const subscription = await this.getSubscription(subscriptionId);
    const plan = await this.getBillingPlan(subscription.planId);
    
    return await this.invoiceRepository.create({
      businessId: subscription.businessId,
      subscriptionId,
      amount: plan.price,
      currency: plan.currency,
      status: 'pending',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 jours
      items: [{
        description: `Abonnement ${plan.name}`,
        amount: plan.price,
        quantity: 1
      }]
    });
  }

  async processPayment(invoiceId: string, paymentData: any): Promise<void> {
    const invoice = await this.getInvoice(invoiceId);
    
    // Intégration avec Mobile Money
    const paymentResult = await this.mobileMoneyService.processPayment({
      amount: invoice.amount,
      currency: invoice.currency,
      reference: invoice.id,
      ...paymentData
    });

    if (paymentResult.success) {
      await this.markInvoiceAsPaid(invoiceId);
      await this.extendSubscription(invoice.subscriptionId);
    }
  }

  @Cron('0 0 * * *') // Tous les jours à minuit
  async generateRecurringInvoices(): Promise<void> {
    const subscriptions = await this.getActiveSubscriptions();
    
    for (const subscription of subscriptions) {
      if (this.shouldGenerateInvoice(subscription)) {
        await this.generateInvoice(subscription.id);
      }
    }
  }
}
```

#### 3. Contrôleurs API
```typescript
// controllers/billing.controller.ts
@Controller('billing')
@UseGuards(JwtAuthGuard)
export class BillingController {
  @Get('invoices')
  async getInvoices(@Req() req: any, @Query() query: any) {
    return await this.billingService.getInvoicesByBusiness(
      req.user.businessId,
      query
    );
  }

  @Post('invoices/:id/pay')
  async payInvoice(@Param('id') id: string, @Body() paymentData: any) {
    return await this.billingService.processPayment(id, paymentData);
  }

  @Get('subscription')
  async getSubscription(@Req() req: any) {
    return await this.billingService.getSubscriptionByBusiness(
      req.user.businessId
    );
  }

  @Post('subscription/upgrade')
  async upgradeSubscription(@Req() req: any, @Body() data: any) {
    return await this.billingService.upgradeSubscription(
      req.user.businessId,
      data.planId
    );
  }
}
```

### Frontend (Next.js)

#### 1. Page de Facturation
```tsx
// app/dashboard/billing/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Invoice {
  id: string;
  amount: number;
  status: string;
  dueDate: string;
  createdAt: string;
}

export default function BillingPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBillingData();
  }, []);

  const fetchBillingData = async () => {
    try {
      const [invoicesRes, subscriptionRes] = await Promise.all([
        fetch('/api/billing/invoices'),
        fetch('/api/billing/subscription')
      ]);
      
      setInvoices(await invoicesRes.json());
      setSubscription(await subscriptionRes.json());
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePayInvoice = async (invoiceId: string) => {
    try {
      await fetch(`/api/billing/invoices/${invoiceId}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ method: 'mobile_money' })
      });
      
      await fetchBillingData();
    } catch (error) {
      console.error('Erreur lors du paiement:', error);
    }
  };

  if (loading) return <div>Chargement...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Facturation</h1>
      
      {/* Abonnement actuel */}
      <Card>
        <CardHeader>
          <CardTitle>Abonnement Actuel</CardTitle>
        </CardHeader>
        <CardContent>
          {subscription && (
            <div className="space-y-2">
              <p><strong>Plan:</strong> {subscription.plan.name}</p>
              <p><strong>Prix:</strong> {subscription.plan.price} FCFA/{subscription.plan.interval}</p>
              <p><strong>Statut:</strong> 
                <Badge variant={subscription.status === 'active' ? 'default' : 'destructive'}>
                  {subscription.status}
                </Badge>
              </p>
              <p><strong>Prochaine facturation:</strong> {new Date(subscription.currentPeriodEnd).toLocaleDateString()}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Factures */}
      <Card>
        <CardHeader>
          <CardTitle>Historique des Factures</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {invoices.map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between p-4 border rounded">
                <div>
                  <p className="font-medium">Facture #{invoice.id.slice(-8)}</p>
                  <p className="text-sm text-gray-600">
                    {invoice.amount} FCFA - Échéance: {new Date(invoice.dueDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={invoice.status === 'paid' ? 'default' : 'destructive'}>
                    {invoice.status}
                  </Badge>
                  {invoice.status === 'pending' && (
                    <Button onClick={() => handlePayInvoice(invoice.id)}>
                      Payer
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

#### 2. Composant de Sélection de Plan
```tsx
// components/PlanSelector.tsx
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

interface Plan {
  id: string;
  name: string;
  price: number;
  interval: string;
  features: string[];
  maxListings: number;
}

interface PlanSelectorProps {
  plans: Plan[];
  currentPlanId?: string;
  onSelectPlan: (planId: string) => void;
}

export default function PlanSelector({ plans, currentPlanId, onSelectPlan }: PlanSelectorProps) {
  const [selectedPlan, setSelectedPlan] = useState(currentPlanId);

  return (
    <div className="grid md:grid-cols-3 gap-6">
      {plans.map((plan) => (
        <Card key={plan.id} className={`relative ${
          selectedPlan === plan.id ? 'ring-2 ring-blue-500' : ''
        }`}>
          <CardHeader>
            <CardTitle className="text-center">{plan.name}</CardTitle>
            <div className="text-center">
              <span className="text-3xl font-bold">{plan.price}</span>
              <span className="text-gray-600"> FCFA/{plan.interval}</span>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 mb-6">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  {feature}
                </li>
              ))}
              <li className="flex items-center">
                <Check className="h-4 w-4 text-green-500 mr-2" />
                Jusqu'à {plan.maxListings} annonces
              </li>
            </ul>
            <Button 
              className="w-full" 
              variant={selectedPlan === plan.id ? 'default' : 'outline'}
              onClick={() => {
                setSelectedPlan(plan.id);
                onSelectPlan(plan.id);
              }}
            >
              {currentPlanId === plan.id ? 'Plan Actuel' : 'Choisir ce Plan'}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
```

## Structure de Base de Données

```sql
-- Table des plans de facturation
CREATE TABLE billing_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'XAF',
  interval VARCHAR(20) NOT NULL, -- 'monthly', 'yearly'
  features JSONB,
  max_listings INTEGER DEFAULT 10,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Table des abonnements
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id),
  plan_id UUID REFERENCES billing_plans(id),
  status VARCHAR(20) DEFAULT 'active',
  current_period_start TIMESTAMP NOT NULL,
  current_period_end TIMESTAMP NOT NULL,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Table des factures
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id),
  subscription_id UUID REFERENCES subscriptions(id),
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'XAF',
  status VARCHAR(20) DEFAULT 'pending',
  due_date TIMESTAMP NOT NULL,
  paid_at TIMESTAMP,
  items JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index pour les performances
CREATE INDEX idx_invoices_business_id ON invoices(business_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_subscriptions_business_id ON subscriptions(business_id);
```

## Système de Notifications

```typescript
// services/billing-notifications.service.ts
@Injectable()
export class BillingNotificationsService {
  @Cron('0 9 * * *') // Tous les jours à 9h
  async sendInvoiceReminders(): Promise<void> {
    const overdueInvoices = await this.getOverdueInvoices();
    const upcomingInvoices = await this.getUpcomingInvoices();

    // Relances pour factures en retard
    for (const invoice of overdueInvoices) {
      await this.emailService.sendOverdueInvoiceReminder(invoice);
      await this.smsService.sendOverdueInvoiceReminder(invoice);
    }

    // Rappels pour factures à venir
    for (const invoice of upcomingInvoices) {
      await this.emailService.sendUpcomingInvoiceReminder(invoice);
    }
  }

  async sendPaymentConfirmation(invoice: Invoice): Promise<void> {
    await this.emailService.sendPaymentConfirmation(invoice);
    await this.smsService.sendPaymentConfirmation(invoice);
  }
}
```

## Tests

```typescript
// tests/billing.service.spec.ts
describe('BillingService', () => {
  let service: BillingService;
  let mockRepository: jest.Mocked<Repository<Invoice>>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        BillingService,
        {
          provide: getRepositoryToken(Invoice),
          useValue: mockRepository
        }
      ]
    }).compile();

    service = module.get<BillingService>(BillingService);
  });

  it('should generate invoice correctly', async () => {
    const subscription = {
      id: 'sub-1',
      businessId: 'business-1',
      planId: 'plan-1'
    };

    const invoice = await service.generateInvoice(subscription.id);
    
    expect(invoice.businessId).toBe(subscription.businessId);
    expect(invoice.status).toBe('pending');
  });

  it('should process payment successfully', async () => {
    const invoiceId = 'invoice-1';
    const paymentData = { phone: '+237123456789' };

    await service.processPayment(invoiceId, paymentData);
    
    // Vérifier que la facture est marquée comme payée
    expect(mockRepository.update).toHaveBeenCalledWith(
      invoiceId,
      { status: 'paid', paidAt: expect.any(Date) }
    );
  });
});
```

## Dépendances

```json
{
  "dependencies": {
    "@nestjs/schedule": "^4.0.0",
    "node-cron": "^3.0.3",
    "decimal.js": "^10.4.3"
  }
}
```

## Critères d'Acceptation

- [ ] Génération automatique des factures selon les abonnements
- [ ] Intégration complète avec les systèmes de paiement Mobile Money
- [ ] Interface utilisateur intuitive pour la gestion des factures
- [ ] Système de notifications automatiques (email + SMS)
- [ ] Gestion des différents plans d'abonnement
- [ ] Historique complet des transactions
- [ ] Gestion des factures en retard et relances
- [ ] Tests unitaires et d'intégration complets
- [ ] Documentation API complète

## Métriques de Succès

- Taux de paiement automatique > 85%
- Temps de traitement des paiements < 30 secondes
- Réduction des factures en retard de 60%
- Satisfaction utilisateur > 4.5/5
- Disponibilité du système de facturation > 99.5%

## Intégrations

- **Mobile Money**: Orange Money, MTN Mobile Money
- **Email**: Service d'envoi d'emails transactionnels
- **SMS**: Service de notifications SMS
- **Comptabilité**: Export vers systèmes comptables

## Durée Estimée
**8-10 jours** (incluant développement, tests et documentation)

## Notes Techniques

- Utiliser des transactions de base de données pour les opérations de paiement
- Implémenter un système de retry pour les paiements échoués
- Sauvegarder tous les événements de facturation pour audit
- Chiffrer les données sensibles de paiement
- Implémenter des webhooks pour les notifications en temps réel