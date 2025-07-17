// Local Storage Management System
// Replaces Superdev with local state management

import { supabase } from './supabase';

export interface Creative {
  id: string;
  project_id: string;
  title: string;
  status: string;
  video_url: string;
  thumbnail_url: string;
  duration: number;
  ai_prompts: string;
  tags: string[];
  is_favorite: boolean;
  created_at: string;
}

export interface Project {
  id: string;
  title: string;
  brief: string;
  product_url: string;
  creative_type: string;
  status: string;
  creative_plan_json: string;
  tags: string[];
  created_at: string;
}

export interface CreditTransaction {
  id: string;
  type: string;
  amount: number;
  description: string;
  project_id?: string;
  creative_id?: string;
  created_at: string;
}

// Local Storage Keys
const STORAGE_KEYS = {
  CREATIVES: 'adcraft_creatives',
  PROJECTS: 'adcraft_projects',
  CREDIT_TRANSACTIONS: 'adcraft_credit_transactions',
  USER_CREDITS: 'adcraft_user_credits'
};

// Helper functions
const getStorageData = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading from localStorage for key ${key}:`, error);
    return defaultValue;
  }
};

const setStorageData = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error writing to localStorage for key ${key}:`, error);
  }
};

// Generate unique ID
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Creative Management
export const CreativeService = {
  list: async (): Promise<Creative[]> => {
    return getStorageData<Creative[]>(STORAGE_KEYS.CREATIVES, []);
  },

  create: async (data: Omit<Creative, 'id' | 'created_at'>): Promise<Creative> => {
    const creatives = getStorageData<Creative[]>(STORAGE_KEYS.CREATIVES, []);
    const newCreative: Creative = {
      ...data,
      id: generateId(),
      created_at: new Date().toISOString()
    };
    
    creatives.push(newCreative);
    setStorageData(STORAGE_KEYS.CREATIVES, creatives);
    
    // Write to Supabase
    try {
      await supabase.from('creatives').insert([newCreative]);
    } catch (e) {
      console.error('Failed to write creative to Supabase:', e);
    }
    
    return newCreative;
  },

  update: async (id: string, updates: Partial<Creative>): Promise<Creative> => {
    const creatives = getStorageData<Creative[]>(STORAGE_KEYS.CREATIVES, []);
    const index = creatives.findIndex(c => c.id === id);
    
    if (index === -1) {
      throw new Error(`Creative with id ${id} not found`);
    }
    
    creatives[index] = { ...creatives[index], ...updates };
    setStorageData(STORAGE_KEYS.CREATIVES, creatives);
    
    return creatives[index];
  },

  delete: async (id: string): Promise<void> => {
    const creatives = getStorageData<Creative[]>(STORAGE_KEYS.CREATIVES, []);
    const filteredCreatives = creatives.filter(c => c.id !== id);
    setStorageData(STORAGE_KEYS.CREATIVES, filteredCreatives);
  }
};

// Project Management
export const ProjectService = {
  list: async (): Promise<Project[]> => {
    return getStorageData<Project[]>(STORAGE_KEYS.PROJECTS, []);
  },

  create: async (data: Omit<Project, 'id' | 'created_at'>): Promise<Project> => {
    const projects = getStorageData<Project[]>(STORAGE_KEYS.PROJECTS, []);
    const newProject: Project = {
      ...data,
      id: generateId(),
      created_at: new Date().toISOString()
    };
    
    projects.push(newProject);
    setStorageData(STORAGE_KEYS.PROJECTS, projects);
    
    // Write to Supabase
    try {
      await supabase.from('projects').insert([newProject]);
    } catch (e) {
      console.error('Failed to write project to Supabase:', e);
    }
    
    return newProject;
  },

  update: async (id: string, updates: Partial<Project>): Promise<Project> => {
    const projects = getStorageData<Project[]>(STORAGE_KEYS.PROJECTS, []);
    const index = projects.findIndex(p => p.id === id);
    
    if (index === -1) {
      throw new Error(`Project with id ${id} not found`);
    }
    
    projects[index] = { ...projects[index], ...updates };
    setStorageData(STORAGE_KEYS.PROJECTS, projects);
    
    return projects[index];
  },

  delete: async (id: string): Promise<void> => {
    const projects = getStorageData<Project[]>(STORAGE_KEYS.PROJECTS, []);
    const filteredProjects = projects.filter(p => p.id !== id);
    setStorageData(STORAGE_KEYS.PROJECTS, filteredProjects);
  }
};

// Credit Transaction Management
export const CreditTransactionService = {
  list: async (): Promise<CreditTransaction[]> => {
    return getStorageData<CreditTransaction[]>(STORAGE_KEYS.CREDIT_TRANSACTIONS, []);
  },

  create: async (data: Omit<CreditTransaction, 'id' | 'created_at'>): Promise<CreditTransaction> => {
    const transactions = getStorageData<CreditTransaction[]>(STORAGE_KEYS.CREDIT_TRANSACTIONS, []);
    const newTransaction: CreditTransaction = {
      ...data,
      id: generateId(),
      created_at: new Date().toISOString()
    };
    
    transactions.push(newTransaction);
    setStorageData(STORAGE_KEYS.CREDIT_TRANSACTIONS, transactions);
    
    // Update user credits
    const currentCredits = getStorageData<number>(STORAGE_KEYS.USER_CREDITS, 100);
    const newCredits = currentCredits + data.amount;
    setStorageData(STORAGE_KEYS.USER_CREDITS, newCredits);
    
    return newTransaction;
  },

  getUserCredits: (): number => {
    return getStorageData<number>(STORAGE_KEYS.USER_CREDITS, 100);
  },

  setUserCredits: (credits: number): void => {
    setStorageData(STORAGE_KEYS.USER_CREDITS, credits);
  }
};

// Mock AI Integration (replaces Superdev LLM)
export const MockAIService = {
  invokeLLM: async (params: any): Promise<any> => {
    // Simulate AI response delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Return mock responses based on the prompt
    if (params.prompt?.includes('scene purposes')) {
      return {
        purposes: [
          "הצגת המוצר והבעיה שהוא פותר",
          "הדגשת היתרונות הייחודיים",
          "הוכחה חברתית ולקוחות מרוצים",
          "הדגשת התכונות והאיכות",
          "בניית אמון ומוניטין",
          "קריאה לפעולה עם תמריץ"
        ]
      };
    }
    
    // Handle marketing strategy suggestions
    if (params.prompt?.includes('marketing strategy suggestions')) {
      return {
        suggestions: [
          "צור תוכן וירלי ברשתות החברתיות",
          "בנה קמפיין אימייל מרקטינג מותאם אישית",
          "פתח שותפויות עם אינפלואנסרים רלוונטיים",
          "השתמש בפרסום ממוקד בפייסבוק ואינסטגרם"
        ]
      };
    }
    
    // Handle marketing assistant responses
    if (params.prompt?.includes('marketing assistant')) {
      const marketingResponses = [
        "אני ממליץ לך להתמקד בבניית נוכחות חזקה ברשתות החברתיות. התחל עם תוכן איכותי ועקבי שימשוך את קהל היעד שלך.",
        "בדוק את הנתונים של הקמפיינים הקודמים שלך כדי להבין מה עובד ומה לא. זה יעזור לך לשפר את האסטרטגיה שלך.",
        "שקול להשתמש באינפלואנסרים רלוונטיים לקהל היעד שלך. זה יכול להגדיל משמעותית את החשיפה והאמון במותג שלך.",
        "אימייל מרקטינג עדיין יעיל מאוד. בנה רשימת תפוצה איכותית וספק ערך אמיתי ללקוחות שלך.",
        "השתמש בפרסום ממוקד עם קהלי יעד ספציפיים. זה יעזור לך להגיע לאנשים הנכונים ולחסוך כסף.",
        "צור תוכן וידאו קצר ומושך. וידאו מקבל יותר מעורבות מכל סוג תוכן אחר ברשתות החברתיות."
      ];
      
      // Return a random marketing response
      const randomResponse = marketingResponses[Math.floor(Math.random() * marketingResponses.length)];
      return randomResponse;
    }
    
    // Default response for other cases
    return "תגובה מ-AI: אני כאן כדי לעזור לך עם השאלה שלך.";
  },

  generateImage: async (params: any): Promise<any> => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    return { url: "https://via.placeholder.com/800x600/1E2849/FFFFFF?text=AI+Generated+Image" };
  },

  uploadFile: async (file: File): Promise<any> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { url: URL.createObjectURL(file) };
  },

  sendEmail: async (data: any): Promise<any> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true, message: 'Mock email sent', id: Date.now().toString() };
  }
}; 