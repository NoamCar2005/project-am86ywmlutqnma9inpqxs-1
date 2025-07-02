import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { 
  User as UserIcon, 
  Bell, 
  Shield, 
  Palette,
  Globe,
  Save
} from "lucide-react";
import { User } from "@/entities";
import { toast } from "@/hooks/use-toast";

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: false,
      marketing: false
    },
    privacy: {
      profilePublic: false,
      analyticsTracking: true
    },
    preferences: {
      language: 'he',
      theme: 'light',
      autoSave: true
    }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);
      
      // Load user preferences if they exist
      if (currentUser.preferences) {
        const userPrefs = JSON.parse(currentUser.preferences);
        setSettings(prev => ({ ...prev, ...userPrefs }));
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      await User.updateProfile({
        preferences: JSON.stringify(settings)
      });
      
      toast({
        title: "הגדרות נשמרו",
        description: "ההגדרות שלך עודכנו בהצלחה"
      });
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בשמירת ההגדרות",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const updateSetting = (category: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [key]: value
      }
    }));
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <SidebarTrigger />
          <h1 className="text-3xl font-bold">הגדרות</h1>
        </div>
        <div className="animate-pulse space-y-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <SidebarTrigger />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">הגדרות</h1>
            <p className="text-gray-600 mt-1">נהל את ההגדרות והעדפות שלך</p>
          </div>
        </div>
        
        <Button 
          onClick={handleSave}
          disabled={isSaving}
          className="gradient-primary text-white"
        >
          {isSaving ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              שומר...
            </div>
          ) : (
            <>
              <Save className="w-4 h-4 ml-2" />
              שמור הגדרות
            </>
          )}
        </Button>
      </div>

      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserIcon className="w-5 h-5" />
            פרופיל אישי
          </CardTitle>
          <CardDescription>
            עדכן את הפרטים האישיים שלך
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">שם מלא</Label>
              <Input
                id="fullName"
                value={user?.full_name || ''}
                onChange={(e) => setUser(prev => ({ ...prev, full_name: e.target.value }))}
                placeholder="הזן את שמך המלא"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">כתובת אימייל</Label>
              <Input
                id="email"
                type="email"
                value={user?.email || ''}
                disabled
                className="bg-gray-50"
              />
              <p className="text-xs text-gray-500">לא ניתן לשנות את כתובת האימייל</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            התראות
          </CardTitle>
          <CardDescription>
            בחר איך תרצה לקבל התראות
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>התראות אימייל</Label>
              <p className="text-sm text-gray-600">קבל התראות על סטטוס הקריאייטיבים באימייל</p>
            </div>
            <Switch
              checked={settings.notifications.email}
              onCheckedChange={(checked) => updateSetting('notifications', 'email', checked)}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>התראות דחיפה</Label>
              <p className="text-sm text-gray-600">קבל התראות דחיפה בדפדפן</p>
            </div>
            <Switch
              checked={settings.notifications.push}
              onCheckedChange={(checked) => updateSetting('notifications', 'push', checked)}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>עדכונים שיווקיים</Label>
              <p className="text-sm text-gray-600">קבל מידע על תכונות חדשות והצעות מיוחדות</p>
            </div>
            <Switch
              checked={settings.notifications.marketing}
              onCheckedChange={(checked) => updateSetting('notifications', 'marketing', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Privacy Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            פרטיות ואבטחה
          </CardTitle>
          <CardDescription>
            נהל את הגדרות הפרטיות שלך
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>פרופיל ציבורי</Label>
              <p className="text-sm text-gray-600">אפשר למשתמשים אחרים לראות את הפרופיל שלך</p>
            </div>
            <Switch
              checked={settings.privacy.profilePublic}
              onCheckedChange={(checked) => updateSetting('privacy', 'profilePublic', checked)}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>מעקב אנליטיקס</Label>
              <p className="text-sm text-gray-600">עזור לנו לשפר את השירות על ידי איסוף נתוני שימוש</p>
            </div>
            <Switch
              checked={settings.privacy.analyticsTracking}
              onCheckedChange={(checked) => updateSetting('privacy', 'analyticsTracking', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            העדפות
          </CardTitle>
          <CardDescription>
            התאם את החוויה שלך
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>שמירה אוטומטית</Label>
              <p className="text-sm text-gray-600">שמור אוטומטית את העבודה שלך בזמן העריכה</p>
            </div>
            <Switch
              checked={settings.preferences.autoSave}
              onCheckedChange={(checked) => updateSetting('preferences', 'autoSave', checked)}
            />
          </div>
          
          <Separator />
          
          <div className="space-y-2">
            <Label>שפה</Label>
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">עברית (ברירת מחדל)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-700">אזור מסוכן</CardTitle>
          <CardDescription>
            פעולות בלתי הפיכות - היזהר!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
            <div>
              <h4 className="font-medium text-red-900">מחק חשבון</h4>
              <p className="text-sm text-red-700">מחק לצמיתות את החשבון וכל הנתונים</p>
            </div>
            <Button variant="destructive" size="sm">
              מחק חשבון
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}