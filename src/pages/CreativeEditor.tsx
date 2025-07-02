import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Palette, 
  Wand2, 
  Save, 
  Download, 
  Play,
  Image,
  Type,
  Music,
  Settings
} from "lucide-react";

export default function CreativeEditor() {
  const [isCreatomateLoaded, setIsCreatomateLoaded] = useState(false);
  const [isStabilityLoaded, setIsStabilityLoaded] = useState(false);

  useEffect(() => {
    // Simulate SDK loading
    setTimeout(() => {
      setIsCreatomateLoaded(true);
      setIsStabilityLoaded(true);
    }, 2000);
  }, []);

  const handleSave = () => {
    // Save current editor state
    console.log('Saving editor state...');
  };

  const handleExport = () => {
    // Export the edited creative
    console.log('Exporting creative...');
  };

  const handlePreview = () => {
    // Preview the current state
    console.log('Previewing creative...');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <SidebarTrigger />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">עורך קריאייטיבים</h1>
              <p className="text-gray-600 mt-1">ערוך ושפר את הקריאייטיבים שלך</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={handleSave}>
              <Save className="w-4 h-4 ml-2" />
              שמור
            </Button>
            <Button variant="outline" onClick={handlePreview}>
              <Play className="w-4 h-4 ml-2" />
              תצוגה מקדימה
            </Button>
            <Button onClick={handleExport} className="gradient-primary text-white">
              <Download className="w-4 h-4 ml-2" />
              ייצא
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-200px)]">
          {/* Tools Panel */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">כלי עריכה</CardTitle>
              <CardDescription>בחר כלי לעריכת הקריאייטיב</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="creatomate" orientation="vertical" className="w-full">
                <TabsList className="grid w-full grid-cols-1 h-auto">
                  <TabsTrigger value="creatomate" className="justify-start">
                    <Palette className="w-4 h-4 ml-2" />
                    Creatomate
                  </TabsTrigger>
                  <TabsTrigger value="stability" className="justify-start">
                    <Wand2 className="w-4 h-4 ml-2" />
                    Stability AI
                  </TabsTrigger>
                  <TabsTrigger value="media" className="justify-start">
                    <Image className="w-4 h-4 ml-2" />
                    מדיה
                  </TabsTrigger>
                  <TabsTrigger value="text" className="justify-start">
                    <Type className="w-4 h-4 ml-2" />
                    טקסט
                  </TabsTrigger>
                  <TabsTrigger value="audio" className="justify-start">
                    <Music className="w-4 h-4 ml-2" />
                    אודיו
                  </TabsTrigger>
                  <TabsTrigger value="settings" className="justify-start">
                    <Settings className="w-4 h-4 ml-2" />
                    הגדרות
                  </TabsTrigger>
                </TabsList>

                <div className="mt-4">
                  <TabsContent value="creatomate" className="space-y-4">
                    <div className="space-y-3">
                      <h4 className="font-medium">עורך Creatomate</h4>
                      {isCreatomateLoaded ? (
                        <div className="space-y-2">
                          <Button variant="outline" className="w-full justify-start">
                            <Image className="w-4 h-4 ml-2" />
                            הוסף תמונה
                          </Button>
                          <Button variant="outline" className="w-full justify-start">
                            <Type className="w-4 h-4 ml-2" />
                            הוסף טקסט
                          </Button>
                          <Button variant="outline" className="w-full justify-start">
                            <Play className="w-4 h-4 ml-2" />
                            הוסף וידאו
                          </Button>
                          <Button variant="outline" className="w-full justify-start">
                            <Music className="w-4 h-4 ml-2" />
                            הוסף אודיו
                          </Button>
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <div className="w-8 h-8 border-2 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                          <p className="text-sm text-gray-600">טוען עורך...</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="stability" className="space-y-4">
                    <div className="space-y-3">
                      <h4 className="font-medium">Stability AI</h4>
                      {isStabilityLoaded ? (
                        <div className="space-y-2">
                          <Button variant="outline" className="w-full justify-start">
                            <Wand2 className="w-4 h-4 ml-2" />
                            צור תמונה מטקסט
                          </Button>
                          <Button variant="outline" className="w-full justify-start">
                            <Image className="w-4 h-4 ml-2" />
                            ערוך תמונה קיימת
                          </Button>
                          <Button variant="outline" className="w-full justify-start">
                            <Palette className="w-4 h-4 ml-2" />
                            שנה סגנון
                          </Button>
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <div className="w-8 h-8 border-2 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                          <p className="text-sm text-gray-600">טוען AI...</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="media">
                    <div className="space-y-3">
                      <h4 className="font-medium">ניהול מדיה</h4>
                      <Button variant="outline" className="w-full justify-start">
                        <Image className="w-4 h-4 ml-2" />
                        העלה תמונה
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Play className="w-4 h-4 ml-2" />
                        העלה וידאו
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="text">
                    <div className="space-y-3">
                      <h4 className="font-medium">עריכת טקסט</h4>
                      <Button variant="outline" className="w-full justify-start">
                        <Type className="w-4 h-4 ml-2" />
                        הוסף כותרת
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Type className="w-4 h-4 ml-2" />
                        הוסף תת-כותרת
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="audio">
                    <div className="space-y-3">
                      <h4 className="font-medium">עריכת אודיו</h4>
                      <Button variant="outline" className="w-full justify-start">
                        <Music className="w-4 h-4 ml-2" />
                        הוסף מוזיקת רקע
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Music className="w-4 h-4 ml-2" />
                        הוסף קריינות
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="settings">
                    <div className="space-y-3">
                      <h4 className="font-medium">הגדרות</h4>
                      <Button variant="outline" className="w-full justify-start">
                        <Settings className="w-4 h-4 ml-2" />
                        איכות ייצוא
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Settings className="w-4 h-4 ml-2" />
                        פורמט קובץ
                      </Button>
                    </div>
                  </TabsContent>
                </div>
              </Tabs>
            </CardContent>
          </Card>

          {/* Main Editor Area */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle className="text-lg">אזור העריכה</CardTitle>
              <CardDescription>ערוך את הקריאייטיב שלך כאן</CardDescription>
            </CardHeader>
            <CardContent className="h-full">
              <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
                {isCreatomateLoaded && isStabilityLoaded ? (
                  <div className="text-center">
                    <div className="w-16 h-16 bg-brand-primary rounded-lg flex items-center justify-center mx-auto mb-4">
                      <Palette className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">עורך מוכן לשימוש</h3>
                    <p className="text-gray-600 mb-4">בחר כלי מהתפריט הצדדי כדי להתחיל לערוך</p>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-500">✅ Creatomate SDK טעון</p>
                      <p className="text-sm text-gray-500">✅ Stability AI SDK טעון</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">טוען עורכים...</h3>
                    <p className="text-gray-600">מכין את כלי העריכה עבורך</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}