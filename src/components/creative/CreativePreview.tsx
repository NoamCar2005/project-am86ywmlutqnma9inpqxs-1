import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Download, Share2, Edit, Play, Heart, Star } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Creative, Project } from "@/entities";

interface ProjectData {
  brief: string;
  productUrl: string;
  creativeType: string;
  creativePlan: CreativePlan;
}

interface CreativePlan {
  total_duration?: number;
  scenes?: unknown[];
}

interface CreativePreviewProps {
  projectData: ProjectData;
  onBack: () => void;
  creativeUrl?: string;
}

export function CreativePreview({ projectData, onBack, creativeUrl }: CreativePreviewProps) {
  const location = useLocation();
  const creativeUrlFromState = creativeUrl || location.state?.creativeUrl;
  const [videoUrl, setVideoUrl] = useState<string>(creativeUrlFromState || "");
  const [isLoading, setIsLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [createdCreativeId, setCreatedCreativeId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (creativeUrlFromState) {
      setVideoUrl(creativeUrlFromState);
      setIsLoading(false);
      toast({
        title: "הקריאייטיב מוכן!",
        description: "הקריאייטיב שלך נוצר ומוכן לצפייה"
      });
    } else {
      // Simulate video rendering completion (legacy fallback)
      setTimeout(() => {
        setVideoUrl("https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4");
        setIsLoading(false);
        toast({
          title: "הקריאייטיב מוכן!",
        description: "הסרטון שלך נוצר בהצלחה ומוכן לצפייה"
      });
    }, 2000);
    }
  }, [creativeUrlFromState]);

  const handleDownload = () => {
    if (videoUrl) {
      const link = document.createElement('a');
      link.href = videoUrl;
      link.download = 'creative-video.mp4';
      link.click();
      
      toast({
        title: "הורדה החלה",
        description: "הקובץ מתחיל להיות מורד למחשב שלך"
      });
    }
  };

  const handleShare = async () => {
    if (navigator.share && videoUrl) {
      try {
        await navigator.share({
          title: 'הקריאייטיב שלי',
          text: 'צפו בקריאייטיב החדש שיצרתי עם AdCraftAI',
          url: videoUrl
        });
      } catch (error) {
        // Fallback to copying URL
        navigator.clipboard.writeText(videoUrl);
        toast({
          title: "קישור הועתק",
          description: "הקישור הועתק ללוח. תוכל לשתף אותו עכשיו"
        });
      }
    } else {
      navigator.clipboard.writeText(videoUrl);
      toast({
        title: "קישור הועתק",
        description: "הקישור הועתק ללוח. תוכל לשתף אותו עכשיו"
      });
    }
  };

  const toggleFavorite = async () => {
    if (createdCreativeId) {
      try {
        await Creative.update(createdCreativeId, { is_favorite: !isFavorite });
        setIsFavorite(!isFavorite);
        toast({
          title: isFavorite ? "הוסר מהמועדפים" : "נוסף למועדפים",
          description: isFavorite ? "הקריאייטיב הוסר מרשימת המועדפים" : "הקריאייטיב נוסף לרשימת המועדפים"
        });
      } catch (error) {
        toast({
          title: "שגיאה",
          description: "אירעה שגיאה בעדכון המועדפים",
          variant: "destructive"
        });
      }
    }
  };

  const handleCreateNewCreative = async () => {
    // Validation
    if (!projectData.brief || !projectData.productUrl || !projectData.creativeType || !projectData.creativePlan) {
      toast({
        title: "שגיאה",
        description: "אנא ודא שכל השדות הדרושים מלאים (בריף, קישור מוצר, סוג קריאייטיב ותוכנית AI)",
        variant: "destructive"
      });
      return;
    }
    if (!videoUrl) {
      toast({
        title: "שגיאה",
        description: "הווידאו עדיין לא נטען. המתן לסיום הרנדור ונסה שוב.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Create project using local service
      const projectPayload = {
        title: `פרויקט ${new Date().toLocaleDateString('he-IL')}`,
        brief: projectData.brief,
        product_url: projectData.productUrl,
        creative_type: projectData.creativeType,
        status: "completed",
        creative_plan_json: JSON.stringify(projectData.creativePlan),
        tags: ["ai-generated", projectData.creativeType]
      };
      
      console.log('Creating project with payload:', projectPayload);
      const project = await Project.create(projectPayload);
      console.log('Project created successfully:', project);

      // Create creative using local service
      const creativePayload = {
        project_id: project.id,
        title: `קריאייטיב ${projectData.creativeType}`,
        status: "rendered",
        video_url: videoUrl,
        thumbnail_url: "https://via.placeholder.com/320x180/1E2849/FFFFFF?text=Creative+Thumbnail",
        duration: projectData.creativePlan?.total_duration || 0,
        ai_prompts: JSON.stringify(projectData.creativePlan?.scenes || []),
        tags: ["ai-generated", projectData.creativeType],
        is_favorite: false
      };
      
      console.log('Creating creative with payload:', creativePayload);
      const creative = await Creative.create(creativePayload);
      console.log('Creative created successfully:', creative);

      setCreatedCreativeId(creative.id);

      toast({
        title: "קריאייטיב נשמר!",
        description: "הקריאייטיב נוסף להיסטוריה שלך"
      });

      // Navigate to create new creative
      navigate('/create');
    } catch (error) {
      console.error('Error creating creative:', error);
      
      let errorMessage = "אירעה שגיאה בשמירת הקריאייטיב.";
      if (error && typeof error === 'object') {
        if ('message' in error && typeof error.message === 'string') {
          errorMessage += `\n${error.message}`;
        } else if (typeof error.toString === 'function') {
          errorMessage += `\n${error.toString()}`;
        }
      }
      
      toast({
        title: "שגיאה",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4 text-right" dir="rtl">
        <div className="w-16 h-16 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
        <div className="text-center">
          <h3 className="text-xl font-medium">הקריאייטיב שלך ברנדור...</h3>
          <p className="text-gray-600 mt-1">זה יקח עוד כמה רגעים</p>
          <div className="mt-4 bg-gray-200 rounded-full h-2 w-64 mx-auto">
            <div className="bg-brand-primary h-2 rounded-full animate-pulse" style={{ width: '75%' }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-right" dir="rtl">
      {/* Video Preview */}
      <Card className="overflow-hidden">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Play className="w-5 h-5" />
                הקריאייטיב שלך מוכן!
              </CardTitle>
              <CardDescription>
                צפה בתוצאה הסופית ובחר מה לעשות הלאה
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleFavorite}
              className={isFavorite ? "text-yellow-500" : "text-gray-400"}
            >
              <Star className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="aspect-video bg-black rounded-lg overflow-hidden">
            {videoUrl ? (
              videoUrl.match(/\.(mp4|webm|ogg)$/i) ? (
              <video 
                controls 
                className="w-full h-full"
                poster="/placeholder-video-thumbnail.jpg"
              >
                <source src={videoUrl} type="video/mp4" />
                הדפדפן שלך לא תומך בתגית הווידאו.
              </video>
              ) : (
                <img src={videoUrl} alt="Creative" className="w-full h-full object-contain bg-white" />
              )
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white">
                <Play className="w-16 h-16 opacity-50" />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Creative Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">פרטי הקריאייטיב</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <span className="text-sm font-medium text-gray-700">בריף מקורי:</span>
              <p className="text-sm text-gray-600 mt-1">{projectData.brief}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-700">סוג קריאייטיב:</span>
              <p className="text-sm text-gray-600 mt-1">{projectData.creativeType}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-700">משך:</span>
              <p className="text-sm text-gray-600 mt-1">{projectData.creativePlan?.total_duration} שניות</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-700">סצנות:</span>
              <p className="text-sm text-gray-600 mt-1">{projectData.creativePlan?.scenes?.length} סצנות</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">פעולות</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button onClick={handleDownload} className="w-full hover:bg-brand-primary hover:text-brand-light" variant="outline">
              <Download className="w-4 h-4 ml-2" />
              הורד קובץ MP4
            </Button>
            <Button onClick={handleShare} className="w-full hover:bg-brand-primary hover:text-brand-light" variant="outline">
              <Share2 className="w-4 h-4 ml-2" />
              שתף קריאייטיב
            </Button>
            <Button asChild className="w-full hover:bg-brand-primary hover:text-brand-light" variant="outline">
              <Link to="/editor">
                <Edit className="w-4 h-4 ml-2" />
                ערוך בעורך
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-6 border-t">
        <Button variant="outline" onClick={onBack} className="hover:bg-brand-primary hover:text-brand-light">
          <ArrowLeft className="w-4 h-4 ml-2" />
          חזור לתכנון
        </Button>
        
        <div className="flex gap-3">
          <Button asChild variant="outline" className="hover:bg-brand-primary hover:text-brand-light">
            <Link to="/history">
              צפה בהיסטוריה
            </Link>
          </Button>
          <Button onClick={handleCreateNewCreative} className="gradient-primary text-white hover:text-brand-light">
            צור קריאייטיב חדש
          </Button>
        </div>
      </div>
    </div>
  );
}