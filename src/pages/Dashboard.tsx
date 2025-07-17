import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { 
  Plus, 
  TrendingUp, 
  Clock, 
  CreditCard,
  Play,
  Eye,
  Star,
  Calendar,
  Download,
  Users,
  FileText,
  Zap,
  History,
  Settings,
  Target,
  Sparkles,
  BarChart3,
  Lightbulb,
  Trash2,
  Database
} from "lucide-react";
import { User } from "@/entities";
import { Project } from "@/entities";
import { Creative } from "@/entities";
import { TipsSection } from "@/components/dashboard/TipsSection";
import { getProductData, getAvatarData, clearStoredData, type ProductData, type AvatarData } from "@/lib/make-integration";

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [recentCreatives, setRecentCreatives] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalCreatives: 0,
    creditsRemaining: 0,
    creativesInDraft: 0,
    creativesExported: 0,
    creativesThisMonth: 0,
    subscriptionRenewalDate: null
  });
  const [showStoredData, setShowStoredData] = useState(false);
  const [storedProducts, setStoredProducts] = useState<ProductData[]>([]);
  const [storedAvatars, setStoredAvatars] = useState<AvatarData[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Use local user service
      const currentUser = { id: 'local-user', full_name: 'משתמש מקומי', credits_balance: 100 };
      setUser(currentUser);

      const creativesRes = await Creative.list();
      const creatives = Array.isArray(creativesRes) ? creativesRes : [];
      setRecentCreatives(creatives.slice(0, 6));

      const allCreativesRes = await Creative.list();
      const allCreatives = Array.isArray(allCreativesRes) ? allCreativesRes : [];

      // Calculate statistics
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const creativesThisMonth = allCreatives.filter(creative => 
        new Date(creative.created_at) >= startOfMonth
      ).length;

      const creativesInDraft = allCreatives.filter(creative => 
        ['draft', 'planning'].includes(creative.status)
      ).length;

      const creativesExported = allCreatives.filter(creative => 
        creative.status === 'rendered'
      ).length;

      // Mock subscription renewal date (30 days from now)
      const renewalDate = new Date();
      renewalDate.setDate(renewalDate.getDate() + 30);

      setStats({
        totalCreatives: allCreatives.length,
        creditsRemaining: currentUser.credits_balance || 100,
        creativesInDraft,
        creativesExported,
        creativesThisMonth,
        subscriptionRenewalDate: renewalDate
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'draft': { label: 'טיוטה', variant: 'secondary' as const },
      'planning': { label: 'בתכנון', variant: 'default' as const },
      'generating': { label: 'ביצירה', variant: 'default' as const },
      'completed': { label: 'הושלם', variant: 'default' as const },
      'failed': { label: 'נכשל', variant: 'destructive' as const },
      'rendered': { label: 'מוכן', variant: 'default' as const }
    };
    
    const config = statusMap[status as keyof typeof statusMap] || { label: status, variant: 'secondary' as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const handleViewStoredData = () => {
    const products = getProductData();
    const avatars = getAvatarData();
    setStoredProducts(products);
    setStoredAvatars(avatars);
    setShowStoredData(true);
  };

  const handleClearStoredData = () => {
    clearStoredData();
    setStoredProducts([]);
    setStoredAvatars([]);
    setShowStoredData(false);
  };

  const dashboardStats = [
    {
      title: "קריאייטיבים שנוצרו",
      value: "12",
      change: "+8%",
      changeType: "positive" as const,
      icon: Sparkles,
      color: "bg-gradient-to-r from-blue-500 to-purple-600"
    },
    {
      title: "קהל היעד",
      value: "1,234",
      change: "+12%",
      changeType: "positive" as const,
      icon: Users,
      color: "bg-gradient-to-r from-green-500 to-teal-600"
    },
    {
      title: "תוכן פעיל",
      value: "89%",
      change: "+5%",
      changeType: "positive" as const,
      icon: Target,
      color: "bg-gradient-to-r from-orange-500 to-red-600"
    },
    {
      title: "ביצועים",
      value: "4.2x",
      change: "+15%",
      changeType: "positive" as const,
      icon: TrendingUp,
      color: "bg-gradient-to-r from-purple-500 to-pink-600"
    }
  ];

  const quickActions = [
    {
      title: "צור קריאייטיב חדש",
      description: "התחל ליצור תוכן חדש עם AI",
      icon: Plus,
      href: "/create",
      color: "bg-gradient-to-r from-blue-500 to-purple-600"
    },
    {
      title: "היסטוריית קריאייטיבים",
      description: "צפה בכל הקריאייטיבים שיצרת",
      icon: History,
      href: "/history",
      color: "bg-gradient-to-r from-green-500 to-teal-600"
    },
    {
      title: "עוזר שיווקי",
      description: "קבל רעיונות ותובנות שיווקיות",
      icon: Lightbulb,
      href: "/marketing-assistant",
      color: "bg-gradient-to-r from-orange-500 to-red-600"
    }
  ];

  const recentActivity = [
    {
      title: "קריאייטיב חדש נוצר",
      description: "סרטון למוצר טכנולוגי",
      time: "לפני 2 שעות",
      icon: Sparkles
    },
    {
      title: "עדכון אווטאר",
      description: "קהל היעד עודכן",
      time: "לפני 4 שעות",
      icon: Users
    },
    {
      title: "תוכן פורסם",
      description: "מודעה לרשתות חברתיות",
      time: "לפני 6 שעות",
      icon: Zap
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 text-right" dir="rtl">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <SidebarTrigger />
          <div>
              <h1 className="text-3xl font-bold text-gray-900">דשבורד</h1>
              <p className="text-gray-600 mt-1">ברוך הבא! הנה סקירה כללית של הפרויקט שלך</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={handleViewStoredData}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              צפה בנתונים
            </Button>
            <Button 
              asChild
              variant="outline"
              className="flex items-center gap-2"
            >
              <Link to="/data-management">
                <Database className="w-4 h-4" />
                ניהול נתונים
          </Link>
        </Button>
      </div>
      </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {dashboardStats.map((stat, index) => (
            <Card key={index} className="shadow-sm">
              <CardContent className="p-6">
            <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.color.replace('bg-gradient-to-r', 'bg-gradient-to-br')} text-white`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <span className={`text-sm font-medium ${
                    stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.change}
                  </span>
                  <span className="text-sm text-gray-500 mr-2">מהחודש שעבר</span>
                </div>
          </CardContent>
        </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {quickActions.map((action, index) => (
            <Link key={index} to={action.href}>
              <Card className="shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-full ${action.color} text-white group-hover:scale-110 transition-transform`}>
                      <action.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {action.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">{action.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              </Link>
          ))}
            </div>

        {/* Recent Activity & Tips */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                פעילות אחרונה
              </CardTitle>
          </CardHeader>
          <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-blue-100 text-blue-600">
                      <activity.icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{activity.title}</p>
                      <p className="text-sm text-gray-600">{activity.description}</p>
                    </div>
                    <span className="text-sm text-gray-500">{activity.time}</span>
                  </div>
                ))}
              </div>
          </CardContent>
        </Card>

          <TipsSection />
        </div>

        {/* Stored Data Modal */}
        {showStoredData && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">נתונים מאוחסנים</h2>
                <div className="flex gap-2">
                  <Button onClick={handleClearStoredData} variant="destructive" size="sm">
                    <Trash2 className="w-4 h-4 mr-2" />
                    נקה הכל
                  </Button>
                  <Button onClick={() => setShowStoredData(false)} variant="outline" size="sm">
                    סגור
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Products */}
                <div>
                  <h3 className="font-semibold mb-3">מוצרים ({storedProducts.length})</h3>
                  {storedProducts.length > 0 ? (
                    <div className="space-y-3">
                      {storedProducts.map((product, index) => (
                        <Card key={index} className="p-3">
                          <h4 className="font-medium">{product.name}</h4>
                          <p className="text-sm text-gray-600">{product.description}</p>
                          <p className="text-sm font-medium text-green-600">{product.price} {product.currency}</p>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">אין מוצרים מאוחסנים</p>
                  )}
                </div>

                {/* Avatars */}
                <div>
                  <h3 className="font-semibold mb-3">אווטארים ({storedAvatars.length})</h3>
                  {storedAvatars.length > 0 ? (
                    <div className="space-y-3">
                      {storedAvatars.map((avatar, index) => (
                        <Card key={index} className="p-3">
                          <h4 className="font-medium">{avatar.name}</h4>
                          <p className="text-sm text-gray-600">גיל: {avatar.age}</p>
                          <p className="text-sm text-gray-600">מין: {avatar.gender}</p>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">אין אווטארים מאוחסנים</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}