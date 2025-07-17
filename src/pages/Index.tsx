import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowRight, 
  Sparkles, 
  Users, 
  TrendingUp, 
  Zap,
  Play,
  Plus
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { initializeSampleProducts } from "@/lib/make-integration";
import { toast } from "@/hooks/use-toast";

export function Index() {
  const navigate = useNavigate();
  const [isInitializing, setIsInitializing] = useState(false);

  const handleInitializeSamples = async () => {
    setIsInitializing(true);
    try {
      initializeSampleProducts();
      
      // Add test functions to global scope for debugging
      (window as any).testProductSelector = () => {
        import('../lib/test-product-selector').then(module => {
          module.testProductSelector();
        });
      };
      
      (window as any).verifyProductSelectorState = () => {
        import('../lib/test-product-selector').then(module => {
          module.verifyProductSelectorState();
        });
      };
      
      console.log('🧪 Test functions added to window:');
      console.log('  - testProductSelector()');
      console.log('  - verifyProductSelectorState()');
      
      toast({
        title: "מוצרים לדוגמה נוצרו",
        description: "ניתן כעת לבדוק את בורר המוצרים"
      });
    } catch (error) {
      console.error('Error initializing samples:', error);
    } finally {
      setIsInitializing(false);
    }
  };

  const features = [
    {
      icon: Sparkles,
      title: "יצירת אווטארים חכמים",
      description: "AI מתקדם יוצר אווטארים מותאמים אישית למוצר שלך"
    },
    {
      icon: Users,
      title: "קהל יעד מדויק",
      description: "זיהוי אוטומטי של קהל היעד האופטימלי"
    },
    {
      icon: TrendingUp,
      title: "ניתוח ביצועים",
      description: "מעקב אחר ביצועי הקמפיינים שלך בזמן אמת"
    },
    {
      icon: Zap,
      title: "יצירה מהירה",
      description: "יצירת תוכן איכותי תוך דקות במקום שעות"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <Badge variant="secondary" className="mb-4 text-sm">
            🚀 גרסה חדשה זמינה
          </Badge>
          
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            AdCraft
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              AI
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            פלטפורמת ה-AI המתקדמת ליצירת תוכן שיווקי חכם. 
            צור אווטארים מותאמים אישית ותוכן איכותי תוך דקות.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button 
              size="lg" 
              onClick={() => navigate('/create')}
              className="gradient-primary text-white px-8 py-3 text-lg hover:scale-105 transition-transform"
            >
              <Play className="w-5 h-5 ml-2" />
              התחל ליצור
            </Button>
            
            <Button 
              variant="outline" 
              size="lg"
              onClick={handleInitializeSamples}
              disabled={isInitializing}
              className="px-8 py-3 text-lg border-2 hover:bg-blue-50"
            >
              {isInitializing ? (
                <>
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin ml-2" />
                  יוצר מוצרים לדוגמה...
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5 ml-2" />
                  צור מוצרים לדוגמה
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            למה AdCraft AI?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            הטכנולוגיה המתקדמת ביותר ליצירת תוכן שיווקי חכם ומותאם אישית
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="text-center hover:shadow-lg transition-shadow duration-300 border-0 shadow-md">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-lg font-semibold text-gray-900">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 md:p-12 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            מוכן להתחיל?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            הצטרף לאלפי אנשי שיווק שכבר משתמשים ב-AdCraft AI
          </p>
          <Button 
            size="lg" 
            variant="secondary"
            onClick={() => navigate('/create')}
            className="text-lg px-8 py-3 hover:scale-105 transition-transform"
          >
            <ArrowRight className="w-5 h-5 ml-2" />
            התחל עכשיו
          </Button>
        </div>
      </div>
    </div>
  );
}