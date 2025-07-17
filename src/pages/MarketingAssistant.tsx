import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { 
  MessageCircle, 
  Send, 
  Sparkles, 
  TrendingUp,
  Target,
  Lightbulb,
  BarChart3
} from "lucide-react";
import { invokeLLM } from "@/integrations/core";
import { toast } from "@/hooks/use-toast";

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function MarketingAssistant() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    // Load initial suggestions
    loadSuggestions();
    // Add welcome message
    setMessages([{
      id: '1',
      type: 'assistant',
      content: 'שלום! אני עוזר השיווק שלך. אני כאן כדי לעזור לך ליצור אסטרטגיות שיווק מנצחות, לנתח קהלי יעד ולהציע רעיונות יצירתיים לקמפיינים. איך אוכל לעזור לך היום?',
      timestamp: new Date()
    }]);
  }, []);

  const loadSuggestions = async () => {
    try {
      const response = await invokeLLM({
        prompt: "Generate 4 marketing strategy suggestions in Hebrew for Israeli businesses. Each suggestion should be practical and actionable. Return as a JSON array of strings.",
        response_json_schema: {
          type: "object",
          properties: {
            suggestions: {
              type: "array",
              items: { type: "string" }
            }
          }
        }
      });
      
      setSuggestions(response.suggestions || [
        "צור תוכן וירלי ברשתות החברתיות",
        "בנה קמפיין אימייל מרקטינג מותאם אישית",
        "פתח שותפויות עם אינפלואנסרים רלוונטיים",
        "השתמש בפרסום ממוקד בפייסבוק ואינסטגרם"
      ]);
    } catch (error) {
      console.error('Error loading suggestions:', error);
      setSuggestions([
        "צור תוכן וירלי ברשתות החברתיות",
        "בנה קמפיין אימייל מרקטינג מותאם אישית",
        "פתח שותפויות עם אינפלואנסרים רלוונטיים",
        "השתמש בפרסום ממוקד בפייסבוק ואינסטגרם"
      ]);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const response = await invokeLLM({
        prompt: `You are a marketing assistant for Israeli businesses. Respond in Hebrew. User message: ${inputMessage}. Provide helpful, actionable marketing advice.`,
      });

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בתקשורת עם עוזר השיווק",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputMessage(suggestion);
  };

  return (
    <div className="p-6 space-y-6 text-right" dir="rtl">
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-brand-primary" />
            עוזר השיווק
          </h1>
          <p className="text-gray-600 mt-1">קבל עצות שיווק מותאמות אישית ואסטרטגיות מנצחות</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="w-5 h-5" />
                פעולות מהירות
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-end hover:bg-brand-primary hover:text-brand-light"
                onClick={() => setInputMessage("איך אני יכול לשפר את הקמפיין שלי?")}
              >
                <TrendingUp className="w-4 h-4 ml-2" />
                שפר קמפיין
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-end hover:bg-brand-primary hover:text-brand-light"
                onClick={() => setInputMessage("עזור לי לנתח את קהל היעד שלי")}
              >
                <BarChart3 className="w-4 h-4 ml-2" />
                נתח קהל יעד
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-end hover:bg-brand-primary hover:text-brand-light"
                onClick={() => setInputMessage("תן לי רעיונות לתוכן יצירתי")}
              >
                <Lightbulb className="w-4 h-4 ml-2" />
                רעיונות יצירתיים
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">הצעות היום</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {suggestions.map((suggestion, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  className="w-full text-right justify-end h-auto p-2 hover:bg-brand-primary hover:text-brand-light"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  <span className="text-xs">{suggestion}</span>
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Chat Interface */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              שיחה עם עוזר השיווק
            </CardTitle>
            <CardDescription>
              שאל שאלות, קבל עצות ובנה אסטרטגיות שיווק מנצחות
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Messages */}
            <div className="h-96 overflow-y-auto space-y-4 p-4 bg-gray-50 rounded-lg">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      message.type === 'user'
                        ? 'bg-brand-primary text-white'
                        : 'bg-white border shadow-sm'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString('he-IL')}
                    </p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-end">
                  <div className="bg-white border shadow-sm p-3 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="flex gap-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="שאל את עוזר השיווק..."
                className="flex-1"
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                disabled={isLoading}
              />
              <Button 
                onClick={handleSendMessage}
                disabled={isLoading || !inputMessage.trim()}
                className="gradient-primary text-white hover:text-brand-light"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}