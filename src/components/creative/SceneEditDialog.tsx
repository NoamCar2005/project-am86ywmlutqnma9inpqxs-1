import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Play, Image, Type, Mic, Clock } from "lucide-react";

export function SceneEditDialog({ open, onOpenChange, scene, onSave }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  scene: any;
  onSave: (scene: any) => void;
}) {
  const [editedScene, setEditedScene] = useState<any>(null);

  useEffect(() => {
    if (scene) {
      setEditedScene({ ...scene });
    }
  }, [scene]);

  if (!scene || !editedScene) return null;

  const handleSave = () => {
    onSave(editedScene);
  };

  const getSceneIcon = (type: string) => {
    switch (type) {
      case 'video': return Play;
      case 'photo': return Image;
      case 'text': return Type;
      default: return Play;
    }
  };

  const SceneIcon = getSceneIcon(scene.type);

  const voiceoverTypes = [
    { value: "male_energetic", label: "גבר אנרגטי" },
    { value: "female_professional", label: "אישה מקצועית" },
    { value: "male_calm", label: "גבר רגוע" },
    { value: "female_friendly", label: "אישה ידידותית" }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center gap-2 text-xl font-bold text-brand-primary">
            <div className="w-8 h-8 bg-brand-primary text-white rounded-full flex items-center justify-center text-sm font-medium">
              {scene.scene_number}
            </div>
            <SceneIcon className="w-5 h-5" />
            עריכת סצנה {scene.scene_number}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Scene Type Badge */}
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-sm">
              {scene.type === 'video' ? 'וידאו' : scene.type === 'photo' ? 'תמונה' : 'טקסט'}
            </Badge>
            <Badge variant="outline" className="text-sm">
              {scene.duration} שניות
            </Badge>
          </div>

          {/* AI Prompt */}
          <div className="space-y-2">
            <Label htmlFor="ai_prompt" className="text-base font-medium flex items-center gap-2">
              <Image className="w-4 h-4" />
              תיאור התמונה/וידאו
            </Label>
            <Textarea
              id="ai_prompt"
              value={editedScene.ai_prompt || ""}
              onChange={(e) => setEditedScene(prev => ({ ...prev, ai_prompt: e.target.value }))}
              placeholder="תאר את מה שתרצה לראות בסצנה זו..."
              className="min-h-[80px] text-right"
              dir="rtl"
            />
            <p className="text-sm text-gray-500">
              תיאור מפורט שיעזור ל-AI ליצור את המדיה המתאימה (הטקסט ייתרגם אוטומטית לעברית למשתמש)
            </p>
          </div>

          {/* Text Overlay */}
          <div className="space-y-2">
            <Label htmlFor="text_overlay" className="text-base font-medium flex items-center gap-2">
              <Type className="w-4 h-4" />
              טקסט על המסך
            </Label>
            <Textarea
              id="text_overlay"
              value={editedScene.text_overlay || ""}
              onChange={(e) => setEditedScene(prev => ({ ...prev, text_overlay: e.target.value }))}
              placeholder="הטקסט שיופיע על המסך..."
              className="min-h-[80px] text-right"
              dir="rtl"
            />
            <p className="text-sm text-gray-500">
              הטקסט שיוצג על גבי המדיה (אפשר להשתמש ב-Enter לשורות חדשות)
            </p>
          </div>

          {/* Voiceover Text */}
          <div className="space-y-2">
            <Label htmlFor="voiceover_text" className="text-base font-medium flex items-center gap-2">
              <Mic className="w-4 h-4" />
              טקסט קריינות
            </Label>
            <Textarea
              id="voiceover_text"
              value={editedScene.voiceover_text || ""}
              onChange={(e) => setEditedScene(prev => ({ ...prev, voiceover_text: e.target.value }))}
              placeholder="הטקסט שייקרא בקריינות..."
              className="min-h-[80px] text-right"
              dir="rtl"
            />
            <p className="text-sm text-gray-500">
              הטקסט שייקרא בקול על ידי הקריין (הטקסט ייתרגם אוטומטית לעברית למשתמש)
            </p>
          </div>

          {/* Voiceover Type */}
          <div className="space-y-2">
            <Label htmlFor="voiceover_type" className="text-base font-medium flex items-center gap-2">
              <Mic className="w-4 h-4" />
              סוג קריינות
            </Label>
            <Select
              value={editedScene.voiceover_type || ""}
              onValueChange={(value) => setEditedScene(prev => ({ ...prev, voiceover_type: value }))}
            >
              <SelectTrigger className="text-right">
                <SelectValue placeholder="בחר סוג קריינות" />
              </SelectTrigger>
              <SelectContent>
                {voiceoverTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <Label htmlFor="duration" className="text-base font-medium flex items-center gap-2">
              <Clock className="w-4 h-4" />
              משך הסצנה (שניות)
            </Label>
            <Input
              id="duration"
              type="number"
              min="1"
              max="10"
              value={editedScene.duration || ""}
              onChange={(e) => setEditedScene(prev => ({ ...prev, duration: parseInt(e.target.value) || 1 }))}
              className="text-right"
              dir="rtl"
            />
            <p className="text-sm text-gray-500">
              משך הסצנה בשניות (1-10 שניות)
            </p>
          </div>
        </div>

        <DialogFooter className="pt-6">
          <div className="flex gap-3 w-full">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              ביטול
            </Button>
            <Button 
              onClick={handleSave}
              className="flex-1 gradient-primary text-white hover:text-brand-light"
            >
              שמור שינויים
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 