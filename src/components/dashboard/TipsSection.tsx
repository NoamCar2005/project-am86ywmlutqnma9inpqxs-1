import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb, Image, Users, Star } from "lucide-react";

export function TipsSection() {
  const tips = [
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