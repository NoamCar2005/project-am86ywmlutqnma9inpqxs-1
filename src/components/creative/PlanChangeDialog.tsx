import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Lightbulb } from "lucide-react";
import { invokeLLM } from "@/integrations/core";
import { toast } from "@/hooks/use-toast";

interface PlanChangeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApplyChange: (change: string) => void;
  currentPlan: unknown;
}

export function PlanChangeDialog({ open, onOpenChange, onApplyChange, currentPlan }: PlanChangeDialogProps) {
  const [userInput, setUserInput] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

  useEffect(() => {
    if (open) {
      loadSuggestions();
    }
  }, [open]);

  const loadSuggestions = async () => {
    setIsLoadingSuggestions(true);
    try {
      const response = await invokeLLM({
        prompt: `Based on this creative plan: ${JSON.stringify(currentPlan)}, generate 4 specific improvement suggestions in Hebrew. Each suggestion should be actionable and improve the creative's effectiveness. Return as JSON array of strings.`,
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
        "הוסף קריאה לפעולה חזקה יותר בסוף הסרטון",
        "שנה את הסגנון הוויזואלי להיות יותר דינמי",
        "הוסף מוזיקת רקע שמתאימה לקהל היעד",
        "קצר את הסצנה הראשונה כדי לתפוס תשומת לב מהר יותר"
      ]);
    } catch (error) {
      console.error('Error loading suggestions:', error);
      setSuggestions([
        "הוסף קריאה לפעולה חזקה יותר בסוף הסרטון",
        "שנה את הסגנון הוויזואלי להיות יותר דינמי",
        "הוסף מוזיקת רקע שמתאימה לקהל היעד",
        "קצר את הסצנה הראשונה כדי לתפוס תשומת לב מהר יותר"
      ]);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const handleApplyChange = () => {
    if (userInput.trim()) {
      onApplyChange(userInput);
      setUserInput("");
      onOpenChange(false);
      toast({
        title: "השינוי יושם",
        description: "התוכנית עודכנה בהתאם לבקשתך"
      });
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setUserInput(suggestion);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl text-right" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-right">
            <Sparkles className="w-5 h-5 text-brand-primary" />
            מה לשנות בתוכנית?
          </DialogTitle>
          <DialogDescription className="text-right">
            תאר את השינויים שתרצה לבצע בתוכנית הקריאייטיב או בחר מההצעות של עוזר השיווק
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Marketing Assistant Suggestions */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-yellow-500" />
              <h4 className="font-medium">הצעות של עוזר השיווק</h4>
            </div>
            
            {isLoadingSuggestions ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-200 rounded-lg animate-pulse"></div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {suggestions.map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="h-auto p-3 text-right justify-start hover:bg-brand-primary hover:text-brand-light"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    <span className="text-sm">{suggestion}</span>
                  </Button>
                ))}
              </div>
            )}
          </div>

          {/* User Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">או תאר בעצמך את השינוי הרצוי:</label>
            <Textarea
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="לדוגמה: הוסף יותר אנרגיה לסצנה הראשונה, שנה את הצבעים להיות יותר חמים..."
              className="min-h-[100px] text-right"
              dir="rtl"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              ביטול
            </Button>
            <Button 
              onClick={handleApplyChange}
              disabled={!userInput.trim()}
              className="gradient-primary text-white hover:text-brand-light"
            >
              יישם שינוי
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}