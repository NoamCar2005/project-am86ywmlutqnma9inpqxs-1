import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, ArrowLeft, Edit, Play, Image, Type, Mic } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { PlanChangeDialog } from "./PlanChangeDialog";
import { invokeLLM } from "@/integrations/core";

interface PlanningCanvasProps {
  projectData: any;
  onComplete: (data: any) => void;
  onBack: () => void;
}

export function PlanningCanvas({ projectData, onComplete, onBack }: PlanningCanvasProps) {
  const [creativePlan, setCreativePlan] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showChangeDialog, setShowChangeDialog] = useState(false);

  useEffect(() => {
    generateAIPlan();
  }, []);

  const generateAIPlan = async () => {
    setIsLoading(true);
    
    try {
      // Simulate AI planning generation with more scenes
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Generate scene purposes using AI
      const scenePurposes = await generateScenePurposes();
      
      // Mock AI-generated plan with 5+ scenes
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
            duration: 3,
            purpose: scenePurposes[0] || "פתיחה אנרגטית שתופסת את תשומת הלב של הצופה ומציגה את הבעיה"
          },
          {
            scene_number: 2,
            type: "photo",
            selected_source: "ai_generated",
            ai_prompt: "בקבוק מים מעוצב על רקע כחול נקי",
            text_overlay: "המוצר החדש שלנו",
            voiceover_text: "הכירו את בקבוק המים המהפכני",
            voiceover_type: "female_professional",
            duration: 2,
            purpose: scenePurposes[1] || "הצגת המוצר בצורה ויזואלית מרשימה שמדגישה את העיצוב והאיכות"
          },
          {
            scene_number: 3,
            type: "video",
            selected_source: "pixabay",
            ai_prompt: "אנשים משתמשים במוצר בסביבות שונות",
            text_overlay: "מתאים לכל סגנון חיים",
            voiceover_text: "בין אם אתם בחדר כושר, בעבודה או בטיול",
            voiceover_type: "male_energetic",
            duration: 3,
            purpose: scenePurposes[2] || "הדגמת הרבגוניות של המוצר ואיך הוא מתאים לקהלים שונים"
          },
          {
            scene_number: 4,
            type: "text",
            text_overlay: "✓ ללא BPA\n✓ שומר על טמפרטורה\n✓ עמיד ואיכותי",
            voiceover_text: "עם כל התכונות שאתם צריכים",
            voiceover_type: "female_professional",
            duration: 2,
            purpose: scenePurposes[3] || "הדגשת היתרונות והתכונות הייחודיות של המוצר"
          },
          {
            scene_number: 5,
            type: "video",
            selected_source: "ai_generated",
            ai_prompt: "לקוחות מרוצים עם המוצר",
            text_overlay: "לקוחות מרוצים ברחבי הארץ",
            voiceover_text: "הצטרפו לאלפי לקוחות מרוצים",
            voiceover_type: "male_energetic",
            duration: 2,
            purpose: scenePurposes[4] || "בניית אמון באמצעות הוכחה חברתית ולקוחות מרוצים"
          },
          {
            scene_number: 6,
            type: "text",
            text_overlay: "הזמינו עכשיו!\nמשלוח חינם עד הבית",
            voiceover_text: "הזמינו עכשיו ותקבלו משלוח חינם",
            voiceover_type: "female_professional",
            duration: 2,
            purpose: scenePurposes[5] || "קריאה לפעולה ברורה עם תמריץ (משלוח חינם) לעידוד רכישה"
          }
        ],
        total_duration: 14,
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

  const generateScenePurposes = async () => {
    try {
      const response = await invokeLLM({
        prompt: "Generate 6 scene purposes in Hebrew for a product marketing video. Each purpose should explain the role of that scene in the overall creative strategy. Return as JSON array of strings.",
        response_json_schema: {
          type: "object",
          properties: {
            purposes: {
              type: "array",
              items: { type: "string" }
            }
          }
        }
      });
      return response.purposes || [];
    } catch (error) {
      console.error('Error generating scene purposes:', error);
      return [];
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

  const handlePlanChange = async (changeRequest: string) => {
    setIsLoading(true);
    try {
      // Simulate plan modification based on user request
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real implementation, you would send the change request to your AI service
      // and get back a modified plan
      
      toast({
        title: "תוכנית עודכנה",
        description: "השינויים יושמו בהצלחה"
      });
      
      // Regenerate the plan (in real implementation, this would be the modified plan)
      await generateAIPlan();
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בעדכון התוכנית",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
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
      <div className="flex flex-col items-center justify-center py-12 space-y-4 text-right" dir="rtl">
        <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
        <div className="text-center">
          <h3 className="text-lg font-medium">ה-AI מכין עבורך תוכנית מותאמת אישית</h3>
          <p className="text-gray-600 mt-1">זה יקח כמה שניות...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-right" dir="rtl">
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
                  {/* Scene Purpose */}
                  {scene.purpose && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <h5 className="text-sm font-medium text-yellow-800 mb-1">מטרת הסצנה:</h5>
                      <p className="text-sm text-yellow-700">{scene.purpose}</p>
                    </div>
                  )}

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
                      <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded whitespace-pre-line">
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
                    <Button variant="ghost" size="sm" className="hover:bg-brand-primary hover:text-brand-light">
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

      {/* Action Buttons - Swapped alignment */}
      <div className="flex items-center justify-between pt-6 border-t">
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setShowChangeDialog(true)} className="hover:bg-brand-primary hover:text-brand-light">
            שנה תוכנית
          </Button>
          <Button 
            onClick={handleApprove}
            disabled={isGenerating}
            className="gradient-primary text-white min-w-[150px] hover:text-brand-light"
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
        
        <Button variant="outline" onClick={onBack} className="hover:bg-brand-primary hover:text-brand-light">
          <ArrowLeft className="w-4 h-4 ml-2" />
          חזור לבריף
        </Button>
      </div>

      {/* Plan Change Dialog */}
      <PlanChangeDialog
        open={showChangeDialog}
        onOpenChange={setShowChangeDialog}
        onApplyChange={handlePlanChange}
        currentPlan={creativePlan}
      />
    </div>
  );
}