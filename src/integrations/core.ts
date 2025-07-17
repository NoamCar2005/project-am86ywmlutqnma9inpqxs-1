// Mock Integrations (replacing Superdev integrations)
import { MockAIService } from '@/lib/localStorage';

// Integration Configuration
const config = {
  // Environment detection
  isProduction: import.meta.env.PROD,
  isDevelopment: import.meta.env.DEV,
  
  // Make.com Configuration
  makeWebhookUrl: import.meta.env.VITE_MAKE_WEBHOOK_URL || '',
  makeApiKey: import.meta.env.VITE_MAKE_API_KEY || '',
  
  // AI Service Configuration
  aiServiceUrl: import.meta.env.VITE_AI_SERVICE_URL || '',
  aiApiKey: import.meta.env.VITE_AI_API_KEY || '',
  
  // Database Configuration
  databaseUrl: import.meta.env.VITE_DATABASE_URL || '',
  
  // Email Service
  emailServiceUrl: import.meta.env.VITE_EMAIL_SERVICE_URL || '',
  emailApiKey: import.meta.env.VITE_EMAIL_API_KEY || '',
  
  // Use mock services if no real services configured
  useMockServices: !import.meta.env.VITE_MAKE_WEBHOOK_URL && !import.meta.env.VITE_AI_SERVICE_URL
};

// Real API Integration Functions
const RealAIService = {
  invokeLLM: async (params: any): Promise<any> => {
    if (!config.aiServiceUrl) {
      throw new Error('AI service URL not configured');
    }
    
    const response = await fetch(`${config.aiServiceUrl}/llm`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.aiApiKey}`
      },
      body: JSON.stringify(params)
    });
    
    if (!response.ok) {
      throw new Error(`AI service error: ${response.statusText}`);
    }
    
    return await response.json();
  },

  generateImage: async (params: any): Promise<any> => {
    if (!config.aiServiceUrl) {
      throw new Error('AI service URL not configured');
    }
    
    const response = await fetch(`${config.aiServiceUrl}/generate-image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.aiApiKey}`
      },
      body: JSON.stringify(params)
    });
    
    if (!response.ok) {
      throw new Error(`Image generation error: ${response.statusText}`);
    }
    
    return await response.json();
  },

  uploadFile: async (file: File): Promise<any> => {
    if (!config.makeWebhookUrl) {
      throw new Error('Make.com webhook URL not configured');
    }
    
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${config.makeWebhookUrl}/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.makeApiKey}`
      },
      body: formData
    });
    
    if (!response.ok) {
      throw new Error(`File upload error: ${response.statusText}`);
    }
    
    return await response.json();
  }
};

// Real Email Service
const RealEmailService = {
  sendEmail: async (data: any): Promise<any> => {
    if (!config.emailServiceUrl) {
      throw new Error('Email service URL not configured');
    }
    
    const response = await fetch(`${config.emailServiceUrl}/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.emailApiKey}`
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error(`Email service error: ${response.statusText}`);
    }
    
    return await response.json();
  }
};

// Make.com Webhook Integration
const MakeWebhookService = {
  triggerWorkflow: async (workflowId: string, data: any): Promise<any> => {
    if (!config.makeWebhookUrl) {
      throw new Error('Make.com webhook URL not configured');
    }
    
    const response = await fetch(`${config.makeWebhookUrl}/workflow/${workflowId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.makeApiKey}`
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error(`Make.com workflow error: ${response.statusText}`);
    }
    
    return await response.json();
  },

  // Specific workflow triggers
  createVideo: async (projectData: any): Promise<any> => {
    return MakeWebhookService.triggerWorkflow('create-video', projectData);
  },

  generateCreativePlan: async (briefData: any): Promise<any> => {
    return MakeWebhookService.triggerWorkflow('generate-plan', briefData);
  },

  processAvatarData: async (avatarData: any): Promise<any> => {
    return MakeWebhookService.triggerWorkflow('process-avatar', avatarData);
  }
};

// Export the appropriate service based on configuration
export const core = config.useMockServices ? MockAIService : RealAIService;
export const uploadFile = config.useMockServices ? MockAIService.uploadFile : RealAIService.uploadFile;
export const invokeLLM = config.useMockServices ? MockAIService.invokeLLM : RealAIService.invokeLLM;
export const generateImage = config.useMockServices ? MockAIService.generateImage : RealAIService.generateImage;
export const sendEmail = config.useMockServices ? MockAIService.sendEmail : RealEmailService.sendEmail;

// Export Make.com specific functions
export { MakeWebhookService };

// Legacy exports for compatibility
export const getUploadedFile = async (id: string) => ({ url: `https://via.placeholder.com/400x300/1E2849/FFFFFF?text=File+${id}` });
export const extractDataFromUploadedFile = async (file: File) => ({ text: 'Mock extracted text', confidence: 0.95 });
