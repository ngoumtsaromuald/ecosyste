# Feature 004: Intégration Mobile Money

## 📋 Description

Intégration complète des systèmes de paiement Mobile Money (Orange Money, MTN Mobile Money) pour permettre aux entreprises locales de recevoir des paiements et aux utilisateurs de payer les services premium.

## 🎯 Objectifs

- Intégration Orange Money et MTN Mobile Money
- Système de paiement sécurisé pour les abonnements
- Gestion des transactions et réconciliation
- Interface utilisateur intuitive pour les paiements
- Système de notifications et confirmations

## 🔧 Tâches Techniques

### Backend (NestJS)

#### 1. Service Mobile Money
- [ ] Intégration API Orange Money
- [ ] Intégration API MTN Mobile Money
- [ ] Service de gestion des transactions
- [ ] Webhook handlers pour les confirmations
- [ ] Système de réconciliation automatique

#### 2. Gestion des paiements
- [ ] Modèles de données pour les transactions
- [ ] Service de facturation automatique
- [ ] Gestion des échecs de paiement
- [ ] Système de retry automatique
- [ ] Logs et audit trail

#### 3. Sécurité des paiements
- [ ] Chiffrement des données sensibles
- [ ] Validation des signatures webhook
- [ ] Protection contre la fraude
- [ ] Conformité PCI DSS
- [ ] Tokenisation des informations de paiement

### Frontend (Next.js)

#### 1. Interface de paiement
- [ ] Composant de sélection du mode de paiement
- [ ] Formulaire de paiement Mobile Money
- [ ] Interface de confirmation de transaction
- [ ] Historique des paiements
- [ ] Gestion des erreurs de paiement

#### 2. Dashboard entreprise
- [ ] Vue des revenus et transactions
- [ ] Configuration des comptes Mobile Money
- [ ] Rapports de paiement
- [ ] Notifications de paiement
- [ ] Export des données financières

## 🗄️ Modèles de Données

### Transaction
```typescript
model Transaction {
  id                String            @id @default(cuid())
  reference         String            @unique
  amount            Decimal           @db.Decimal(10,2)
  currency          String            @default("XAF")
  status            TransactionStatus @default(PENDING)
  payment_method    PaymentMethod
  provider          MobileMoneyProvider
  provider_reference String?
  
  // Relations
  user_id           String
  user              User              @relation(fields: [user_id], references: [id])
  business_id       String?
  business          Business?         @relation(fields: [business_id], references: [id])
  subscription_id   String?
  subscription      Subscription?     @relation(fields: [subscription_id], references: [id])
  
  // Metadata
  phone_number      String
  description       String?
  metadata          Json?
  
  // Timestamps
  created_at        DateTime          @default(now())
  updated_at        DateTime          @updatedAt
  completed_at      DateTime?
  
  @@map("transactions")
}

enum TransactionStatus {
  PENDING
  PROCESSING
  COMPLETED
  FAILED
  CANCELLED
  REFUNDED
}

enum PaymentMethod {
  ORANGE_MONEY
  MTN_MOBILE_MONEY
  CREDIT_CARD
  BANK_TRANSFER
}

enum MobileMoneyProvider {
  ORANGE
  MTN
}
```

### Subscription
```typescript
model Subscription {
  id              String             @id @default(cuid())
  plan_id         String
  plan            SubscriptionPlan   @relation(fields: [plan_id], references: [id])
  user_id         String
  user            User               @relation(fields: [user_id], references: [id])
  business_id     String?
  business        Business?          @relation(fields: [business_id], references: [id])
  
  status          SubscriptionStatus @default(ACTIVE)
  current_period_start DateTime
  current_period_end   DateTime
  
  // Billing
  amount          Decimal            @db.Decimal(10,2)
  currency        String             @default("XAF")
  billing_cycle   BillingCycle       @default(MONTHLY)
  
  // Relations
  transactions    Transaction[]
  
  created_at      DateTime           @default(now())
  updated_at      DateTime           @updatedAt
  
  @@map("subscriptions")
}

enum SubscriptionStatus {
  ACTIVE
  INACTIVE
  CANCELLED
  PAST_DUE
  UNPAID
}

enum BillingCycle {
  MONTHLY
  QUARTERLY
  YEARLY
}
```

## 🔌 Intégration Orange Money

### Service Orange Money
```typescript
@Injectable()
export class OrangeMoneyService {
  private readonly baseUrl = process.env.ORANGE_MONEY_API_URL;
  private readonly merchantKey = process.env.ORANGE_MONEY_MERCHANT_KEY;
  
  constructor(private readonly httpService: HttpService) {}

  async initiatePayment(paymentData: OrangeMoneyPaymentDto): Promise<PaymentResponse> {
    const payload = {
      merchant_key: this.merchantKey,
      currency: 'XAF',
      order_id: paymentData.reference,
      amount: paymentData.amount,
      return_url: paymentData.returnUrl,
      cancel_url: paymentData.cancelUrl,
      notif_url: paymentData.webhookUrl,
      lang: 'fr',
      reference: paymentData.reference,
    };

    try {
      const response = await this.httpService.post(
        `${this.baseUrl}/webpayment/v1/paymentrequest`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${await this.getAccessToken()}`,
          },
        },
      ).toPromise();

      return {
        success: true,
        paymentUrl: response.data.payment_url,
        reference: response.data.pay_token,
      };
    } catch (error) {
      throw new PaymentException('Orange Money payment initiation failed', error);
    }
  }

  async verifyPayment(reference: string): Promise<PaymentVerification> {
    try {
      const response = await this.httpService.get(
        `${this.baseUrl}/webpayment/v1/transactionstatus/${reference}`,
        {
          headers: {
            'Authorization': `Bearer ${await this.getAccessToken()}`,
          },
        },
      ).toPromise();

      return {
        status: this.mapStatus(response.data.status),
        amount: response.data.amount,
        reference: response.data.reference,
        transactionId: response.data.txnid,
      };
    } catch (error) {
      throw new PaymentException('Orange Money verification failed', error);
    }
  }

  private async getAccessToken(): Promise<string> {
    // Implémentation de l'authentification OAuth2
    const cached = await this.cacheService.get('orange_money_token');
    if (cached) return cached;

    const response = await this.httpService.post(
      `${this.baseUrl}/oauth/v2/token`,
      {
        grant_type: 'client_credentials',
      },
      {
        auth: {
          username: process.env.ORANGE_MONEY_CLIENT_ID,
          password: process.env.ORANGE_MONEY_CLIENT_SECRET,
        },
      },
    ).toPromise();

    const token = response.data.access_token;
    await this.cacheService.set('orange_money_token', token, response.data.expires_in - 60);
    
    return token;
  }
}
```

## 📱 Intégration MTN Mobile Money

### Service MTN Mobile Money
```typescript
@Injectable()
export class MTNMobileMoneyService {
  private readonly baseUrl = process.env.MTN_MOMO_API_URL;
  private readonly subscriptionKey = process.env.MTN_MOMO_SUBSCRIPTION_KEY;
  
  constructor(private readonly httpService: HttpService) {}

  async requestToPay(paymentData: MTNPaymentDto): Promise<PaymentResponse> {
    const referenceId = uuidv4();
    
    const payload = {
      amount: paymentData.amount.toString(),
      currency: 'EUR', // MTN utilise EUR pour le Cameroun
      externalId: paymentData.reference,
      payer: {
        partyIdType: 'MSISDN',
        partyId: paymentData.phoneNumber,
      },
      payerMessage: paymentData.description,
      payeeNote: `Paiement ECOSYSTE - ${paymentData.reference}`,
    };

    try {
      await this.httpService.post(
        `${this.baseUrl}/collection/v1_0/requesttopay`,
        payload,
        {
          headers: {
            'X-Reference-Id': referenceId,
            'X-Target-Environment': process.env.MTN_MOMO_ENVIRONMENT,
            'Ocp-Apim-Subscription-Key': this.subscriptionKey,
            'Authorization': `Bearer ${await this.getAccessToken()}`,
            'Content-Type': 'application/json',
          },
        },
      ).toPromise();

      return {
        success: true,
        reference: referenceId,
        status: 'PENDING',
      };
    } catch (error) {
      throw new PaymentException('MTN Mobile Money payment failed', error);
    }
  }

  async getTransactionStatus(referenceId: string): Promise<PaymentVerification> {
    try {
      const response = await this.httpService.get(
        `${this.baseUrl}/collection/v1_0/requesttopay/${referenceId}`,
        {
          headers: {
            'X-Target-Environment': process.env.MTN_MOMO_ENVIRONMENT,
            'Ocp-Apim-Subscription-Key': this.subscriptionKey,
            'Authorization': `Bearer ${await this.getAccessToken()}`,
          },
        },
      ).toPromise();

      return {
        status: response.data.status,
        amount: parseFloat(response.data.amount),
        reference: response.data.externalId,
        transactionId: referenceId,
        reason: response.data.reason,
      };
    } catch (error) {
      throw new PaymentException('MTN Mobile Money status check failed', error);
    }
  }
}
```

## 🎨 Interface Utilisateur

### Composant de Paiement
```typescript
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Loader2, CreditCard, Smartphone } from 'lucide-react';

interface PaymentFormProps {
  amount: number;
  description: string;
  onSuccess: (transaction: Transaction) => void;
  onError: (error: string) => void;
}

export function PaymentForm({ amount, description, onSuccess, onError }: PaymentFormProps) {
  const [paymentMethod, setPaymentMethod] = useState<'orange' | 'mtn'>('orange');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      const response = await fetch('/api/payments/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          description,
          paymentMethod,
          phoneNumber,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Redirection vers la page de paiement ou affichage du QR code
        if (data.paymentUrl) {
          window.location.href = data.paymentUrl;
        } else {
          // Pour MTN, on poll le statut
          await pollTransactionStatus(data.reference);
        }
      } else {
        onError(data.message || 'Erreur lors du paiement');
      }
    } catch (error) {
      onError('Erreur de connexion');
    } finally {
      setIsProcessing(false);
    }
  };

  const pollTransactionStatus = async (reference: string) => {
    const maxAttempts = 30; // 5 minutes max
    let attempts = 0;

    const poll = async () => {
      try {
        const response = await fetch(`/api/payments/status/${reference}`);
        const data = await response.json();

        if (data.status === 'COMPLETED') {
          onSuccess(data.transaction);
          return;
        }

        if (data.status === 'FAILED' || data.status === 'CANCELLED') {
          onError(data.reason || 'Paiement échoué');
          return;
        }

        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, 10000); // Poll toutes les 10 secondes
        } else {
          onError('Timeout: Vérifiez votre téléphone pour confirmer le paiement');
        }
      } catch (error) {
        onError('Erreur lors de la vérification du paiement');
      }
    };

    poll();
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Paiement Mobile Money
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Montant à payer</Label>
            <div className="text-2xl font-bold text-green-600">
              {amount.toLocaleString()} FCFA
            </div>
            <p className="text-sm text-gray-600">{description}</p>
          </div>

          <div>
            <Label>Mode de paiement</Label>
            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="orange" id="orange" />
                <Label htmlFor="orange" className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-orange-500 rounded"></div>
                  Orange Money
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="mtn" id="mtn" />
                <Label htmlFor="mtn" className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-yellow-500 rounded"></div>
                  MTN Mobile Money
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label htmlFor="phone">Numéro de téléphone</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="6XXXXXXXX"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
              pattern="[6-9][0-9]{8}"
            />
            <p className="text-xs text-gray-500 mt-1">
              Format: 6XXXXXXXX (sans indicatif pays)
            </p>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isProcessing || !phoneNumber}
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Traitement en cours...
              </>
            ) : (
              <>
                <Smartphone className="mr-2 h-4 w-4" />
                Payer {amount.toLocaleString()} FCFA
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
```

## 🔔 Système de Notifications

### Service de Notifications
```typescript
@Injectable()
export class NotificationService {
  constructor(
    private readonly emailService: EmailService,
    private readonly smsService: SMSService,
    private readonly pushService: PushNotificationService,
  ) {}

  async notifyPaymentSuccess(transaction: Transaction): Promise<void> {
    const user = await this.getUserWithPreferences(transaction.user_id);
    
    // Email notification
    if (user.email_notifications) {
      await this.emailService.send({
        to: user.email,
        template: 'payment-success',
        data: {
          amount: transaction.amount,
          reference: transaction.reference,
          date: transaction.completed_at,
        },
      });
    }

    // SMS notification
    if (user.sms_notifications) {
      await this.smsService.send({
        to: transaction.phone_number,
        message: `Paiement confirmé: ${transaction.amount} FCFA. Référence: ${transaction.reference}`,
      });
    }

    // Push notification
    if (user.push_notifications && user.fcm_token) {
      await this.pushService.send({
        token: user.fcm_token,
        title: 'Paiement confirmé',
        body: `Votre paiement de ${transaction.amount} FCFA a été confirmé`,
        data: {
          type: 'payment_success',
          transaction_id: transaction.id,
        },
      });
    }
  }

  async notifyPaymentFailed(transaction: Transaction, reason: string): Promise<void> {
    // Implémentation similaire pour les échecs
  }
}
```

## 🧪 Tests

### Tests d'Intégration
```typescript
describe('Mobile Money Integration', () => {
  let app: INestApplication;
  let paymentService: PaymentService;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [PaymentModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    paymentService = moduleFixture.get<PaymentService>(PaymentService);
    await app.init();
  });

  describe('Orange Money', () => {
    it('should initiate payment successfully', async () => {
      const paymentData = {
        amount: 5000,
        phoneNumber: '677123456',
        description: 'Test payment',
      };

      const result = await paymentService.initiateOrangeMoneyPayment(paymentData);
      
      expect(result.success).toBe(true);
      expect(result.paymentUrl).toBeDefined();
      expect(result.reference).toBeDefined();
    });

    it('should handle payment verification', async () => {
      const reference = 'test-reference-123';
      
      const result = await paymentService.verifyOrangeMoneyPayment(reference);
      
      expect(result.status).toBeOneOf(['PENDING', 'COMPLETED', 'FAILED']);
      expect(result.reference).toBe(reference);
    });
  });

  describe('MTN Mobile Money', () => {
    it('should request payment successfully', async () => {
      const paymentData = {
        amount: 3000,
        phoneNumber: '650123456',
        description: 'Test MTN payment',
      };

      const result = await paymentService.initiateMTNPayment(paymentData);
      
      expect(result.success).toBe(true);
      expect(result.reference).toBeDefined();
    });
  });

  describe('Webhook Handling', () => {
    it('should process Orange Money webhook', async () => {
      const webhookData = {
        status: 'SUCCESS',
        reference: 'test-ref-123',
        amount: 5000,
        txnid: 'OM123456789',
      };

      const response = await request(app.getHttpServer())
        .post('/api/webhooks/orange-money')
        .send(webhookData)
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });
});
```

## 📦 Dépendances

```json
{
  "@nestjs/axios": "^3.0.1",
  "uuid": "^9.0.1",
  "crypto": "^1.0.1",
  "node-cron": "^3.0.3",
  "@types/uuid": "^9.0.7"
}
```

## 🚀 Critères d'Acceptation

### Fonctionnalités
- [ ] Intégration Orange Money opérationnelle
- [ ] Intégration MTN Mobile Money opérationnelle
- [ ] Gestion des webhooks fonctionnelle
- [ ] Interface de paiement intuitive
- [ ] Système de notifications complet

### Sécurité
- [ ] Chiffrement des données sensibles
- [ ] Validation des signatures webhook
- [ ] Logs d'audit complets
- [ ] Protection contre la fraude

### Performance
- [ ] Temps de traitement < 30 secondes
- [ ] Taux de succès > 95%
- [ ] Réconciliation automatique

## 📈 Métriques de Succès

- **Adoption**: 80% des paiements via Mobile Money
- **Conversion**: Taux de conversion > 85%
- **Satisfaction**: Score NPS > 8/10
- **Fiabilité**: Uptime > 99.5%
- **Réconciliation**: 100% automatique

## ⏱️ Estimation

**Durée totale**: 7-10 jours
- Intégration Orange Money: 3-4 jours
- Intégration MTN Mobile Money: 3-4 jours
- Interface utilisateur: 2-3 jours
- Tests et sécurité: 2-3 jours

## 🎯 Prochaines Étapes

1. Checkout sur la branche `feature/004-mobile-money-integration`
2. Configuration des comptes développeur
3. Implémentation Orange Money
4. Implémentation MTN Mobile Money
5. Développement de l'interface
6. Tests d'intégration
7. Sécurisation et audit
8. Documentation et review
9. Merge vers master

---

**Branche**: `feature/004-mobile-money-integration`  
**Priorité**: Haute  
**Statut**: Prêt pour développement  
**Dépendances**: Features 001, 002, 003