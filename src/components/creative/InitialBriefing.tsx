import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowRight, Link as LinkIcon, Video, Image, Layers } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface InitialBriefingProps {
  onComplete: (data: any) => void;
  initialData: any;
}

export function InitialBriefing({ onComplete, initialData }: InitialBriefingProps) {
  const [formData, setFormData] = useState({
    brief: initialData.brief || "",
    productUrl: initialData.productUrl || "",
    creativeType: initialData.creativeType || "video"
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.brief.trim()) {
      toast({
        title: "שגיאה",
        description: "אנא הזן בריף קריאייטיב",
        variant: "destructive"
      });
      return;
    }

    if (!formData.productUrl.trim()) {
      toast({
        title: "שגיאה", 
        description: "אנא הזן URL של המוצר",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulate API call to backend for AI planning
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "מעולה!",
        description: "הבריף נשמר בהצלחה. עובר לשלב התכנון..."
      });
      
      onComplete(formData);
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בשמירת הבריף",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const creativeTypes = [
    { id: "video", label: "סרטון", icon: Video, description: "סרטון קצר לרשתות חברתיות" },
    { id: "image_set", label: "סט תמונות", icon: Image, description: "מספר תמונות למודעות" },
    { id: "carousel", label: "קרוסלה", icon: Layers, description: "קרוסלה אינטראקטיבית" }
  ];

  return (
    <div className="space-y-6 text-right" dir="rtl">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Creative Brief */}
        <div className="space-y-2">
          <Label htmlFor="brief" className="text-base font-medium">
            בריף קריאייטיב *
          </Label>
          <Textarea
            id="brief"
            placeholder="לדוגמה: צור מודעה לרשתות חברתיות עבור בקבוק המים החדש שלי שמתאים לספורטאים"
            value={formData.brief}
            onChange={(e) => setFormData(prev => ({ ...prev, brief: e.target.value }))}
            className="min-h-[100px] text-right"
            dir="rtl"
          />
          <p className="text-sm text-gray-500">
            תאר בקצרה איך תרצה לקדם את המוצר שלך
          </p>
        </div>

        {/* Product URL */}
        <div className="space-y-2">
          <Label htmlFor="productUrl" className="text-base font-medium">
            URL מוצר *
          </Label>
          <div className="relative">
            <LinkIcon className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="productUrl"
              type="url"
              placeholder="https://example.com/product"
              value={formData.productUrl}
              onChange={(e) => setFormData(prev => ({ ...prev, productUrl: e.target.value }))}
              className="pr-10"
              dir="ltr"
            />
          </div>
          <p className="text-sm text-gray-500">
            קישור לעמוד המוצר שלך - נשתמש בו כדי להבין טוב יותר את המוצר
          </p>
        </div>

        {/* Creative Type */}
        <div className="space-y-4">
          <Label className="text-base font-medium">סוג קריאייטיב *</Label>
          <RadioGroup
            value={formData.creativeType}
            onValueChange={(value) => setFormData(prev => ({ ...prev, creativeType: value }))}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            {creativeTypes.map((type) => (
              <div key={type.id} className="relative">
                <RadioGroupItem
                  value={type.id}
                  id={type.id}
                  className="peer sr-only"
                />
                <Label
                  htmlFor={type.id}
                  className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-popover p-4 hover:bg-brand-primary hover:text-brand-light peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-colors"
                >
                  <type.icon className="mb-3 h-6 w-6" />
                  <div className="text-center">
                    <div className="font-medium">{type.label}</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {type.description}
                    </div>
                  </div>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-4">
          <Button 
            type="submit" 
            size="lg" 
            disabled={isLoading}
            className="gradient-primary text-white min-w-[200px] hover:text-brand-light"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                מכין תוכנית...
              </div>
            ) : (
              <>
                המשך לתכנון
                <ArrowRight className="w-4 h-4 mr-2" />
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}