import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { InitialBriefing } from "@/components/creative/InitialBriefing";
import { AvatarStep } from "@/components/creative/AvatarStep";
import { PlanningCanvas } from "@/components/creative/PlanningCanvas";
import { CreativePreview } from "@/components/creative/CreativePreview";
import { AIGenerationLoadingOverlay } from "@/components/creative/AIGenerationLoadingOverlay";
import { CreativePlanLoadingOverlay } from "@/components/creative/CreativePlanLoadingOverlay";
import { type ProductData, type AvatarData as WebhookAvatarData } from "@/lib/make-integration";
import { useLocation } from 'react-router-dom';

interface ProjectData {
  brief: string;
  productUrl: string;
  creativeType: string;
  avatar?: AvatarData;
  productData?: ProductData;
  webhookAvatarData?: WebhookAvatarData;
  creativePlan: CreativePlan | null;
  webhookCreativePlanData?: any;
}

interface AvatarData {
  name: string;
  age: string[];
  gender: string;
  interests: string;
  painPoints: string;
  objections: string;
  dreamOutcome: string;
}

interface CreativePlan {
  total_duration?: number;
  scenes?: unknown[];
}

export default function CreateCreative() {
  const [currentStep, setCurrentStep] = useState("briefing");
  const [projectData, setProjectData] = useState<ProjectData>({
    brief: "",
    productUrl: "",
    creativeType: "ugc",
    avatar: undefined,
    productData: undefined,
    webhookAvatarData: undefined,
    creativePlan: null
  });
  const [isAILoading, setIsAILoading] = useState(false);
  const [isCreativePlanLoading, setIsCreativePlanLoading] = useState(false);
  const location = useLocation();
  const creativeUrlFromState = location.state?.creativeUrl;

  const steps = [
    { id: "briefing", title: "בריפינג ראשי", description: "הזן את הפרטים הבסיסיים" },
    { id: "avatar", title: "אווטאר", description: "הגדר את קהל היעד" },
    { id: "planning", title: "תכנון AI", description: "סקור ועדכן את התוכנית" },
    { id: "preview", title: "תמונה מקדימה", description: "צפה בתוצאה הסופית" }
  ];

  // Show animation after each step except the last
  const handleStepComplete = async (stepId: string, data: any, productData?: ProductData, webhookAvatarData?: WebhookAvatarData, webhookCreativePlanData?: any) => {
    console.log('CreateCreative: handleStepComplete called with:', { stepId, data, productData, webhookAvatarData, webhookCreativePlanData });
    console.log('🎯 CreateCreative handleStepComplete called with:', { stepId, data, productData, webhookAvatarData });
    console.log('🔍 STEP 5: handleStepComplete received webhookCreativePlanData:', webhookCreativePlanData);

    let nextWebhookAvatarData = webhookAvatarData;
    if (
      stepId === 'briefing' &&
      productData &&
      data &&
      ((data.hasProduct && data.hasAvatar && !webhookAvatarData) || (data.hasProduct && data.hasAvatar && webhookAvatarData && Object.keys(webhookAvatarData).length === 0))
    ) {
      try {
        const { getAvatarData } = await import('@/lib/make-integration');
        const avatars = getAvatarData();
        console.log('[AutoFill] All avatars:', avatars);
        console.log('[AutoFill] Looking for avatar with productId:', productData.id);
        const related = avatars.filter(a => a.productId === productData.id);
        if (related.length > 0) {
          // Find the most recently created avatar for this product (not just the first one)
          const sortedAvatars = related.sort((a, b) => {
            const dateA = new Date(a.createdAt || 0);
            const dateB = new Date(b.createdAt || 0);
            return dateB.getTime() - dateA.getTime(); // Most recent first
          });
          nextWebhookAvatarData = sortedAvatars[0];
          console.log('🟢 Auto-filling avatar page from most recent avatar:', nextWebhookAvatarData);
        } else {
          console.warn('⚠️ No avatar found for productId', productData.id, 'even though hasAvatar is true!');
        }
      } catch (err) {
        console.error('Error auto-filling avatar from local data:', err);
      }
    }

    if (webhookCreativePlanData !== undefined) {
      console.log('[CreateCreative] handleStepComplete: webhookCreativePlanData:', webhookCreativePlanData);
      setProjectData(prev => {
        const newData = { 
          ...prev, 
          ...data,
          ...(productData && { productData }),
          ...(webhookAvatarData && { webhookAvatarData }),
          webhookCreativePlanData // always set, even if empty
        };
        console.log('[CreateCreative] Setting projectData.webhookCreativePlanData:', newData.webhookCreativePlanData);
        console.log('🔍 STEP 5: New projectData state:', newData);
        return newData;
      });
    } else {
      console.log('🔍 STEP 5: No webhookCreativePlanData provided, setting projectData without it');
    setProjectData(prev => {
      const newData = { 
        ...prev, 
        ...data,
        ...(productData && { productData }),
        ...(webhookAvatarData && { webhookAvatarData })
      };
      return newData;
    });
    }
    
    const currentIndex = steps.findIndex(step => step.id === stepId);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1].id);
    }
  };

  // Handle webhook loading state
  const handleWebhookStart = () => {
    setIsAILoading(true);
  };

  const handleWebhookComplete = () => {
    setIsAILoading(false);
  };

  // Handle creative plan webhook loading state
  const handleCreativePlanWebhookStart = () => {
    setIsCreativePlanLoading(true);
  };

  const handleCreativePlanWebhookComplete = () => {
    setIsCreativePlanLoading(false);
  };

  const goToStep = (stepId: string) => {
    setCurrentStep(stepId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 text-right" dir="rtl">
      <AIGenerationLoadingOverlay 
        show={isAILoading} 
        onComplete={handleWebhookComplete}
      />
      <CreativePlanLoadingOverlay 
        show={isCreativePlanLoading} 
        onComplete={handleCreativePlanWebhookComplete}
      />
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <SidebarTrigger />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">צור קריאייטיב חדש</h1>
            <p className="text-gray-600 mt-1">בואו ניצור תוכן מדהים יחד עם AI</p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-8 rtl:space-x-reverse">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <button
                    onClick={() => {
                      const currentIndex = steps.findIndex(s => s.id === currentStep);
                      if (index < currentIndex) {
                        goToStep(step.id);
                      }
                    }}
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                      currentStep === step.id 
                        ? 'bg-brand-primary text-white shadow-lg' 
                        : steps.findIndex(s => s.id === currentStep) > index
                        ? 'bg-green-500 text-white shadow-md hover:bg-green-600 cursor-pointer hover:scale-110'
                        : 'bg-gray-200 text-gray-600 cursor-default opacity-60'
                    }`}
                    disabled={index >= steps.findIndex(s => s.id === currentStep)}
                  >
                    {index + 1}
                  </button>
                  <div className="mt-2 text-center">
                    <p className="text-sm font-medium">{step.title}</p>
                    <p className="text-xs text-gray-500">{step.description}</p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <ArrowLeft className="w-5 h-5 text-gray-400 mx-4" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="max-w-4xl mx-auto">
          <Tabs value={currentStep} onValueChange={setCurrentStep}>
            <TabsContent value="briefing" className="mt-0">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>בריפינג ראשי</CardTitle>
                  <CardDescription>
                    ספר לנו על המוצר שלך ואיך תרצה לקדם אותו
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <InitialBriefing 
                    onComplete={(data, productData, webhookAvatarData) => handleStepComplete("briefing", data, productData, webhookAvatarData)}
                    onWebhookStart={handleWebhookStart}
                    onWebhookComplete={handleWebhookComplete}
                    initialData={projectData}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="avatar" className="mt-0">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>אווטאר</CardTitle>
                  <CardDescription>
                    הגדר את קהל היעד שלך כדי שנוכל ליצור תוכן מדויק יותר
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <AvatarStep 
                    onComplete={(data) => handleStepComplete("avatar", data, undefined, undefined, data.creativePlan)}
                    onBack={() => goToStep("briefing")}
                    initialData={projectData.avatar}
                    webhookAvatarData={projectData.webhookAvatarData}
                    productData={projectData.productData}
                    creativeBrief={projectData.brief}
                    creativeType={projectData.creativeType}
                    onWebhookStart={handleCreativePlanWebhookStart}
                    onWebhookComplete={handleCreativePlanWebhookComplete}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="planning" className="mt-0">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>תכנון AI</CardTitle>
                  <CardDescription>
                    סקור את התוכנית שה-AI הכין עבורך ועדכן לפי הצורך
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {(() => {
                    console.log('🔍 STEP 6: Passing webhookCreativePlanData to PlanningCanvas:', projectData.webhookCreativePlanData);
                    return (
                  <PlanningCanvas 
                    projectData={projectData}
                    onComplete={(data) => handleStepComplete("planning", data)}
                    onBack={() => goToStep("avatar")}
                        webhookCreativePlanData={projectData.webhookCreativePlanData}
                  />
                    );
                  })()}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preview" className="mt-0">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>תמונה מקדימה</CardTitle>
                  <CardDescription>
                    הקריאייטיב שלך מוכן! צפה בתוצאה ובחר מה לעשות הלאה
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <CreativePreview 
                    projectData={projectData}
                    onBack={() => goToStep("planning")}
                    creativeUrl={creativeUrlFromState}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}