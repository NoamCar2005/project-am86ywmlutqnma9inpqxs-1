import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { 
  CreditCard, 
  Check, 
  Star, 
  Calendar,
  TrendingUp,
  Zap
} from "lucide-react";
import { User } from "@/entities";
import { CreditTransaction } from "@/entities";

export default function BillingPage() {
  const [user, setUser] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadBillingData();
  }, []);

  const loadBillingData = async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);

      const transactionData = await CreditTransaction.list('-created_at', 10);
      setTransactions(transactionData);
    } catch (error) {
      console.error('Error loading billing data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      nameHe: 'מתחיל',
      price: 49,
      credits: 50,
      features: [
        'עד 50 קריאייטיבים בחודש',
        'תמיכה בסיסית',
        'תבניות בסיסיות',
        'ייצוא באיכות HD'
      ],
      popular: false
    },
    {
      id: 'pro',
      name: 'Pro',
      nameHe: 'מקצועי',
      price: 99,
      credits: 150,
      features: [
        'עד 150 קריאייטיבים בחודש',
        'תמיכה מועדפת',
        'כל התבניות',
        'ייצוא באיכות 4K',
        'עריכה מתקדמת',
        'AI מתקדם'
      ],
      popular: true
    },
    {
      id: 'premium',
      name: 'Premium',
      nameHe: 'פרימיום',
      price: 199,
      credits: 500,
      features: [
        'קריאייטיבים ללא הגבלה',
        'תמיכה VIP',
        'תבניות בלעדיות',
        'ייצוא באיכות 8K',
        'עריכה מתקדמת',
        'AI מתקדם',
        'ניתוח ביצועים',
        'API גישה'
      ],
      popular: false
    }
  ];

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'purchase': return <CreditCard className="w-4 h-4 text-green-600" />;
      case 'usage': return <TrendingUp className="w-4 h-4 text-blue-600" />;
      case 'bonus': return <Star className="w-4 h-4 text-yellow-600" />;
      default: return <CreditCard className="w-4 h-4 text-gray-600" />;
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <SidebarTrigger />
          <h1 className="text-3xl font-bold">ניהול קרדיטים</h1>
        </div>
        <div className="animate-pulse space-y-6">
          <div className="h-32 bg-gray-200 rounded-lg"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-96 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">ניהול קרדיטים</h1>
          <p className="text-gray-600 mt-1">נהל את המנוי והקרדיטים שלך</p>
        </div>
      </div>

      {/* Current Plan Status */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">המנוי הנוכחי שלך</h3>
              <div className="flex items-center gap-4 mt-2">
                <Badge variant="default" className="text-sm">
                  {plans.find(p => p.id === user?.subscription_plan)?.nameHe || 'מתחיל'}
                </Badge>
                <span className="text-sm text-gray-600">
                  {user?.credits_balance || 0} קרדיטים נותרו
                </span>
              </div>
            </div>
            <div className="text-left">
              <div className="text-2xl font-bold text-gray-900">
                {user?.credits_balance || 0}
              </div>
              <div className="text-sm text-gray-600">קרדיטים זמינים</div>
            </div>
          </div>
          
          {user?.subscription_expires_at && (
            <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              המנוי מסתיים ב: {new Date(user.subscription_expires_at).toLocaleDateString('he-IL')}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Subscription Plans */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">תוכניות מנוי</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <Card 
              key={plan.id} 
              className={`relative ${plan.popular ? 'border-brand-primary shadow-lg scale-105' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-brand-primary text-white px-3 py-1">
                    <Star className="w-3 h-3 ml-1" />
                    הכי פופולרי
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-xl">{plan.nameHe}</CardTitle>
                <div className="mt-4">
                  <span className="text-3xl font-bold">₪{plan.price}</span>
                  <span className="text-gray-600">/חודש</span>
                </div>
                <CardDescription className="mt-2">
                  {plan.credits} קרדיטים בחודש
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  className={`w-full ${
                    plan.popular 
                      ? 'gradient-primary text-white' 
                      : 'border border-gray-300 hover:bg-gray-50'
                  }`}
                  variant={plan.popular ? 'default' : 'outline'}
                  disabled={user?.subscription_plan === plan.id}
                >
                  {user?.subscription_plan === plan.id ? 'המנוי הנוכחי' : 'בחר תוכנית'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle>היסטוריית עסקאות</CardTitle>
          <CardDescription>
            כל העסקאות והשימוש בקרדיטים שלך
          </CardDescription>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <CreditCard className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>עדיין לא בוצעו עסקאות</p>
            </div>
          ) : (
            <div className="space-y-4">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getTransactionIcon(transaction.type)}
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(transaction.created_at).toLocaleDateString('he-IL')}
                      </p>
                    </div>
                  </div>
                  <div className={`font-medium ${
                    transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.amount > 0 ? '+' : ''}{transaction.amount} קרדיטים
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}