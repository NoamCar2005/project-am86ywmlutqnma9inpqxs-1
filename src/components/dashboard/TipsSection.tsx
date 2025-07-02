import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb, Image, Users, Star, TrendingUp, Target, Zap } from "lucide-react";
import { invokeLLM } from "@/integrations/core";

interface Tip {
  icon: any;
  title: string;
  description: string;
  color: string;
}

export function TipsSection() {
  const [tips, setTips] = useState<Tip[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDailyTips();
  }, []);

  const loadDailyTips = async () => {
    try {
      const response = await invokeLLM({
        prompt: "Generate 3 daily marketing tips in Hebrew for Israeli content creators and businesses. Each tip should include a title and description. Focus on practical, actionable advice. Return as JSON with title and description fields.",
        response_json_schema: {
          type: "object",
          properties: {
            tips: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" }
                }
              }
            }
          }
        }
      });

      const icons = [Image, Users, Star, TrendingUp, Target, Zap];
      const colors = ["bg-blue-500", "bg-green-500", "bg-purple-500", "bg-orange-500", "bg-pink-500", "bg-indigo-500"];

      const dynamicTips = response.tips?.map((tip: any, index: number) => ({
        icon: icons[index % icons.length],
        title: tip.title,
        description: tip.description,
        color: colors[index % colors.length]
      })) || getDefaultTips();

      setTips(dynamicTips);
    } catch (error) {
      console.error('Error loading daily tips:', error);
      setTips(getDefaultTips());
    } finally {
      setIsLoading(false);
    }
  };

  const getDefaultTips = (): Tip[] => [
    {
      icon: Image,
      title: "תמונה איכותית",
      description: "השתמש בתמונות באיכות גבוהה שמציגות את המוצר בצורה ברורה",
      color: "bg-blue-500"
    },
    {
      icon: Users,
      title: "קהל יעד מפורט",
      description: "הגדר בבירור את קהל היעד שלך בבריף כדי לקבל תוצאות מותאמות אישית",
      color: "bg-green-500"
    },
    {
      icon: Star,
      title: "תכונות ייחודיות",
      description: "הדגש את התכונות הייחודיות של המוצר שלך כדי לבדל אותו מהמתחרים",
      color: "bg-purple-500"
    }
  ];

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-yellow-500" />
              טיפים ליצירה מוצלחת
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="bg-gray-200 p-4 rounded-lg animate-pulse h-24"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-500" />
            טיפים ליצירה מוצלחת
          </div>
          <span className="text-xs text-gray-500">עודכן היום</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {tips.map((tip, index) => (
            <div 
              key={index} 
              className="bg-gray-50 p-4 rounded-lg border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-8 h-8 rounded-full ${tip.color} flex items-center justify-center`}>
                  <tip.icon className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-medium text-gray-900">{tip.title}</h3>
              </div>
              <p className="text-sm text-gray-600 text-right">{tip.description}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}