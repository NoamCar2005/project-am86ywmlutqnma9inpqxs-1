import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight, ArrowLeft, Users, User, CheckCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { type AvatarData as WebhookAvatarData, type ProductData, triggerCreativePlanWebhook, getProductData, saveCreativePlanData } from "@/lib/make-integration";
import { getAvatarData } from "@/lib/make-integration";
import React from "react"; // Added missing import

interface AvatarData {
  name: string;
  age: string[];
  gender: string;
  interests: string;
  painPoints: string;
  objections: string;
  dreamOutcome: string;
  productId?: string;
}

interface AvatarStepProps {
  onComplete: (data: { avatar: AvatarData; creativePlan?: any }) => void;
  onBack: () => void;
  initialData?: AvatarData;
  webhookAvatarData?: WebhookAvatarData;
  productData?: ProductData;
  creativeBrief?: string;
  creativeType?: string;
  onWebhookStart?: () => void;
  onWebhookComplete?: (creativePlan?: any) => void;
}

export function AvatarStep({ onComplete, onBack, initialData, webhookAvatarData, productData, creativeBrief, creativeType, onWebhookStart, onWebhookComplete }: AvatarStepProps) {
  console.log('🔍 [AvatarStep] Component rendered with props:', { initialData, webhookAvatarData, productData, creativeBrief, creativeType });
  
  // Log received data for debugging
  React.useEffect(() => {
    console.log('[AvatarStep] webhookAvatarData:', webhookAvatarData);
    console.log('[AvatarStep] initialData:', initialData);
    console.log('[AvatarStep] productData:', productData);
  }, [webhookAvatarData, initialData, productData]);

  const [formData, setFormData] = useState<AvatarData>({
    name: initialData?.name || "",
    age: initialData?.age || [],
    gender: initialData?.gender || "",
    interests: initialData?.interests || "",
    painPoints: initialData?.painPoints || "",
    objections: initialData?.objections || "",
    dreamOutcome: initialData?.dreamOutcome || "",
    productId: initialData?.productId || webhookAvatarData?.productId || productData?.id
  });

  // Auto-fill form with webhook data if available
  useEffect(() => {
    // Run auto-fill if webhookAvatarData exists and initialData is missing or empty
    if (
      webhookAvatarData &&
      (!initialData || Object.keys(initialData).length === 0)
    ) {
      console.log('🔄 Webhook avatar data available, will auto-fill');
      // Add a small delay to ensure component is fully mounted
      const timer = setTimeout(() => {
        console.log('🔄 Auto-filling avatar data:', webhookAvatarData);
        // Helper function to map Hebrew gender to English
        const mapGender = (hebrew: string | string[]) => {
          // If gender is an array, use the first value (or join if needed)
          const value = Array.isArray(hebrew) ? hebrew[0] : hebrew;
          if (value === "זכר") return "male";
          if (value === "נקבה") return "female";
          if (value === "שני המינים") return "both";
          return "";
        };
        // Helper function to map age range string or array to array of valid ranges
        const mapAge = (ageStr: string | string[]) => {
          if (!ageStr) return [];
          if (Array.isArray(ageStr)) {
            // Already an array, just return as-is (or filter/validate if needed)
            return ageStr;
          }
          // Otherwise, treat as a string and split
          const [start, end] = ageStr.split("-").map(Number);
          const ranges = [
            { value: "18-24", min: 18, max: 24 },
            { value: "25-34", min: 25, max: 34 },
            { value: "35-44", min: 35, max: 44 },
            { value: "45-54", min: 45, max: 54 },
            { value: "55-64", min: 55, max: 64 },
            { value: "65+", min: 65, max: 120 }
          ];
          return ranges
            .filter(r => r.min <= end && r.max >= start)
            .map(r => r.value);
        };
        // Helper function to safely join arrays to strings
        const joinArray = (arr: any) => {
          if (Array.isArray(arr)) {
            return arr.join(", ");
          }
          return arr || "";
        };
        const newFormData = {
          name: webhookAvatarData.name || "",
          age: mapAge(webhookAvatarData.age),
          gender: mapGender(webhookAvatarData.gender),
          interests: joinArray(webhookAvatarData.interests),
          painPoints: joinArray(webhookAvatarData.painPoints),
          objections: joinArray(webhookAvatarData.objections),
          dreamOutcome: joinArray(webhookAvatarData.dreamOutcome),
          productId: webhookAvatarData.productId || productData?.id
        };
        console.log('🔄 New form data to set:', newFormData);
        setFormData(newFormData);
        toast({
          title: "נתוני אווטאר נטענו",
          description: "הנתונים מהמוצר נטענו אוטומטית. תוכל לעדכן אותם לפי הצורך."
        });
      }, 500); // 500ms delay to ensure proper timing
      return () => clearTimeout(timer);
    } else {
      console.log('🔄 No webhook avatar data or initial data exists');
    }
  }, [webhookAvatarData, initialData]);

  // Find existing avatars for this product (if any)
  const [existingAvatars, setExistingAvatars] = useState<any[]>([]);
  const [avatarNameExists, setAvatarNameExists] = useState(false);
  const [isWebhookLoading, setIsWebhookLoading] = useState(false);
  const [selectedAvatarId, setSelectedAvatarId] = useState<string | null>(null);

  useEffect(() => {
    // If initialData, webhookAvatarData, or productData has productId, find avatars for this product
    const productId = initialData?.productId || webhookAvatarData?.productId || productData?.id;
    if (productId) {
      const allAvatars = getAvatarData();
      const related = allAvatars.filter(a => a.productId === productId);
      setExistingAvatars(related);
      
      // Set the most recent avatar as selected by default
      if (related.length > 0 && !selectedAvatarId) {
        const sortedAvatars = related.sort((a, b) => {
          const dateA = new Date(a.createdAt || 0);
          const dateB = new Date(b.createdAt || 0);
          return dateB.getTime() - dateA.getTime(); // Most recent first
        });
        setSelectedAvatarId(sortedAvatars[0].id || null);
      }
      
      // Check if the current name exists
      setAvatarNameExists(!!related.find(a => a.name.trim() === formData.name.trim()));
    } else {
      setExistingAvatars([]);
      setAvatarNameExists(false);
      setSelectedAvatarId(null);
    }
  }, [initialData, webhookAvatarData, productData, formData.name, selectedAvatarId]);

  // Show warning if hasAvatar is true but no data is available
  const hasAvatarFlag = (initialData && (initialData as any).hasAvatar) || (webhookAvatarData && Object.keys(webhookAvatarData).length > 0);
  const noAvatarData = hasAvatarFlag && (!webhookAvatarData || Object.keys(webhookAvatarData).length === 0);

  const ageRanges = [
    { value: "18-24", label: "18-24" },
    { value: "25-34", label: "25-34" },
    { value: "35-44", label: "35-44" },
    { value: "45-54", label: "45-54" },
    { value: "55-64", label: "55-64" },
    { value: "65+", label: "65+" }
  ];

  const genderOptions = [
    { value: "male", label: "גבר" },
    { value: "female", label: "אישה" },
    { value: "both", label: "שני המינים" }
  ];

  // Function to handle avatar selection and auto-fill form
  const handleAvatarSelection = (avatarId: string) => {
    const selectedAvatar = existingAvatars.find(a => a.id === avatarId);
    if (selectedAvatar) {
      setSelectedAvatarId(avatarId);
      
      // Helper function to map Hebrew gender to English
      const mapGender = (hebrew: string | string[]) => {
        const value = Array.isArray(hebrew) ? hebrew[0] : hebrew;
        if (value === "זכר") return "male";
        if (value === "נקבה") return "female";
        if (value === "שני המינים") return "both";
        return "";
      };
      
      // Helper function to map age range string or array to array of valid ranges
      const mapAge = (ageStr: string | string[]) => {
        if (!ageStr) return [];
        if (Array.isArray(ageStr)) {
          return ageStr;
        }
        const [start, end] = ageStr.split("-").map(Number);
        const ranges = [
          { value: "18-24", min: 18, max: 24 },
          { value: "25-34", min: 25, max: 34 },
          { value: "35-44", min: 35, max: 44 },
          { value: "45-54", min: 45, max: 54 },
          { value: "55-64", min: 55, max: 64 },
          { value: "65+", min: 65, max: 120 }
        ];
        return ranges
          .filter(r => r.min <= end && r.max >= start)
          .map(r => r.value);
      };
      
      // Helper function to safely join arrays to strings
      const joinArray = (arr: any) => {
        if (Array.isArray(arr)) {
          return arr.join(", ");
        }
        return arr || "";
      };
      
      const newFormData = {
        name: selectedAvatar.name || "",
        age: mapAge(selectedAvatar.age),
        gender: mapGender(selectedAvatar.gender),
        interests: joinArray(selectedAvatar.interests),
        painPoints: joinArray(selectedAvatar.painPoints),
        objections: joinArray(selectedAvatar.objections),
        dreamOutcome: joinArray(selectedAvatar.dreamOutcome),
        productId: selectedAvatar.productId || productData?.id
      };
      
      setFormData(newFormData);
      toast({
        title: "אווטאר נבחר",
        description: `נטענו את נתוני האווטאר "${selectedAvatar.name}"`
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🔍 [AvatarStep] handleSubmit called - starting validation');
    console.log('🔍 [AvatarStep] formData:', formData);
    console.log('🔍 [AvatarStep] avatarNameExists:', avatarNameExists);
    console.log('🔍 [AvatarStep] webhookAvatarData:', webhookAvatarData);
    console.log('🔍 [AvatarStep] initialData:', initialData);
    console.log('🔍 [AvatarStep] productData:', productData);
    
    // Block duplicate avatar name for this product
    if (avatarNameExists) {
      console.log('[AvatarStep] Validation failed: avatarNameExists');
      toast({
        title: "שגיאה",
        description: "אווטאר בשם זה כבר קיים עבור מוצר זה!",
        variant: "destructive"
      });
      return;
    }

    if (!formData.name.trim()) {
      console.log('[AvatarStep] Validation failed: name missing');
      toast({
        title: "שגיאה",
        description: "אנא הזן שם לאווטאר",
        variant: "destructive"
      });
      return;
    }

    if (!formData.age || formData.age.length === 0) {
      console.log('[AvatarStep] Validation failed: age missing');
      toast({
        title: "שגיאה", 
        description: "אנא בחר טווח גילאים",
        variant: "destructive"
      });
      return;
    }

    if (!formData.gender) {
      console.log('[AvatarStep] Validation failed: gender missing');
      toast({
        title: "שגיאה", 
        description: "אנא בחר מין",
        variant: "destructive"
      });
      return;
    }

    if (!formData.interests.trim()) {
      console.log('[AvatarStep] Validation failed: interests missing');
      toast({
        title: "שגיאה", 
        description: "אנא הזן תחומי עניין",
        variant: "destructive"
      });
      return;
    }

    if (!formData.painPoints.trim()) {
      console.log('[AvatarStep] Validation failed: painPoints missing');
      toast({
        title: "שגיאה", 
        description: "אנא הזן נקודות כאב",
        variant: "destructive"
      });
      return;
    }

    if (!formData.objections.trim()) {
      console.log('[AvatarStep] Validation failed: objections missing');
      toast({
        title: "שגיאה", 
        description: "אנא הזן התנגדויות",
        variant: "destructive"
      });
      return;
    }

    if (!formData.dreamOutcome.trim()) {
      console.log('[AvatarStep] Validation failed: dreamOutcome missing');
      toast({
        title: "שגיאה", 
        description: "אנא הזן תוצאת החלום",
        variant: "destructive"
      });
      return;
    }

    console.log('🔍 [AvatarStep] All form validations passed, now looking for product');

    // Get the product data for this avatar
    const allProducts = getProductData();
    console.log('🔍 [AvatarStep] All products from localStorage:', allProducts);
    
    // Try multiple ways to find the product
    let product = null;
    
    // First, try to find by formData.productId
    if (formData.productId) {
      product = allProducts.find(p => p.id === formData.productId);
      console.log('[AvatarStep] Found product by formData.productId:', product?.name);
    }
    
    // If not found, try to find by webhookAvatarData.productId
    if (!product && webhookAvatarData?.productId) {
      product = allProducts.find(p => p.id === webhookAvatarData.productId);
      console.log('[AvatarStep] Found product by webhookAvatarData.productId:', product?.name);
    }
    
    // If still not found, try to find by initialData.productId
    if (!product && initialData?.productId) {
      product = allProducts.find(p => p.id === initialData.productId);
      console.log('[AvatarStep] Found product by initialData.productId:', product?.name);
    }
    
    // If still not found, try to find by productData prop
    if (!product && productData) {
      product = productData;
      console.log('[AvatarStep] Found product by productData prop:', product.name);
    }
    
    // If still not found, log all available information for debugging
    if (!product) {
      console.log('[AvatarStep] No product found in any of the expected locations');
      console.log('[AvatarStep] formData.productId:', formData.productId);
      console.log('[AvatarStep] webhookAvatarData?.productId:', webhookAvatarData?.productId);
      console.log('[AvatarStep] initialData?.productId:', initialData?.productId);
      console.log('[AvatarStep] productData prop:', productData);
      console.log('[AvatarStep] Available products:', allProducts.map(p => ({ id: p.id, name: p.name })));
    }
    
    if (!product) {
      console.log('[AvatarStep] Validation failed: no product found');
    toast({
        title: "שגיאה",
        description: "לא נמצא מוצר קשור לאווטאר",
        variant: "destructive"
      });
      return;
    }

    console.log('🔍 [AvatarStep] Product found successfully:', product.name);
    console.log('[AvatarStep] All validation passed, proceeding to webhook call');
    console.log('🚀 Creative plan WebHook activation: Will trigger Make.com scenario');
    console.log('🔍 BASIC LOG: About to call triggerCreativePlanWebhook');
    setIsWebhookLoading(true);
    onWebhookStart?.();
    
    try {
      toast({
        title: "בונה תכנית...",
        description: "מכין תסריט..."
      });
      
      // Prepare the webhook payload with all required data
      const webhookPayload = {
        action: 'generate_creative_plan',
        product: {
          name: product.name,
          description: product.description,
          features: product.features,
          price: product.price,
          offer: product.currency, // Using currency as offer for now
          images: [product.imageUrl], // Convert to array
          videos: [] // Empty for now, can be extended later
        },
        avatar: {
          name: formData.name,
          age: formData.age,
          gender: formData.gender,
          interests: formData.interests,
          painPoints: formData.painPoints,
          objections: formData.objections,
          dreamOutcome: formData.dreamOutcome,
          createdAt: new Date().toISOString()
        },
        creativeBrief: creativeBrief || "",
        creativeType: creativeType || "video",
        timestamp: new Date().toISOString()
      };

      console.log('📤 Creative plan WebHook payload:', webhookPayload);
      console.log('🔍 BASIC LOG: Calling triggerCreativePlanWebhook now...');

      const webhookResponse = await triggerCreativePlanWebhook(webhookPayload);
      
      console.log('🔍 BASIC LOG: triggerCreativePlanWebhook returned:', webhookResponse);
      // 🔍 STEP 4: Our system receives data from Make
      console.log('🔍 STEP 4: Webhook response received from Make:', webhookResponse);
      console.log('🔍 STEP 4: Response success:', webhookResponse.success);
      console.log('🔍 STEP 4: Creative plan data:', webhookResponse.creativePlan);
      console.log('🔍 STEP 4: Full response structure:', JSON.stringify(webhookResponse, null, 2));
      
      // After the creative plan webhook returns, call onWebhookComplete with the webhook response
      if (webhookResponse.success && webhookResponse.creativePlan) {
        saveCreativePlanData(webhookResponse.creativePlan);
      }
      console.log('[AvatarStep] Passing creativePlan to onComplete:', webhookResponse.creativePlan);
      onComplete({ 
        avatar: formData,
        creativePlan: webhookResponse.creativePlan 
      });
      onWebhookComplete?.(webhookResponse.creativePlan);
    } catch (error) {
      console.error('❌ Creative plan WebHook error:', error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה ביצירת התכנית",
        variant: "destructive"
    });
    
      // Continue without creative plan data
    onComplete({ avatar: formData });
      onWebhookComplete?.();
    } finally {
      setIsWebhookLoading(false);
      onWebhookComplete?.();
    }
  };

  return (
    <div className="space-y-6 text-right" dir="rtl">
      {noAvatarData && (
        <div className="p-3 mb-2 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-900">
          ⚠️ לא נמצאו נתוני אווטאר קיימים למרות ש-hasAvatar=true. בדוק את המידע במערכת.
        </div>
      )}
      <div className="flex items-center gap-3 mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <Users className="w-6 h-6 text-blue-600" />
        <div className="flex-1">
          <h3 className="font-medium text-blue-900">הגדרת קהל היעד</h3>
          <p className="text-sm text-blue-700">ככל שנדע יותר על הקהל שלך, נוכל ליצור תוכן מדויק יותר</p>
        </div>
        {webhookAvatarData && (
          <div className="flex items-center gap-2 text-green-700 bg-green-50 px-3 py-1 rounded-full border border-green-200">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm font-medium">נתונים מהמוצר</span>
          </div>
        )}
      </div>

      {/* Avatar Selector */}
      {existingAvatars.length > 0 && (
        <div className="p-4 mb-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-3">בחר אווטאר קיים</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {existingAvatars.map(avatar => (
              <button
                key={avatar.id}
                type="button"
                onClick={() => handleAvatarSelection(avatar.id || '')}
                className={`p-3 rounded-lg border-2 transition-all text-right ${
                  selectedAvatarId === avatar.id
                    ? 'border-blue-500 bg-blue-100 text-blue-900'
                    : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50'
                }`}
              >
                <div className="font-medium">{avatar.name}</div>
                <div className="text-sm text-gray-600">
                  {Array.isArray(avatar.age) ? avatar.age.join(', ') : avatar.age} • {avatar.gender}
                </div>
                {avatar.interests && (
                  <div className="text-xs text-gray-500 mt-1">
                    {Array.isArray(avatar.interests) ? avatar.interests.slice(0, 2).join(', ') : avatar.interests}
                  </div>
                )}
              </button>
            ))}
          </div>
          <p className="text-sm text-blue-700 mt-2">
            בחר אווטאר כדי לטעון את נתוניו אוטומטית, או מלא את הטופס למטה ליצירת אווטאר חדש
          </p>
        </div>
      )}
      {/* Avatar name exists warning */}
      {avatarNameExists && (
        <div className="p-2 mb-2 bg-red-50 border border-red-200 rounded-lg text-red-700">
          אווטאר בשם זה כבר קיים עבור מוצר זה!
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Avatar Name */}
        <div className="space-y-2">
          <Label htmlFor="avatarName" className="text-base font-medium">
            שם האווטאר *
          </Label>
          <Input
            id="avatarName"
            placeholder="לדוגמה: דני הספורטאי, שרה העסקית"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="text-right"
            dir="rtl"
          />
          <p className="text-sm text-gray-500">
            תן שם לאווטאר שיעזור לך לזכור מי הוא
          </p>
        </div>

        {/* Age and Gender Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Age */}
          <div className="space-y-2">
            <Label htmlFor="age" className="text-base font-medium">
              גיל *
            </Label>
            <ToggleGroup
              type="multiple"
              value={formData.age}
              onValueChange={(value) => setFormData(prev => ({ ...prev, age: value }))}
              className="grid grid-cols-3 gap-2"
            >
              {ageRanges.map((age) => (
                <ToggleGroupItem
                  key={age.value}
                  value={age.value}
                  className="px-4 py-2 rounded-lg border border-blue-200 bg-blue-50 text-blue-900 data-[state=on]:bg-blue-600 data-[state=on]:text-white transition-colors"
                >
                  {age.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
            <p className="text-sm text-gray-500">
              טווח הגילאים של קהל היעד
            </p>
          </div>

          {/* Gender */}
          <div className="space-y-2">
            <Label htmlFor="gender" className="text-base font-medium">
              מין *
            </Label>
            <Select value={formData.gender} onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}>
              <SelectTrigger className="text-right" dir="rtl">
                <SelectValue placeholder="בחר מין" />
              </SelectTrigger>
              <SelectContent>
                {genderOptions.map((gender) => (
                  <SelectItem key={gender.value} value={gender.value}>
                    {gender.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-500">
              המין של קהל היעד
            </p>
          </div>
        </div>

        {/* Interests */}
        <div className="space-y-2">
          <Label htmlFor="interests" className="text-base font-medium">
            תחומי עניין *
          </Label>
          <Textarea
            id="interests"
            placeholder="לדוגמה: ספורט, טכנולוגיה, אופנה, בישול, נסיעות, מוזיקה..."
            value={formData.interests}
            onChange={(e) => setFormData(prev => ({ ...prev, interests: e.target.value }))}
            className="min-h-[80px] text-right"
            dir="rtl"
          />
          <p className="text-sm text-gray-500">
            מה מעניין את קהל היעד שלך? מה הם אוהבים לעשות?
          </p>
        </div>

        {/* Pain Points */}
        <div className="space-y-2">
          <Label htmlFor="painPoints" className="text-base font-medium">
            נקודות כאב *
          </Label>
          <Textarea
            id="painPoints"
            placeholder="לדוגמה: אין להם זמן, הם מודאגים מהמחיר, הם לא בטוחים באיכות..."
            value={formData.painPoints}
            onChange={(e) => setFormData(prev => ({ ...prev, painPoints: e.target.value }))}
            className="min-h-[80px] text-right"
            dir="rtl"
          />
          <p className="text-sm text-gray-500">
            מה הבעיות והאתגרים שקהל היעד מתמודד איתם?
          </p>
        </div>

        {/* Objections */}
        <div className="space-y-2">
          <Label htmlFor="objections" className="text-base font-medium">
            התנגדויות *
          </Label>
          <Textarea
            id="objections"
            placeholder="לדוגמה: זה יקר מדי, אני לא בטוח שזה יעבוד, אין לי זמן..."
            value={formData.objections}
            onChange={(e) => setFormData(prev => ({ ...prev, objections: e.target.value }))}
            className="min-h-[80px] text-right"
            dir="rtl"
          />
          <p className="text-sm text-gray-500">
            מה ההתנגדויות שקהל היעד עלול להעלות?
          </p>
        </div>

        {/* Dream Outcome */}
        <div className="space-y-2">
          <Label htmlFor="dreamOutcome" className="text-base font-medium">
            תוצאת החלום *
          </Label>
          <Textarea
            id="dreamOutcome"
            placeholder="לדוגמה: הם רוצים להיות בריאים יותר, לחסוך זמן, להרוויח יותר כסף..."
            value={formData.dreamOutcome}
            onChange={(e) => setFormData(prev => ({ ...prev, dreamOutcome: e.target.value }))}
            className="min-h-[80px] text-right"
            dir="rtl"
          />
          <p className="text-sm text-gray-500">
            מה התוצאה האידיאלית שקהל היעד רוצה להשיג?
          </p>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            חזור לבריפינג
          </Button>
          
          <Button 
            type="submit" 
            size="lg" 
            disabled={isWebhookLoading}
            onClick={() => console.log('🔍 [AvatarStep] Submit button clicked!')}
            className="gradient-primary text-white min-w-[200px] hover:text-brand-light disabled:opacity-50"
          >
            <div className="flex items-center gap-2">
              {isWebhookLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  בונה תכנית...
                </>
              ) : (
                <>
              המשך לתכנון
              <ArrowRight className="w-4 h-4 mr-2" />
                </>
              )}
            </div>
          </Button>
        </div>
      </form>
    </div>
  );
} 