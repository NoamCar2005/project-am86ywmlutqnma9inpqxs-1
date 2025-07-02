import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { InitialBriefing } from "@/components/creative/InitialBriefing";
import { PlanningCanvas } from "@/components/creative/PlanningCanvas";
import { CreativePreview } from "@/components/creative/CreativePreview";

export default function CreateCreative() {
  const [currentStep, setCurrentStep] = useState("briefing");
  const [projectData, setProjectData] = useState({
    brief: "",
    productUrl: "",
    creativeType: "video",
    creativePlan: null
  });

  const steps = [
    { id: "briefing", title: "בריפינג ראשוני", description: "הזן את הפרטים הבסיסיים" },
    { id: "planning", title: "תכנון AI", description: "סקור ועדכן את התוכנית" },
    { id: "preview", title: "תצוגה מקדימה", description: "צפה בתוצאה הסופית" }
  ];

  const handleStepComplete = (stepId: string, data: any) => {
    setProjectData(prev => ({ ...prev, ...data }));
    
    const currentIndex = steps.findIndex(step => step.id === stepId);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1].id);
    }
  };

  const goToStep = (stepId: string) => {
    setCurrentStep(stepId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 text-right" dir="rtl">
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
                  <div 
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                      currentStep === step.id 
                        ? 'bg-brand-primary text-white' 
                        : steps.findIndex(s => s.id === currentStep) > index
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {index + 1}
                  </div>
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
                  <CardTitle>בריפינג ראשוני</CardTitle>
                  <CardDescription>
                    ספר לנו על המוצר שלך ואיך תרצה לקדם אותו
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <InitialBriefing 
                    onComplete={(data) => handleStepComplete("briefing", data)}
                    initialData={projectData}
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
                  <PlanningCanvas 
                    projectData={projectData}
                    onComplete={(data) => handleStepComplete("planning", data)}
                    onBack={() => goToStep("briefing")}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preview" className="mt-0">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>תצוגה מקדימה</CardTitle>
                  <CardDescription>
                    הקריאייטיב שלך מוכן! צפה בתוצאה ובחר מה לעשות הלאה
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <CreativePreview 
                    projectData={projectData}
                    onBack={() => goToStep("planning")}
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