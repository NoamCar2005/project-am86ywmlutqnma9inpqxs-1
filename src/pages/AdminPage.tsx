import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { 
  Users, 
  CreditCard, 
  Database, 
  Settings, 
  Shield, 
  Activity, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  Plus,
  Download,
  Upload,
  RefreshCw,
  Eye,
  Lock,
  Unlock,
  Zap,
  BarChart3,
  FileText,
  Globe,
  Server,
  Check
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Admin authentication check
const ADMIN_EMAIL = "admin@adcraft.ai"; // Replace with your actual admin email
const isAdmin = () => {
  // In a real app, you'd check against your authentication system
  // For now, we'll use a simple check
  console.log('[AdminPage] Checking admin access...');
  const isAdminUser = true; // Set to true to grant access
  console.log('[AdminPage] Admin access granted:', isAdminUser);
  return isAdminUser;
};

interface User {
  id: string;
  email: string;
  name: string;
  credits: number;
  status: 'active' | 'suspended' | 'pending';
  createdAt: string;
  lastLogin: string;
  plan: 'free' | 'pro' | 'enterprise';
}

interface SystemStats {
  totalUsers: number;
  activeUsers: number;
  totalCredits: number;
  totalCreatives: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
  uptime: string;
  version: string;
}

interface UserData {
  id: string;
  userId: string;
  type: 'product' | 'avatar' | 'creative' | 'template';
  data: any;
  createdAt: string;
  lastModified: string;
}

interface CreditPlan {
  id: string;
  name: string;
  credits: number;
  price: number;
  benefits: string[];
  description: string;
  isActive: boolean;
}

interface CreditCost {
  id: string;
  action: string;
  credits: number;
  description: string;
  isActive: boolean;
}

export default function AdminPage() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [users, setUsers] = useState<User[]>([]);
  const [systemStats, setSystemStats] = useState<SystemStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalCredits: 0,
    totalCreatives: 0,
    systemHealth: 'healthy',
    uptime: '99.9%',
    version: '1.0.0'
  });
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Data management state
  const [userData, setUserData] = useState<UserData[]>([]);
  const [selectedDataType, setSelectedDataType] = useState<'all' | 'product' | 'avatar' | 'creative' | 'template'>('all');
  
  // Credit management state
  const [creditPlans, setCreditPlans] = useState<CreditPlan[]>([]);
  const [creditCosts, setCreditCosts] = useState<CreditCost[]>([]);
  const [showPlanDialog, setShowPlanDialog] = useState(false);
  const [showCostDialog, setShowCostDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<CreditPlan | null>(null);
  const [selectedCost, setSelectedCost] = useState<CreditCost | null>(null);

  useEffect(() => {
    console.log('[AdminPage] Component mounted, checking admin access...');
    // Check admin authorization
    if (!isAdmin()) {
      console.log('[AdminPage] Access denied - not admin');
      toast({
        title: "גישה נדחתה",
        description: "אין לך הרשאות גישה לעמוד זה",
        variant: "destructive"
      });
      return;
    }
    
    console.log('[AdminPage] Access granted - loading admin data');
    setIsAuthorized(true);
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    setIsLoading(true);
    try {
      // Load users from localStorage (replace with actual API call)
      const storedUsers = localStorage.getItem('admin_users');
      if (storedUsers) {
        setUsers(JSON.parse(storedUsers));
      } else {
        // Mock data for demonstration
        const mockUsers: User[] = [
          {
            id: '1',
            email: 'user1@example.com',
            name: 'משתמש ראשון',
            credits: 150,
            status: 'active' as const,
            createdAt: '2024-01-15',
            lastLogin: '2024-01-20',
            plan: 'pro'
          },
          {
            id: '2',
            email: 'user2@example.com',
            name: 'משתמש שני',
            credits: 50,
            status: 'active' as const,
            createdAt: '2024-01-10',
            lastLogin: '2024-01-19',
            plan: 'free'
          },
          {
            id: '3',
            email: 'user3@example.com',
            name: 'משתמש שלישי',
            credits: 300,
            status: 'suspended' as const,
            createdAt: '2024-01-05',
            lastLogin: '2024-01-18',
            plan: 'enterprise'
          }
        ];
        setUsers(mockUsers);
        localStorage.setItem('admin_users', JSON.stringify(mockUsers));
      }

      // Update system stats
      setSystemStats(prev => ({
        ...prev,
        totalUsers: users.length,
        activeUsers: users.filter(u => u.status === 'active').length,
        totalCredits: users.reduce((sum, u) => sum + u.credits, 0)
      }));

      // Load user data
      const storedUserData = localStorage.getItem('admin_user_data');
      if (storedUserData) {
        setUserData(JSON.parse(storedUserData));
      } else {
        // Mock user data
        const mockUserData: UserData[] = [
          {
            id: '1',
            userId: 'user1',
            type: 'product',
            data: { name: 'מוצר טכנולוגי', category: 'tech', price: 299 },
            createdAt: '2024-01-15',
            lastModified: '2024-01-20'
          },
          {
            id: '2',
            userId: 'user1',
            type: 'avatar',
            data: { name: 'אווטאר צעיר', age: '25-35', interests: ['טכנולוגיה', 'ספורט'] },
            createdAt: '2024-01-16',
            lastModified: '2024-01-19'
          },
          {
            id: '3',
            userId: 'user2',
            type: 'creative',
            data: { type: 'UGC', scenes: 5, duration: 30 },
            createdAt: '2024-01-17',
            lastModified: '2024-01-18'
          },
          {
            id: '4',
            userId: 'user3',
            type: 'template',
            data: { templateId: 'template_1', name: 'תבנית מודרנית' },
            createdAt: '2024-01-18',
            lastModified: '2024-01-18'
          }
        ];
        setUserData(mockUserData);
        localStorage.setItem('admin_user_data', JSON.stringify(mockUserData));
      }

      // Load credit plans
      const storedCreditPlans = localStorage.getItem('admin_credit_plans');
      if (storedCreditPlans) {
        setCreditPlans(JSON.parse(storedCreditPlans));
      } else {
        // Mock credit plans
        const mockCreditPlans: CreditPlan[] = [
          {
            id: '1',
            name: 'חבילה חינמית',
            credits: 50,
            price: 0,
            benefits: ['50 קרדיטים לחודש', 'תמיכה בסיסית', 'תבניות בסיסיות'],
            description: 'חבילה חינמית למתחילים',
            isActive: true
          },
          {
            id: '2',
            name: 'חבילה מקצועית',
            credits: 200,
            price: 99,
            benefits: ['200 קרדיטים לחודש', 'תמיכה מתקדמת', 'תבניות פרימיום', 'עדיפות בסדר'],
            description: 'חבילה מקצועית לעסקים',
            isActive: true
          },
          {
            id: '3',
            name: 'חבילה ארגונית',
            credits: 500,
            price: 299,
            benefits: ['500 קרדיטים לחודש', 'תמיכה 24/7', 'תבניות מותאמות אישית', 'API גישה'],
            description: 'חבילה ארגונית לחברות גדולות',
            isActive: true
          }
        ];
        setCreditPlans(mockCreditPlans);
        localStorage.setItem('admin_credit_plans', JSON.stringify(mockCreditPlans));
      }

      // Load credit costs
      const storedCreditCosts = localStorage.getItem('admin_credit_costs');
      if (storedCreditCosts) {
        setCreditCosts(JSON.parse(storedCreditCosts));
      } else {
        // Mock credit costs
        const mockCreditCosts: CreditCost[] = [
          {
            id: '1',
            action: 'יצירת אווטאר',
            credits: 5,
            description: 'יצירת אווטאר מותאם אישית',
            isActive: true
          },
          {
            id: '2',
            action: 'יצירת תכנית קריאייטיב',
            credits: 10,
            description: 'יצירת תכנית קריאייטיב מלאה',
            isActive: true
          },
          {
            id: '3',
            action: 'יצירת וידאו',
            credits: 25,
            description: 'יצירת וידאו קריאייטיב',
            isActive: true
          },
          {
            id: '4',
            action: 'יצירת תמונה',
            credits: 15,
            description: 'יצירת תמונה קריאייטיב',
            isActive: true
          }
        ];
        setCreditCosts(mockCreditCosts);
        localStorage.setItem('admin_credit_costs', JSON.stringify(mockCreditCosts));
      }
    } catch (error) {
      console.error('Error loading admin data:', error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בטעינת נתוני הניהול",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserEdit = (user: User) => {
    setSelectedUser(user);
    setShowUserDialog(true);
  };

  const handleUserSave = (updatedUser: User) => {
    const updatedUsers = users.map(u => u.id === updatedUser.id ? updatedUser : u);
    setUsers(updatedUsers);
    localStorage.setItem('admin_users', JSON.stringify(updatedUsers));
    setShowUserDialog(false);
    setSelectedUser(null);
    
    toast({
      title: "משתמש עודכן",
      description: "פרטי המשתמש עודכנו בהצלחה"
    });
  };

  const handleUserStatusToggle = (userId: string) => {
    const updatedUsers = users.map(user => {
      if (user.id === userId) {
        return {
          ...user,
          status: (user.status === 'active' ? 'suspended' : 'active') as 'active' | 'suspended' | 'pending'
        };
      }
      return user;
    });
    setUsers(updatedUsers);
    localStorage.setItem('admin_users', JSON.stringify(updatedUsers));
    
    toast({
      title: "סטטוס עודכן",
      description: "סטטוס המשתמש עודכן בהצלחה"
    });
  };

  const handleCreditsUpdate = (userId: string, credits: number) => {
    const updatedUsers = users.map(user => {
      if (user.id === userId) {
        return { ...user, credits };
      }
      return user;
    });
    setUsers(updatedUsers);
    localStorage.setItem('admin_users', JSON.stringify(updatedUsers));
    
    toast({
      title: "קרדיטים עודכנו",
      description: `קרדיטים עודכנו ל-${credits}`
    });
  };

  const handleSystemBackup = () => {
    // Export all data as JSON
    const backupData = {
      users,
      systemStats,
      timestamp: new Date().toISOString(),
      version: systemStats.version
    };
    
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `adcraft-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "גיבוי הושלם",
      description: "קובץ הגיבוי הורד בהצלחה"
    });
  };

  const handleSystemRestore = () => {
    // This would typically involve file upload and validation
    toast({
      title: "שחזור מערכת",
      description: "פונקציונליות שחזור תתווסף בקרוב"
    });
  };

  // Data management handlers
  const handleDataDelete = (dataId: string) => {
    const updatedData = userData.filter(data => data.id !== dataId);
    setUserData(updatedData);
    localStorage.setItem('admin_user_data', JSON.stringify(updatedData));
    toast({
      title: "נתונים נמחקו",
      description: "הנתונים נמחקו בהצלחה",
    });
  };

  const handleDataExport = () => {
    const dataStr = JSON.stringify(userData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'user-data-export.json';
    link.click();
    URL.revokeObjectURL(url);
    toast({
      title: "ייצוא נתונים",
      description: "הנתונים יוצאו בהצלחה",
    });
  };

  // Credit management handlers
  const handlePlanEdit = (plan: CreditPlan) => {
    setSelectedPlan(plan);
    setShowPlanDialog(true);
  };

  const handlePlanSave = (updatedPlan: CreditPlan) => {
    const updatedPlans = creditPlans.map(p => p.id === updatedPlan.id ? updatedPlan : p);
    setCreditPlans(updatedPlans);
    localStorage.setItem('admin_credit_plans', JSON.stringify(updatedPlans));
    setShowPlanDialog(false);
    setSelectedPlan(null);
    toast({
      title: "חבילה עודכנה",
      description: "פרטי החבילה עודכנו בהצלחה",
    });
  };

  const handleCostEdit = (cost: CreditCost) => {
    setSelectedCost(cost);
    setShowCostDialog(true);
  };

  const handleCostSave = (updatedCost: CreditCost) => {
    const updatedCosts = creditCosts.map(c => c.id === updatedCost.id ? updatedCost : c);
    setCreditCosts(updatedCosts);
    localStorage.setItem('admin_credit_costs', JSON.stringify(updatedCosts));
    setShowCostDialog(false);
    setSelectedCost(null);
    toast({
      title: "עלות עודכנה",
      description: "פרטי העלות עודכנו בהצלחה",
    });
  };

  const getDataTypeLabel = (type: string) => {
    switch (type) {
      case 'product': return 'מוצר';
      case 'avatar': return 'אווטאר';
      case 'creative': return 'קריאייטיב';
      case 'template': return 'תבנית';
      default: return type;
    }
  };

  const getDataTypeColor = (type: string) => {
    switch (type) {
      case 'product': return 'bg-blue-100 text-blue-800';
      case 'avatar': return 'bg-green-100 text-green-800';
      case 'creative': return 'bg-purple-100 text-purple-800';
      case 'template': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100">
        <Card className="w-96 text-center">
          <CardContent className="pt-6">
            <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-red-700 mb-2">גישה נדחתה</h2>
            <p className="text-red-600">אין לך הרשאות גישה לעמוד זה</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>טוען נתוני ניהול...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 text-right" dir="rtl">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <SidebarTrigger />
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <Shield className="w-8 h-8 text-red-600" />
                פאנל ניהול
              </h1>
              <p className="text-gray-600 mt-1">ניהול מלא של המערכת - גישה מוגבלת למנהל בלבד</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleSystemBackup}>
              <Download className="w-4 h-4 ml-2" />
              גיבוי מערכת
            </Button>
            <Button variant="outline" onClick={handleSystemRestore}>
              <Upload className="w-4 h-4 ml-2" />
              שחזור מערכת
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              דשבורד
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              משתמשים
            </TabsTrigger>
            <TabsTrigger value="credits" className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              קרדיטים
            </TabsTrigger>
            <TabsTrigger value="database" className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              מסד נתונים
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              הגדרות
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">סה"כ משתמשים</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{systemStats.totalUsers}</div>
                  <p className="text-xs text-muted-foreground">
                    {systemStats.activeUsers} פעילים
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">סה"כ קרדיטים</CardTitle>
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{systemStats.totalCredits}</div>
                  <p className="text-xs text-muted-foreground">
                    קרדיטים במערכת
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">בריאות מערכת</CardTitle>
                  <Server className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${
                      systemStats.systemHealth === 'healthy' ? 'bg-green-500' :
                      systemStats.systemHealth === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                    }`} />
                    <span className="text-sm font-medium capitalize">{systemStats.systemHealth}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    זמינות: {systemStats.uptime}
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">גרסה</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{systemStats.version}</div>
                  <p className="text-xs text-muted-foreground">
                    גרסה נוכחית
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>פעילות אחרונה</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {users.slice(0, 5).map(user => (
                      <div key={user.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                        <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                          {user.status === 'active' ? 'פעיל' : 'מושעה'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>סטטיסטיקות מהירות</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>משתמשים חדשים היום</span>
                      <span className="font-bold">3</span>
                    </div>
                    <div className="flex justify-between">
                      <span>קרדיטים שנצרכו</span>
                      <span className="font-bold">127</span>
                    </div>
                    <div className="flex justify-between">
                      <span>קריאייטיבים שנוצרו</span>
                      <span className="font-bold">45</span>
                    </div>
                    <div className="flex justify-between">
                      <span>שגיאות מערכת</span>
                      <span className="font-bold text-green-600">0</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>ניהול משתמשים</CardTitle>
                <CardDescription>
                  צפה וערוך את כל המשתמשים במערכת
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.map(user => (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div>
                          <h3 className="font-medium">{user.name}</h3>
                          <p className="text-sm text-gray-500">{user.email}</p>
                          <p className="text-xs text-gray-400">נוצר: {user.createdAt}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <p className="font-bold">{user.credits}</p>
                          <p className="text-xs text-gray-500">קרדיטים</p>
                        </div>
                        <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                          {user.status === 'active' ? 'פעיל' : 'מושעה'}
                        </Badge>
                        <Badge variant="outline">{user.plan}</Badge>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleUserEdit(user)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleUserStatusToggle(user.id)}
                          >
                            {user.status === 'active' ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Credits Tab */}
          <TabsContent value="credits" className="space-y-6">
            {/* Credit Plans Management */}
            <Card>
              <CardHeader>
                <CardTitle>ניהול חבילות קרדיטים</CardTitle>
                <CardDescription>
                  ערוך את החבילות, היתרונות והמחירים
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {creditPlans.map(plan => (
                      <Card key={plan.id} className={`${!plan.isActive ? 'opacity-60' : ''}`}>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">{plan.name}</CardTitle>
                            {!plan.isActive && (
                              <Badge variant="secondary">לא פעיל</Badge>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{plan.credits}</div>
                          <p className="text-sm text-gray-500">קרדיטים לחודש</p>
                          <p className="text-lg font-semibold text-green-600 mt-2">
                            ₪{plan.price}
                          </p>
                          <p className="text-sm text-gray-600 mb-4">{plan.description}</p>
                          
                          <div className="space-y-2 mb-4">
                            <h4 className="font-medium text-sm">היתרונות:</h4>
                            <ul className="text-xs text-gray-600 space-y-1">
                              {plan.benefits.map((benefit, index) => (
                                <li key={index} className="flex items-center gap-2">
                                  <Check className="w-3 h-3 text-green-500" />
                                  {benefit}
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          <Button 
                            className="w-full" 
                            variant="outline"
                            onClick={() => handlePlanEdit(plan)}
                          >
                            <Edit className="w-4 h-4 ml-2" />
                            ערוך חבילה
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Credit Costs Management */}
            <Card>
              <CardHeader>
                <CardTitle>ניהול עלויות קרדיטים</CardTitle>
                <CardDescription>
                  הגדר כמה קרדיטים עולה כל פעולה במערכת
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {creditCosts.map(cost => (
                    <div key={cost.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`w-3 h-3 rounded-full ${cost.isActive ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        <div>
                          <h3 className="font-medium">{cost.action}</h3>
                          <p className="text-sm text-gray-500">{cost.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <div className="text-xl font-bold text-blue-600">{cost.credits}</div>
                          <div className="text-xs text-gray-500">קרדיטים</div>
                        </div>
                        <Badge variant={cost.isActive ? 'default' : 'secondary'}>
                          {cost.isActive ? 'פעיל' : 'לא פעיל'}
                        </Badge>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleCostEdit(cost)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Database Tab */}
          <TabsContent value="database" className="space-y-6">
            {/* Data Management Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>ניהול נתוני משתמשים</CardTitle>
                    <CardDescription>
                      צפה, ערוך ומחק את כל הנתונים שנוצרו על ידי המשתמשים
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Select value={selectedDataType} onValueChange={(value: any) => setSelectedDataType(value)}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">כל הנתונים</SelectItem>
                        <SelectItem value="product">מוצרים</SelectItem>
                        <SelectItem value="avatar">אווטארים</SelectItem>
                        <SelectItem value="creative">קריאייטיבים</SelectItem>
                        <SelectItem value="template">תבניות</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button onClick={handleDataExport} variant="outline">
                      <Download className="w-4 h-4 ml-2" />
                      ייצוא נתונים
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {userData
                    .filter(data => selectedDataType === 'all' || data.type === selectedDataType)
                    .map(data => (
                      <div key={data.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className={`w-3 h-3 rounded-full ${getDataTypeColor(data.type).replace('bg-', 'bg-').replace('text-', 'text-')}`}></div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium">{getDataTypeLabel(data.type)}</h3>
                              <Badge variant="outline" className={getDataTypeColor(data.type)}>
                                {getDataTypeLabel(data.type)}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-500">משתמש: {data.userId}</p>
                            <p className="text-xs text-gray-400">
                              נוצר: {data.createdAt} | עודכן: {data.lastModified}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline" onClick={() => console.log('View data:', data)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleDataDelete(data.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  
                  {userData.filter(data => selectedDataType === 'all' || data.type === selectedDataType).length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Database className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>אין נתונים להצגה</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* System Database Management */}
            <Card>
              <CardHeader>
                <CardTitle>ניהול מסד נתונים מערכת</CardTitle>
                <CardDescription>
                  גיבוי, שחזור וניהול נתוני המערכת
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button onClick={handleSystemBackup} className="h-20">
                      <Download className="w-6 h-6 ml-2" />
                      יצירת גיבוי
                    </Button>
                    <Button variant="outline" onClick={handleSystemRestore} className="h-20">
                      <Upload className="w-6 h-6 ml-2" />
                      שחזור מערכת
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">סטטיסטיקות מסד נתונים</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>גודל מסד נתונים: <span className="font-medium">2.4 MB</span></div>
                      <div>מספר רשומות: <span className="font-medium">{userData.length}</span></div>
                      <div>גיבוי אחרון: <span className="font-medium">היום 14:30</span></div>
                      <div>סטטוס: <span className="font-medium text-green-600">פעיל</span></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>הגדרות מערכת</CardTitle>
                <CardDescription>
                  הגדרות כלליות של המערכת
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>שם המערכת</Label>
                      <Input defaultValue="AdCraft AI" />
                    </div>
                    <div className="space-y-2">
                      <Label>גרסה</Label>
                      <Input defaultValue={systemStats.version} />
                    </div>
                    <div className="space-y-2">
                      <Label>מצב תחזוקה</Label>
                      <Select defaultValue="off">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="off">כבוי</SelectItem>
                          <SelectItem value="on">פועל</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>רמת לוג</Label>
                      <Select defaultValue="info">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="debug">Debug</SelectItem>
                          <SelectItem value="info">Info</SelectItem>
                          <SelectItem value="warning">Warning</SelectItem>
                          <SelectItem value="error">Error</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>הודעת מערכת</Label>
                    <Textarea placeholder="הודעה שתוצג לכל המשתמשים..." />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button>שמור הגדרות</Button>
                    <Button variant="outline">איפוס להגדרות ברירת מחדל</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* User Edit Dialog */}
        <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>ערוך משתמש</DialogTitle>
            </DialogHeader>
            {selectedUser && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>שם</Label>
                  <Input 
                    defaultValue={selectedUser.name}
                    onChange={(e) => setSelectedUser({...selectedUser, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>אימייל</Label>
                  <Input 
                    defaultValue={selectedUser.email}
                    onChange={(e) => setSelectedUser({...selectedUser, email: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>קרדיטים</Label>
                  <Input 
                    type="number"
                    defaultValue={selectedUser.credits}
                    onChange={(e) => setSelectedUser({...selectedUser, credits: parseInt(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>תוכנית</Label>
                  <Select 
                    defaultValue={selectedUser.plan}
                    onValueChange={(value) => setSelectedUser({...selectedUser, plan: value as any})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free">חינמי</SelectItem>
                      <SelectItem value="pro">מקצועי</SelectItem>
                      <SelectItem value="enterprise">ארגוני</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>סטטוס</Label>
                  <Select 
                    defaultValue={selectedUser.status}
                    onValueChange={(value) => setSelectedUser({...selectedUser, status: value as any})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">פעיל</SelectItem>
                      <SelectItem value="suspended">מושעה</SelectItem>
                      <SelectItem value="pending">ממתין</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowUserDialog(false)}>
                ביטול
              </Button>
              <Button onClick={() => selectedUser && handleUserSave(selectedUser)}>
                שמור שינויים
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Credit Plan Edit Dialog */}
        <Dialog open={showPlanDialog} onOpenChange={setShowPlanDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>ערוך חבילת קרדיטים</DialogTitle>
            </DialogHeader>
            {selectedPlan && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>שם החבילה</Label>
                    <Input 
                      defaultValue={selectedPlan.name}
                      onChange={(e) => setSelectedPlan({...selectedPlan, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>מחיר (₪)</Label>
                    <Input 
                      type="number"
                      defaultValue={selectedPlan.price}
                      onChange={(e) => setSelectedPlan({...selectedPlan, price: parseInt(e.target.value)})}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>מספר קרדיטים</Label>
                    <Input 
                      type="number"
                      defaultValue={selectedPlan.credits}
                      onChange={(e) => setSelectedPlan({...selectedPlan, credits: parseInt(e.target.value)})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>סטטוס</Label>
                    <Select 
                      defaultValue={selectedPlan.isActive ? 'active' : 'inactive'}
                      onValueChange={(value) => setSelectedPlan({...selectedPlan, isActive: value === 'active'})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">פעיל</SelectItem>
                        <SelectItem value="inactive">לא פעיל</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>תיאור</Label>
                  <Textarea 
                    defaultValue={selectedPlan.description}
                    onChange={(e) => setSelectedPlan({...selectedPlan, description: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>היתרונות (כל יתרון בשורה נפרדת)</Label>
                  <Textarea 
                    defaultValue={selectedPlan.benefits.join('\n')}
                    onChange={(e) => setSelectedPlan({...selectedPlan, benefits: e.target.value.split('\n').filter(b => b.trim())})}
                    placeholder="50 קרדיטים לחודש&#10;תמיכה בסיסית&#10;תבניות בסיסיות"
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowPlanDialog(false)}>
                ביטול
              </Button>
              <Button onClick={() => selectedPlan && handlePlanSave(selectedPlan)}>
                שמור שינויים
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Credit Cost Edit Dialog */}
        <Dialog open={showCostDialog} onOpenChange={setShowCostDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>ערוך עלות קרדיטים</DialogTitle>
            </DialogHeader>
            {selectedCost && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>שם הפעולה</Label>
                  <Input 
                    defaultValue={selectedCost.action}
                    onChange={(e) => setSelectedCost({...selectedCost, action: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>תיאור</Label>
                  <Textarea 
                    defaultValue={selectedCost.description}
                    onChange={(e) => setSelectedCost({...selectedCost, description: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>מספר קרדיטים</Label>
                    <Input 
                      type="number"
                      defaultValue={selectedCost.credits}
                      onChange={(e) => setSelectedCost({...selectedCost, credits: parseInt(e.target.value)})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>סטטוס</Label>
                    <Select 
                      defaultValue={selectedCost.isActive ? 'active' : 'inactive'}
                      onValueChange={(value) => setSelectedCost({...selectedCost, isActive: value === 'active'})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">פעיל</SelectItem>
                        <SelectItem value="inactive">לא פעיל</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCostDialog(false)}>
                ביטול
              </Button>
              <Button onClick={() => selectedCost && handleCostSave(selectedCost)}>
                שמור שינויים
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
} 