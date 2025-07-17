import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, ArrowLeft, Edit, Play, Image, Type, Mic, Globe, FileText, Check, Eye } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { PlanChangeDialog } from "./PlanChangeDialog";
import { invokeLLM } from "@/integrations/core";
import { SceneEditDialog } from "./SceneEditDialog";
import { getCreativePlanData } from "@/lib/make-integration";
import { useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { triggerCreateCreativeWebhook } from '@/lib/make-integration';
import { CreativePlanLoadingOverlay } from './CreativePlanLoadingOverlay';
import { useNavigate } from 'react-router-dom';

// Translation utility using invokeLLM
async function translateToHebrew(text: string): Promise<string> {
  if (!text) return "";
  // Quick heuristic: if already Hebrew, skip
  if (/^[\u0590-\u05FF\s.,!?\-–—:;()\[\]{}"'\d]+$/.test(text)) return text;
  try {
    const res = await invokeLLM({
      prompt: `Translate the following to Hebrew, keep it short and natural: "${text}"`,
      response_json_schema: { type: "object", properties: { hebrew: { type: "string" } } }
    });
    return res.hebrew || text;
  } catch {
    return text;
  }
}

// Enhanced translation for scene descriptions
async function translateSceneDescription(text: string): Promise<string> {
  if (!text) return "תיאור ויזואלי של הסצנה";
  // Quick heuristic: if already Hebrew, skip
  if (/^[\u0590-\u05FF\s.,!?\-–—:;()\[\]{}"'\d]+$/.test(text)) return text;
  try {
    const res = await invokeLLM({
      prompt: `Translate this image description to Hebrew in a way that Hebrew speakers will easily understand: "${text}". Make it natural and clear.`,
      response_json_schema: { type: "object", properties: { hebrew: { type: "string" } } }
    });
    return res.hebrew || text;
  } catch {
    return text;
  }
}

  // Enhanced translation for scene purposes
  async function translateScenePurpose(text: string): Promise<string> {
    if (!text) return "";
    // Quick heuristic: if already Hebrew, skip
    if (/^[\u0590-\u05FF\s.,!?\-–—:;()\[\]{}"'\d]+$/.test(text)) return text;
    try {
      const res = await invokeLLM({
        prompt: `Translate this scene purpose to simple, easy-to-understand Hebrew: "${text}". Make it clear and natural for Hebrew speakers.`,
        response_json_schema: { type: "object", properties: { hebrew: { type: "string" } } }
      });
      return res.hebrew || text;
    } catch {
      return text;
    }
  }

interface ProjectData {
  brief: string;
  productUrl: string;
  creativeType: string;
  avatar?: any;
  creativePlan?: CreativePlan;
}

interface CreativePlan {
  total_duration?: number;
  scenes?: unknown[];
  style?: string;
  target_audience?: string;
  overall_ad_concept?: string;
  full_voiceover_script?: string;
  creative_type?: string;
}

interface PlanningCanvasProps {
  projectData: ProjectData;
  onComplete: (data: { creativePlan: CreativePlan }) => void;
  onBack: () => void;
  webhookCreativePlanData?: any;
}

function mapWebhookCreativePlanToInternal(webhookData: any): CreativePlan {
  if (!webhookData || !Array.isArray(webhookData.scenes)) {
    console.warn('[mapWebhookCreativePlanToInternal] No scenes array in webhookData:', webhookData);
    return { ...webhookData, scenes: [] };
  }

  // Map scenes to add scene_number and join on_screen_text if needed
  const mappedScenes = webhookData.scenes.map((scene: any, idx: number) => ({
    scene_number: idx + 1,
    scene_name: scene.scene_name || '',
    scene_goal: scene.scene_goal || '',
    visual_concept_description: scene.visual_concept_description || '',
    on_screen_text: Array.isArray(scene.on_screen_text)
      ? scene.on_screen_text.join('\n')
      : (scene.on_screen_text || ''),
    spoken_script_segment: scene.spoken_script_segment || '',
    uses_product_page_media: scene.uses_product_page_media ?? false,
    suggested_media_from_product_page_url: scene.suggested_media_from_product_page_url ?? null,
    // Pass through any other fields
    ...scene,
  }));

  return {
    ...webhookData,
    scenes: mappedScenes,
  };
}

// Template interface for image creatives
interface Template {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  category: string;
}

// Mock templates - 24 total templates (8 per page)
const mockTemplates: Template[] = [
  // Page 1 - Modern & Professional
  {
    id: "template_1",
    name: "תבנית מודרנית",
    description: "עיצוב נקי ומודרני למוצרים טכנולוגיים",
    imageUrl: "https://via.placeholder.com/300x400/1E2849/FFFFFF?text=Template+1",
    category: "modern"
  },
  {
    id: "template_2", 
    name: "תבנית אלגנטית",
    description: "עיצוב אלגנטי למוצרי יוקרה",
    imageUrl: "https://via.placeholder.com/300x400/C3995B/FFFFFF?text=Template+2",
    category: "elegant"
  },
  {
    id: "template_3",
    name: "תבנית צבעונית",
    description: "עיצוב צבעוני ומושך למוצרים צעירים",
    imageUrl: "https://via.placeholder.com/300x400/4F46E5/FFFFFF?text=Template+3", 
    category: "colorful"
  },
  {
    id: "template_4",
    name: "תבנית מינימליסטית",
    description: "עיצוב פשוט ונקי לכל סוג מוצר",
    imageUrl: "https://via.placeholder.com/300x400/10B981/FFFFFF?text=Template+4",
    category: "minimal"
  },
  {
    id: "template_5",
    name: "תבנית דינמית",
    description: "עיצוב דינמי למוצרים אנרגטיים",
    imageUrl: "https://via.placeholder.com/300x400/F59E0B/FFFFFF?text=Template+5",
    category: "dynamic"
  },
  {
    id: "template_6",
    name: "תבנית מקצועית",
    description: "עיצוב מקצועי לעסקים",
    imageUrl: "https://via.placeholder.com/300x400/6B7280/FFFFFF?text=Template+6",
    category: "professional"
  },
  {
    id: "template_7",
    name: "תבנית יצירתית",
    description: "עיצוב יצירתי למוצרים ייחודיים",
    imageUrl: "https://via.placeholder.com/300x400/EC4899/FFFFFF?text=Template+7",
    category: "creative"
  },
  {
    id: "template_8",
    name: "תבנית קלאסית",
    description: "עיצוב קלאסי ונצחי",
    imageUrl: "https://via.placeholder.com/300x400/8B5CF6/FFFFFF?text=Template+8",
    category: "classic"
  },
  // Page 2 - Creative & Artistic
  {
    id: "template_9",
    name: "תבנית אמנותית",
    description: "עיצוב אמנותי עם אלמנטים ויזואליים ייחודיים",
    imageUrl: "https://via.placeholder.com/300x400/FF6B6B/FFFFFF?text=Template+9",
    category: "artistic"
  },
  {
    id: "template_10",
    name: "תבנית אורבנית",
    description: "עיצוב אורבני מודרני למוצרי רחוב",
    imageUrl: "https://via.placeholder.com/300x400/2C3E50/FFFFFF?text=Template+10",
    category: "urban"
  },
  {
    id: "template_11",
    name: "תבנית טבעית",
    description: "עיצוב טבעי עם אלמנטים אורגניים",
    imageUrl: "https://via.placeholder.com/300x400/27AE60/FFFFFF?text=Template+11",
    category: "natural"
  },
  {
    id: "template_12",
    name: "תבנית תעשייתית",
    description: "עיצוב תעשייתי למוצרים חזקים",
    imageUrl: "https://via.placeholder.com/300x400/7F8C8D/FFFFFF?text=Template+12",
    category: "industrial"
  },
  {
    id: "template_13",
    name: "תבנית לוקסוס",
    description: "עיצוב יוקרתי למוצרי פרימיום",
    imageUrl: "https://via.placeholder.com/300x400/D4AF37/FFFFFF?text=Template+13",
    category: "luxury"
  },
  {
    id: "template_14",
    name: "תבנית ספורטיבית",
    description: "עיצוב דינמי למוצרי ספורט",
    imageUrl: "https://via.placeholder.com/300x400/E74C3C/FFFFFF?text=Template+14",
    category: "sporty"
  },
  {
    id: "template_15",
    name: "תבנית רטרו",
    description: "עיצוב רטרו עם נוסטלגיה",
    imageUrl: "https://via.placeholder.com/300x400/9B59B6/FFFFFF?text=Template+15",
    category: "retro"
  },
  {
    id: "template_16",
    name: "תבנית פוטוריסטית",
    description: "עיצוב עתידני עם אלמנטים טכנולוגיים",
    imageUrl: "https://via.placeholder.com/300x400/3498DB/FFFFFF?text=Template+16",
    category: "futuristic"
  },
  // Page 3 - Specialized & Niche
  {
    id: "template_17",
    name: "תבנית ילדים",
    description: "עיצוב צבעוני וחמוד למוצרי ילדים",
    imageUrl: "https://via.placeholder.com/300x400/FF9FF3/FFFFFF?text=Template+17",
    category: "kids"
  },
  {
    id: "template_18",
    name: "תבנית בריאות",
    description: "עיצוב נקי ומהימן למוצרי בריאות",
    imageUrl: "https://via.placeholder.com/300x400/00D2D3/FFFFFF?text=Template+18",
    category: "health"
  },
  {
    id: "template_19",
    name: "תבנית אוכל",
    description: "עיצוב מפתה למוצרי מזון",
    imageUrl: "https://via.placeholder.com/300x400/FF9F43/FFFFFF?text=Template+19",
    category: "food"
  },
  {
    id: "template_20",
    name: "תבנית אופנה",
    description: "עיצוב אופנתי למוצרי לבוש",
    imageUrl: "https://via.placeholder.com/300x400/F368E0/FFFFFF?text=Template+20",
    category: "fashion"
  },
  {
    id: "template_21",
    name: "תבנית בית",
    description: "עיצוב חם ונעים למוצרי בית",
    imageUrl: "https://via.placeholder.com/300x400/54A0FF/FFFFFF?text=Template+21",
    category: "home"
  },
  {
    id: "template_22",
    name: "תבנית טכנולוגיה",
    description: "עיצוב מתקדם למוצרי טכנולוגיה",
    imageUrl: "https://via.placeholder.com/300x400/5F27CD/FFFFFF?text=Template+22",
    category: "tech"
  },
  {
    id: "template_23",
    name: "תבנית יופי",
    description: "עיצוב אלגנטי למוצרי קוסמטיקה",
    imageUrl: "https://via.placeholder.com/300x400/FF6B9D/FFFFFF?text=Template+23",
    category: "beauty"
  },
  {
    id: "template_24",
    name: "תבנית כללית",
    description: "עיצוב רב-תכליתי לכל סוג מוצר",
    imageUrl: "https://via.placeholder.com/300x400/48DB71/FFFFFF?text=Template+24",
    category: "general"
  }
];

export function PlanningCanvas({ projectData, onComplete, onBack, webhookCreativePlanData }: PlanningCanvasProps) {
  const [creativePlan, setCreativePlan] = useState<CreativePlan | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showChangeDialog, setShowChangeDialog] = useState(false);
  const [showSceneEditDialog, setShowSceneEditDialog] = useState(false);
  const [selectedScene, setSelectedScene] = useState<any>(null);
  
  // Template selection state
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  const [currentTemplatePage, setCurrentTemplatePage] = useState(0);
  const [hebrewTranslations, setHebrewTranslations] = useState<{[key: string]: string}>({});
  const [showLoadingOverlay, setShowLoadingOverlay] = useState(false);
  const [creativeUrl, setCreativeUrl] = useState<string | null>(null);
  const navigate = useNavigate();

  // Function to translate visual descriptions to Hebrew for display
  const translateVisualDescription = async (text: string, sceneId: string) => {
    if (!text) return;
    // Quick heuristic: if already Hebrew, skip
    if (/^[\u0590-\u05FF\s.,!?\-–—:;()\[\]{}"'\d]+$/.test(text)) return;
    
    const key = `visual_${sceneId}`;
    if (hebrewTranslations[key]) return; // Already translated
    
    // Set loading state
    setHebrewTranslations(prev => ({
      ...prev,
      [`${key}_loading`]: 'true'
    }));
    
    try {
      const res = await invokeLLM({
        prompt: `Translate this image description to Hebrew in a way that Hebrew speakers will easily understand: "${text}". Make it natural and clear.`,
        response_json_schema: { type: "object", properties: { hebrew: { type: "string" } } }
      });
      setHebrewTranslations(prev => ({
        ...prev,
        [key]: res.hebrew || text,
        [`${key}_loading`]: undefined
      }));
    } catch {
      // Keep original text if translation fails
      setHebrewTranslations(prev => ({
        ...prev,
        [key]: text,
        [`${key}_loading`]: undefined
      }));
    }
  };

  // Function to translate scene purposes to Hebrew for display
  const translateScenePurposeForDisplay = async (text: string, sceneId: string) => {
    if (!text) return;
    // Quick heuristic: if already Hebrew, skip
    if (/^[\u0590-\u05FF\s.,!?\-–—:;()\[\]{}"'\d]+$/.test(text)) return;
    
    const key = `purpose_${sceneId}`;
    if (hebrewTranslations[key]) return; // Already translated
    
    // Set loading state
    setHebrewTranslations(prev => ({
      ...prev,
      [`${key}_loading`]: 'true'
    }));
    
    try {
      const res = await invokeLLM({
        prompt: `Translate this scene purpose to simple, easy-to-understand Hebrew: "${text}". Make it clear and natural for Hebrew speakers.`,
        response_json_schema: { type: "object", properties: { hebrew: { type: "string" } } }
      });
      setHebrewTranslations(prev => ({
        ...prev,
        [key]: res.hebrew || text,
        [`${key}_loading`]: undefined
      }));
    } catch {
      // Keep original text if translation fails
      setHebrewTranslations(prev => ({
        ...prev,
        [key]: text,
        [`${key}_loading`]: undefined
      }));
    }
  };

  // Memoize translated scenes so we don't re-translate on every render
  const translatedScenesRef = useRef<any[]>([]);
  const [scenesTranslated, setScenesTranslated] = useState(false);

  // Determine if this is a video creative type
  const isVideoCreative = () => {
    const videoTypes = ['ugc', 'product_explanation', 'trendy_reel'];
    return videoTypes.includes(projectData.creativeType);
  };

  // Determine if this is an image creative type  
  const isImageCreative = () => {
    const imageTypes = ['carousel', 'product_info', 'reviews'];
    return imageTypes.includes(projectData.creativeType);
  };

  // Check if creative type is static
  const isStaticCreative = () => {
    return isImageCreative();
  };

  console.log('[PlanningCanvas] webhookCreativePlanData:', webhookCreativePlanData);
  console.log('🔍 STEP 6: PlanningCanvas received webhookCreativePlanData:', webhookCreativePlanData);
  console.log('🔍 STEP 6: webhookCreativePlanData type:', typeof webhookCreativePlanData);
  console.log('🔍 STEP 6: webhookCreativePlanData keys:', webhookCreativePlanData ? Object.keys(webhookCreativePlanData) : 'undefined');
  console.log('🔍 STEP 6: webhookCreativePlanData scenes:', webhookCreativePlanData?.scenes);

  useEffect(() => {
    async function translateAllScenes() {
      if (!creativePlan?.scenes) return;
      const translated = await Promise.all(
        creativePlan.scenes.map(async (scene: any) => {
          // Enhanced translation for different field types
          const visualDesc = await translateSceneDescription(scene.visual_concept_description);
          const purpose = await translateScenePurpose(scene.purpose);
          const sceneGoal = await translateToHebrew(scene.scene_goal);
          return {
            ...scene,
            visual_concept_description: visualDesc,
            purpose,
            scene_goal: sceneGoal,
          };
        })
      );
      translatedScenesRef.current = translated;
      setScenesTranslated(true);
    }
    if (creativePlan?.scenes && !scenesTranslated) {
      translateAllScenes();
    }
  }, [creativePlan, scenesTranslated]);

  // Trigger Hebrew translations for display when scenes are loaded
  useEffect(() => {
    if (translatedScenesRef.current.length > 0) {
      translatedScenesRef.current.forEach((scene: any) => {
        // Translate visual descriptions for display
        if (scene.visual_concept_description) {
          translateVisualDescription(scene.visual_concept_description, scene.scene_number.toString());
        }
        // Translate scene purposes for display
        if (scene.purpose) {
          translateScenePurposeForDisplay(scene.purpose, scene.scene_number.toString());
        }
      });
    }
  }, [translatedScenesRef.current.length]);

  useEffect(() => {
    // For static creatives, show templates immediately without waiting for webhook
    if (isStaticCreative()) {
      console.log('[PlanningCanvas] Static creative detected, showing templates immediately');
      setCreativePlan({}); // Empty plan to trigger template UI
      return;
    }

    // Check if we have webhook creative plan data first (only for video creatives)
    if (webhookCreativePlanData && Object.keys(webhookCreativePlanData).length > 0) {
      console.log('[PlanningCanvas] webhookCreativePlanData:', webhookCreativePlanData);
      const mappedPlan = mapWebhookCreativePlanToInternal(webhookCreativePlanData);
      console.log('[PlanningCanvas] mappedPlan:', mappedPlan);
      if (!mappedPlan.scenes || mappedPlan.scenes.length === 0) {
        console.warn('[PlanningCanvas] mappedPlan.scenes is empty!');
      }
      setCreativePlan(mappedPlan);
      toast({
        title: "תכנית נטענה",
        description: "התכנית מהמוצר נטענה אוטומטית. תוכל לעדכן אותה לפי הצורך."
      });
    } else {
      // Try to load from localStorage if prop is missing
      const localPlan = getCreativePlanData();
      if (localPlan && Object.keys(localPlan).length > 0) {
        console.log('🔄 Auto-filling creative plan from localStorage:', localPlan);
        const mappedPlan = mapWebhookCreativePlanToInternal(localPlan);
        setCreativePlan(mappedPlan);
        toast({
          title: "תכנית נטענה",
          description: "התכנית נשמרה מהפעלה קודמת. תוכל לעדכן אותה לפי הצורך."
        });
      } else {
        console.log('🔍 STEP 6: No webhook data or localStorage data available, generating AI plan instead');
        // Generate AI plan if no webhook data
    generateAIPlan();
      }
    }
  }, [webhookCreativePlanData]);

  const generateAIPlan = async () => {
    try {
      // Simulate AI planning generation with more scenes
      await new Promise(resolve => setTimeout(resolve, 300));
      
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
            selected_source: "product_page",
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
    } catch {
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה ביצירת התוכנית",
        variant: "destructive"
      });
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
    setShowLoadingOverlay(true);
    try {
      let payload;
      const creativeType = projectData.creativeType;
      const dataType = isVideoCreative() ? 'video' : 'static';
      if (isVideoCreative()) {
        payload = { ...creativePlan, creativeType, dataType };
      } else if (isImageCreative()) {
        if (!selectedTemplate) {
          toast({ title: 'יש לבחור תבנית', description: 'בחר תבנית לפני יצירת הקריאייטיב', variant: 'destructive' });
          setIsGenerating(false);
          setShowLoadingOverlay(false);
          return;
        }
        payload = { templateId: selectedTemplate.id, creativeType, dataType };
      }
      const response = await triggerCreateCreativeWebhook(payload);
      if (response.success && response.creativeUrl) {
        setCreativeUrl(response.creativeUrl);
        toast({ title: 'הקריאייטיב נוצר!', description: 'הקריאייטיב מוכן לצפייה.' });
        // Navigate to preview page with the creative URL
        navigate('/create', { state: { creativeUrl: response.creativeUrl } });
      } else {
        toast({ title: 'שגיאה', description: response.error || 'אירעה שגיאה ביצירת הקריאייטיב', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'שגיאה', description: 'אירעה שגיאה ביצירת הקריאייטיב', variant: 'destructive' });
    } finally {
      setIsGenerating(false);
      setShowLoadingOverlay(false);
    }
  };

  const handlePlanChange = async (changeRequest: string) => {
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
    }
  };

  const handleSceneEdit = (scene: any) => {
    setSelectedScene(scene);
    setShowSceneEditDialog(true);
  };

  const handleSceneSave = (updatedScene: any) => {
    if (creativePlan && creativePlan.scenes) {
      const updatedScenes = creativePlan.scenes.map((scene: any) => 
        scene.scene_number === updatedScene.scene_number ? updatedScene : scene
      );
      setCreativePlan({ ...creativePlan, scenes: updatedScenes });
      toast({
        title: "סצנה עודכנה",
        description: "השינויים נשמרו בהצלחה"
      });
    }
    setShowSceneEditDialog(false);
    setSelectedScene(null);
  };

  const handleTemplateSelect = async (template: Template) => {
    setSelectedTemplate(template);
    setShowTemplateDialog(false);
    
    // Save template ID to database
    try {
      // Here you would save the template ID to your database
      console.log('Saving template ID to database:', template.id);
      
      // For now, we'll save it to localStorage as a placeholder
      const templateData = {
        templateId: template.id,
        templateName: template.name,
        selectedAt: new Date().toISOString(),
        projectId: projectData.brief // Using brief as project identifier for now
      };
      
      localStorage.setItem('selectedTemplate', JSON.stringify(templateData));
      
      toast({
        title: "תבנית נבחרה",
        description: `התבנית "${template.name}" נבחרה ונשמרה בהצלחה`
      });
    } catch (error) {
      console.error('Error saving template:', error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בשמירת התבנית",
        variant: "destructive"
      });
    }
  };

  const handlePreviewTemplate = (template: Template) => {
    setPreviewTemplate(template);
    setShowTemplateDialog(true);
  };

  const getSceneIcon = (type: string) => {
    switch (type) {
      case 'video': return Play;
      case 'photo': return Image;
      case 'text': return Type;
      default: return Play;
    }
  };

  // Helper for short general audience (2-3 words, Hebrew)
  function getGeneralAudience(avatar: any): string {
    if (!avatar) return "לא צויין";
    // Prefer interests, then age+gender
    if (avatar.interests) {
      const interests = Array.isArray(avatar.interests) ? avatar.interests : avatar.interests.split(",");
      return interests[0]?.trim() || "לא צויין";
    }
    if (avatar.age && avatar.gender) {
      let gender = avatar.gender === "male" ? "גברים" : avatar.gender === "female" ? "נשים" : "כולם";
      let age = Array.isArray(avatar.age) ? avatar.age[0] : avatar.age;
      return `${gender}, ${age}`;
    }
    return avatar.name || "לא צויין";
  }

  // Media source tag logic (Hebrew, only 3 options)
  function getMediaSourceTag(scene: any) {
    let label = "";
    let color = "";
    if (scene.selected_source === "ai_generated") {
      label = "מדיה בינה מלאכותית";
      color = "bg-purple-600 border-l-purple-600";
    } else if (scene.selected_source === "product_page" || scene.uses_product_page_media) {
      label = "מדיה מהמשתמש";
      color = "bg-green-600 border-l-green-600";
    } else {
      label = "מדיה ממאגר";
      color = "bg-blue-600 border-l-blue-600";
    }
    return { label, color };
  }

  console.log('[PlanningCanvas] creativePlan state:', creativePlan);

  if (!creativePlan || (isVideoCreative() && creativePlan.scenes && !scenesTranslated)) {
    return null;
  }

  // Render different UI based on creative type
  if (isImageCreative()) {
    return (
      <div className="space-y-6 text-right" dir="rtl">
        {/* Plan Overview for Image Creatives */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Image className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-blue-900">בחירת תבנית</CardTitle>
                <CardDescription className="text-blue-700">
                  בחר תבנית מתאימה לקריאייטיב שלך
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center p-3 bg-white rounded-lg border border-blue-200">
                <div className="text-2xl font-bold text-blue-600">{mockTemplates.length}</div>
                <div className="text-sm text-blue-700">תבניות זמינות</div>
                <div className="text-xs text-blue-600 mt-1">סה"כ</div>
              </div>
              <div className="text-center p-3 bg-white rounded-lg border border-blue-200">
                <div className="text-lg font-bold text-green-600 capitalize">
                  {projectData.creativeType === 'carousel' ? 'קרוסלה' : 
                   projectData.creativeType === 'product_info' ? 'מידע על המוצר' : 
                   projectData.creativeType === 'reviews' ? 'ביקורות' : 'סטטי'}
                </div>
                <div className="text-sm text-green-700">סוג קריאייטיב</div>
                <div className="text-xs text-green-600 mt-1">פורמט</div>
              </div>
              <div className="text-center p-3 bg-white rounded-lg border border-blue-200">
                <div className="text-lg font-bold text-purple-600">
                  {selectedTemplate ? selectedTemplate.name : 'לא נבחרה'}
                </div>
                <div className="text-sm text-purple-700">תבנית נבחרת</div>
                <div className="text-xs text-purple-600 mt-1">סטטוס</div>
              </div>
              <div className="text-center p-3 bg-white rounded-lg border border-blue-200">
                <div className="text-lg font-bold text-orange-600">
                  {getGeneralAudience(projectData.avatar)}
                </div>
                <div className="text-sm text-orange-700">קהל יעד</div>
                <div className="text-xs text-orange-600 mt-1">מטרה</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Template Selection */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Image className="w-5 h-5 text-brand-primary" />
              תבניות זמינות
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>עמוד {currentTemplatePage + 1} מתוך 3</span>
            </div>
          </div>
          
          {/* Template Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {mockTemplates.slice(currentTemplatePage * 8, (currentTemplatePage + 1) * 8).map((template) => (
              <Card 
                key={template.id} 
                className={`relative group hover:shadow-lg transition-all duration-200 cursor-pointer border-2 ${
                  selectedTemplate?.id === template.id 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-blue-300'
                }`}
                onClick={() => handlePreviewTemplate(template)}
              >
                <CardContent className="p-4">
                  <div className="relative">
                    <img 
                      src={template.imageUrl} 
                      alt={template.name}
                      className="w-full h-48 object-cover rounded-lg mb-3"
                    />
                    {selectedTemplate?.id === template.id && (
                      <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4" />
                      </div>
                    )}
                  </div>
        <div className="text-center">
                    <h4 className="font-semibold text-gray-900 mb-1">{template.name}</h4>
                    <p className="text-sm text-gray-600">{template.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Pagination */}
          <div className="flex items-center justify-center gap-2 mt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentTemplatePage(Math.max(0, currentTemplatePage - 1))}
              disabled={currentTemplatePage === 0}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              קודם
            </Button>
            
            <div className="flex gap-1">
              {[0, 1, 2].map((page) => (
                <Button
                  key={page}
                  variant={currentTemplatePage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentTemplatePage(page)}
                  className="w-8 h-8 p-0"
                >
                  {page + 1}
                </Button>
              ))}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentTemplatePage(Math.min(2, currentTemplatePage + 1))}
              disabled={currentTemplatePage === 2}
              className="flex items-center gap-2"
            >
              הבא
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-6 border-t">
          <div className="flex gap-3">
            <Button 
              onClick={handleApprove}
              disabled={!selectedTemplate}
              className="gradient-primary text-white min-w-[150px] hover:text-brand-light disabled:opacity-50"
            >
              {isGenerating ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  יוצר...
                </div>
              ) : (
                <>
                  אשר תבנית
                  <ArrowRight className="w-4 h-4 mr-2" />
                </>
              )}
            </Button>
          </div>
          
          <Button variant="outline" onClick={onBack} className="hover:bg-brand-primary hover:text-brand-light">
            <ArrowLeft className="w-4 h-4 ml-2" />
            חזור לאווטאר
          </Button>
        </div>

        {/* Template Preview Dialog */}
        <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-right">{previewTemplate?.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <img 
                src={previewTemplate?.imageUrl} 
                alt={previewTemplate?.name}
                className="w-full h-96 object-cover rounded-lg"
              />
              <p className="text-gray-600 text-right">{previewTemplate?.description}</p>
            </div>
            <DialogFooter className="flex gap-2">
              <Button variant="outline" onClick={() => setShowTemplateDialog(false)}>
                ביטול
              </Button>
              <Button 
                onClick={() => previewTemplate && handleTemplateSelect(previewTemplate)}
                className="bg-brand-primary text-white"
              >
                בחר תבנית זו
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Original video creative UI
  return (
    <>
      <CreativePlanLoadingOverlay show={showLoadingOverlay} />
    <div className="space-y-6 text-right" dir="rtl">
        {/* Plan Overview */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600" />
          </div>
          <div>
              <CardTitle className="text-blue-900">סקירת תכנית</CardTitle>
              <CardDescription className="text-blue-700">
                סקירה מקיפה של התוכנית שה-AI הכין עבורך
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center p-3 bg-white rounded-lg border border-blue-200">
              <div className="text-2xl font-bold text-blue-600">{creativePlan?.total_duration || 0}</div>
              <div className="text-sm text-blue-700">שניות</div>
              <div className="text-xs text-blue-600 mt-1">אורך קריאייטיב</div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg border border-blue-200">
              <div className="text-2xl font-bold text-green-600">{creativePlan?.scenes?.length || 0}</div>
              <div className="text-sm text-green-700">סצנות</div>
              <div className="text-xs text-green-600 mt-1">סה"כ</div>
          </div>
            <div className="text-center p-3 bg-white rounded-lg border border-blue-200">
              <div className="text-lg font-bold text-purple-600 capitalize">{creativePlan?.creative_type || projectData.creativeType || 'וידאו'}</div>
              <div className="text-sm text-purple-700">סוג קריאייטיב</div>
              <div className="text-xs text-purple-600 mt-1">פורמט</div>
          </div>
            <div className="text-center p-3 bg-white rounded-lg border border-blue-200">
              <div className="text-lg font-bold text-orange-600">
                {creativePlan?.target_audience || getGeneralAudience(projectData.avatar)}
              </div>
              <div className="text-sm text-orange-700">קהל יעד</div>
              <div className="text-xs text-orange-600 mt-1">מטרה</div>
        </div>
      </div>
        </CardContent>
      </Card>

      {/* Scenes */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium flex items-center gap-2">
          <Play className="w-5 h-5 text-brand-primary" />
          סצנות הקריאייטיב
        </h3>
        <div className="grid gap-4">
          {translatedScenesRef.current.map((scene: any, index: number) => {
            const SceneIcon = getSceneIcon(scene.type);
            const { label: mediaLabel, color: mediaColor } = getMediaSourceTag(scene);
            return (
              <Card key={scene.scene_number} className={`relative group hover:shadow-lg transition-all duration-200 border-l-4 ${mediaColor.replace('border-l-', 'border-l-')} bg-white border border-gray-200`}>
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-brand-primary text-white rounded-full flex items-center justify-center text-sm font-bold shadow-md">
                        {scene.scene_number}
                      </div>
                      <div>
                        <CardTitle className="text-lg font-semibold text-gray-900">
                      סצנה {scene.scene_number}
                    </CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <SceneIcon className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-600">
                            {scene.type === 'video' ? 'וידאו' : scene.type === 'photo' ? 'תמונה' : 'טקסט'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {/* Media source tag */}
                      <Badge variant="default" className={`text-xs font-medium px-3 py-1 ${mediaColor.replace('border-l-', 'bg-')} text-white shadow-sm`}>
                        {mediaLabel}
                      </Badge>
                      {/* Duration */}
                      <div className="flex items-center gap-1 text-sm text-gray-600 bg-gray-50 px-2 py-1 rounded-md">
                        <span className="text-xs">⏱️</span>
                        <span className="font-medium">{scene.duration || 0}s</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Scene Purpose */}
                  {scene.purpose && (
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                      <h5 className="text-sm font-semibold text-blue-900 mb-2 flex items-center gap-2">
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        מטרת הסצנה
                      </h5>
                      <p className="text-sm text-blue-800 leading-relaxed">
                        {hebrewTranslations[`purpose_${scene.scene_number}`] || scene.purpose}
                        {hebrewTranslations[`purpose_${scene.scene_number}_loading`] && (
                          <span className="inline-block ml-2">
                            <div className="w-3 h-3 border border-blue-500 border-t-transparent rounded-full animate-spin" />
                          </span>
                        )}
                      </p>
                      {hebrewTranslations[`purpose_${scene.scene_number}`] && (
                        <p className="text-xs text-gray-500 mt-2 italic">
                          תרגום אוטומטי לעברית
                        </p>
                      )}
                    </div>
                  )}

                  {/* Scene Goal Badge */}
                  {scene.scene_goal && (
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-800 border-amber-300 font-medium">
                        {scene.scene_goal}
                      </Badge>
                    </div>
                  )}

                  {/* Image Description */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h5 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                      <span className="w-2 h-2 bg-gray-500 rounded-full"></span>
                      תיאור התמונה
                    </h5>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {hebrewTranslations[`visual_${scene.scene_number}`] || scene.visual_concept_description || "תיאור התמונה"}
                      {hebrewTranslations[`visual_${scene.scene_number}_loading`] && (
                        <span className="inline-block ml-2">
                          <div className="w-3 h-3 border border-gray-500 border-t-transparent rounded-full animate-spin" />
                        </span>
                      )}
                    </p>
                    {hebrewTranslations[`visual_${scene.scene_number}`] && (
                      <p className="text-xs text-gray-500 mt-2 italic">
                        תרגום אוטומטי לעברית
                      </p>
                    )}
                    </div>
                  
                  {/* On Screen Text */}
                  {scene.on_screen_text && (
                    <div className="bg-green-50 rounded-lg p-4">
                      <h5 className="text-sm font-semibold text-green-800 mb-2 flex items-center gap-2">
                        <Type className="w-4 h-4" />
                        טקסט על המסך
                      </h5>
                      <p className="text-sm text-green-700 bg-white p-3 rounded border border-green-200 whitespace-pre-line">
                        {scene.on_screen_text}
                      </p>
                    </div>
                  )}
                  
                  {/* Voiceover */}
                  {scene.spoken_script_segment && (
                    <div className="bg-purple-50 rounded-lg p-4">
                      <h5 className="text-sm font-semibold text-purple-800 mb-2 flex items-center gap-2">
                        <Mic className="w-4 h-4" />
                        קריינות
                      </h5>
                      <p className="text-sm text-purple-700 bg-white p-3 rounded border border-purple-200">
                        {scene.spoken_script_segment}
                      </p>
                    </div>
                  )}
                  
                  {/* Edit Button */}
                  <div className="flex justify-end pt-2">
                    <Button 
                      variant="default" 
                      size="sm" 
                      className="bg-brand-primary hover:bg-brand-primary/90 text-white shadow-md hover:shadow-lg transition-all duration-200 px-6 py-2 rounded-lg font-medium"
                      onClick={() => handleSceneEdit(scene)}
                    >
                      <Edit className="w-4 h-4 ml-2" />
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
          חזור לאווטאר
        </Button>
      </div>

      {/* Plan Change Dialog */}
      <PlanChangeDialog
        open={showChangeDialog}
        onOpenChange={setShowChangeDialog}
        onApplyChange={handlePlanChange}
        currentPlan={creativePlan}
      />

      {/* Scene Edit Dialog */}
      <SceneEditDialog
        open={showSceneEditDialog}
        onOpenChange={setShowSceneEditDialog}
        scene={selectedScene}
        onSave={handleSceneSave}
      />
    </div>
    </>
  );
}