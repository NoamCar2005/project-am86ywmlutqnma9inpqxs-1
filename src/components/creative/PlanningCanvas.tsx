import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, ArrowLeft, Edit, Play, Image, Type, Mic } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface PlanningCanvasProps {
  projectData: any;
  onComplete: (data: any) => void;
  onBack: () => void;
}

export function PlanningCanvas({ projectData, onComplete, onBack }: PlanningCanvasProps) {
  const [creativePlan, setCreativePlan] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    generateAIPlan();
  }, []);

  const generateAIPlan = async () => {
    setIsLoading(true);
    
    try {
      // Simulate AI planning generation
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Mock AI-generated plan
      const mockPlan = {
        scenes: [
          {
            scene_number: 1,
            type: "video",
            selected_source: "pixabay",
            media_url: "https://example.com/video1.mp4",
            ai_prompt: "ספורטאי שותה מים אחרי אימון",
            text_overlay: "הישאר לחוץ עם המים הטובים ביותר",
            voiceover_text: "כשאתה מתאמן קשה, אתה צריך מים שיתמכו בך",
            voiceover_type: "male_energetic",
            duration: 3
          },
          {
            scene_number: 2,
            type: "photo",
            selected_source: "ai_generated",
            ai_prompt: "בקבוק מים מעוצב על רקע כחול נקי",
            text_overlay: "המוצר החדש שלנו",
            voiceover_text: "הכירו את בקבוק המים המהפכני",
            voiceover_type: "female_professional",
            duration: 2
          },
          {
            scene_number: 3,
            type: "text",
            text_overlay: "זמין עכשיו באתר שלנו!",
            voiceover_text: "הזמינו עכשיו ותקבלו משלוח חינם",
            voiceover_type: "male_energetic",
            duration: 2
          }
        ],
        total_duration: 7,
        style: "modern_dynamic",
        target_audience: "ספורטאים צעירים"
      };
      
      setCreativePlan(mockPlan);
      toast({
        title: "תוכנית מוכנה!",
        description: "ה-AI הכין עבורך תוכנית מפורטת לקריאייטיב"
      });
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה ביצירת התוכנית",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async () => {
    setIsGenerating(true);
    
    try {
      // Simulate creative generation
      await new Promise(resolve => setTimeout(resolve, 4000));
      
      toast({
        title: "מעולה!",
        description: "הקריאייטיב נוצר בהצלחה!"
      });
      
      onComplete({ creativePlan });
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה ביצירת הקריאייטיב",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const getSceneIcon = (type: string) => {
    switch (type) {
      case 'video': return Play;
      case 'photo': return Image;
      case 'text': return Type;
      default: return Play;
    }
  };

  const getSourceBadge = (source: string) => {
    const sourceMap = {
      'pixabay': { label: 'Pixabay', variant: 'secondary' as const },
      'ai_generated': { label: 'AI Generated', variant: 'default' as const },
      'user_uploaded': { label: 'משתמש', variant: 'outline' as const }
    };
    
    const config = sourceMap[source as keyof typeof sourceMap] || { label: source, variant: 'secondary' as const };
    return <Badge variant={config.variant} className="text-xs">{config.label}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
        <div className="text-center">
          <h3 className="text-lg font-medium">ה-AI מכין עבורך תוכנית מותאמת אישית</h3>
          <p className="text-gray-600 mt-1">זה יקח כמה שניות...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Plan Overview */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-2">סקירת התוכנית</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-blue-700 font-medium">משך כולל:</span>
            <p className="text-blue-900">{creativePlan?.total_duration} שניות</p>
          </div>
          <div>
            <span className="text-blue-700 font-medium">סגנון:</span>
            <p className="text-blue-900">{creativePlan?.style}</p>
          </div>
          <div>
            <span className="text-blue-700 font-medium">קהל יעד:</span>
            <p className="text-blue-900">{creativePlan?.target_audience}</p>
          </div>
          <div>
            <span className="text-blue-700 font-medium">סצנות:</span>
            <p className="text-blue-900">{creativePlan?.scenes?.length}</p>
          </div>
        </div>
      </div>

      {/* Scenes */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">סצנות הקריאייטיב</h3>
        <div className="grid gap-4">
          {creativePlan?.scenes?.map((scene: any, index: number) => {
            const SceneIcon = getSceneIcon(scene.type);
            
            return (
              <Card key={scene.scene_number} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <div className="w-8 h-8 bg-brand-primary text-white rounded-full flex items-center justify-center text-sm font-medium">
                        {scene.scene_number}
                      </div>
                      <SceneIcon className="w-4 h-4" />
                      סצנה {scene.scene_number}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      {getSourceBadge(scene.selected_source)}
                      <Badge variant="outline" className="text-xs">
                        {scene.duration}s
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {scene.ai_prompt && (
                    <div>
                      <h5 className="text-sm font-medium text-gray-700 mb-1">תיאור AI:</h5>
                      <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                        {scene.ai_prompt}
                      </p>
                    </div>
                  )}
                  
                  {scene.text_overlay && (
                    <div>
                      <h5 className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                        <Type className="w-3 h-3" />
                        טקסט על המסך:
                      </h5>
                      <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                        {scene.text_overlay}
                      </p>
                    </div>
                  )}
                  
                  {scene.voiceover_text && (
                    <div>
                      <h5 className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                        <Mic className="w-3 h-3" />
                        קריינות ({scene.voiceover_type}):
                      </h5>
                      <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                        {scene.voiceover_text}
                      </p>
                    </div>
                  )}
                  
                  <div className="flex justify-end">
                    <Button variant="ghost" size="sm">
                      <Edit className="w-3 h-3 ml-1" />
                      ערוך סצנה
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-6 border-t">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 ml-2" />
          חזור לבריף
        </Button>
        
        <div className="flex gap-3">
          <Button variant="outline" onClick={generateAIPlan}>
            שנה תוכנית
          </Button>
          <Button 
            onClick={handleApprove}
            disabled={isGenerating}
            className="gradient-primary text-white min-w-[150px]"
          >
            {isGenerating ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                יוצר...
              </div>
            ) : (
              <>
                אשר תוכנית
                <ArrowRight className="w-4 h-4 mr-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}