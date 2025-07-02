import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Download, Share2, Edit, Play, Heart, Star } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

interface CreativePreviewProps {
  projectData: any;
  onBack: () => void;
}

export function CreativePreview({ projectData, onBack }: CreativePreviewProps) {
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    // Simulate video rendering completion
    setTimeout(() => {
      setVideoUrl("https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4");
      setIsLoading(false);
      toast({
        title: "הקריאייטיב מוכן!",
        description: "הסרטון שלך נוצר בהצלחה ומוכן לצפייה"
      });
    }, 2000);
  }, []);

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

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    toast({
      title: isFavorite ? "הוסר מהמועדפים" : "נוסף למועדפים",
      description: isFavorite ? "הקריאייטיב הוסר מרשימת המועדפים" : "הקריאייטיב נוסף לרשימת המועדפים"
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
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
    <div className="space-y-6">
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
              <video 
                controls 
                className="w-full h-full"
                poster="/placeholder-video-thumbnail.jpg"
              >
                <source src={videoUrl} type="video/mp4" />
                הדפדפן שלך לא תומך בתגית הווידאו.
              </video>
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
            <Button onClick={handleDownload} className="w-full" variant="outline">
              <Download className="w-4 h-4 ml-2" />
              הורד קובץ MP4
            </Button>
            <Button onClick={handleShare} className="w-full" variant="outline">
              <Share2 className="w-4 h-4 ml-2" />
              שתף קריאייטיב
            </Button>
            <Button asChild className="w-full" variant="outline">
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
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 ml-2" />
          חזור לתכנון
        </Button>
        
        <div className="flex gap-3">
          <Button asChild variant="outline">
            <Link to="/history">
              צפה בהיסטוריה
            </Link>
          </Button>
          <Button asChild className="gradient-primary text-white">
            <Link to="/create">
              צור קריאייטיב חדש
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}