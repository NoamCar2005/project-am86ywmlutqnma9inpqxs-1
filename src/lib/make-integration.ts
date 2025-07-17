// Make.com Integration for AI Creative Generation App
// This file handles webhook communication with Make.com workflows

export interface ProductData {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  imageUrl: string;
  category: string;
  brand: string;
  features: string[];
  specifications: Record<string, string>;
  createdAt: string;
}

export interface AvatarData {
  id?: string;
  name: string;
  age: string;
  gender: string;
  personality?: string;
  interests: string[];
  background?: string;
  goals?: string;
  painPoints: string[];
  objections?: string[];
  dreamOutcome?: string[];
  preferences?: Record<string, string>;
  createdAt?: string;
  productId?: string;
}

export interface WebhookResponse {
  success: boolean;
  product?: ProductData;
  avatar?: AvatarData;
  creativePlan?: any;
  error?: string;
}

// Product and avatar WebHook URL (renamed from first webhook)
const PRODUCT_AVATAR_WEBHOOK_URL = 'https://hook.eu2.make.com/l7974g6exeqlkzlk0fak6y8tmfp4r5f9';

// Creative plan WebHook URL (new webhook)
const CREATIVE_PLAN_WEBHOOK_URL = 'https://hook.eu2.make.com/1haskjrdx1u19ptruwe92324affn9j4m';

// Creative creation WebHook URL (third webhook)
const CREATE_CREATIVE_WEBHOOK_URL = 'https://hook.eu2.make.com/nqgwzo74w16lqqm9z3hj6lxs4vr5utoa';

/**
 * Triggers Product and avatar WebHook to scrape product data and generate avatar data
 */
export async function triggerProductScrapingWebhook(payload: any): Promise<WebhookResponse> {
  try {
    console.log('🚀 Triggering Product and avatar WebHook with payload:', payload);
    const response = await fetch(PRODUCT_AVATAR_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    console.log('📥 Response status:', response.status);
    console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ HTTP error response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
    }
    const data = await response.json();
    console.log('✅ Product and avatar WebHook response data:', data);
    return {
      success: true,
      product: data.product || undefined,
      avatar: data.avatar || undefined,
    };
  } catch (error) {
    console.error('❌ Product and avatar WebHook error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Triggers Creative plan WebHook to generate creative plan based on product and avatar data
 */
export async function triggerCreativePlanWebhook(payload: any): Promise<WebhookResponse> {
  try {
    // Add data type to payload based on creative type
    const enhancedPayload = {
      ...payload,
      dataType: payload.creativeType === 'ugc' || payload.creativeType === 'product_explanation' || payload.creativeType === 'trendy_reel' ? 'video' : 'static'
    };
    
    console.log('[triggerCreativePlanWebhook] Enhanced payload with dataType:', enhancedPayload);
    
    const response = await fetch(CREATIVE_PLAN_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(enhancedPayload),
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
    }
    const data = await response.json();
    console.log('[triggerCreativePlanWebhook] RAW webhook response:', data);

    // Always create a creativePlan object, even if minimal
    let creativePlan = data.creativePlan;
    if (!creativePlan) {
      const { success, product, avatar, ...planFields } = data;
      creativePlan = { ...planFields };
    }
    // Fallback: ensure creativePlan is at least an object with scenes array
    if (!creativePlan || typeof creativePlan !== 'object') creativePlan = {};
    if (!Array.isArray(creativePlan.scenes)) creativePlan.scenes = [];
    console.log('[triggerCreativePlanWebhook] Final creativePlan to save:', creativePlan);

    // Save to localStorage every time
    try {
      localStorage.setItem('creativePlan', JSON.stringify(creativePlan));
    } catch (e) {
      // Ignore localStorage errors
    }

    return {
      success: !!data.success,
      product: data.product || undefined,
      avatar: data.avatar || undefined,
      creativePlan,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Triggers the creative creation webhook and returns the creative URL
 * @param payload - creative plan (for video) or template id (for image)
 * @returns {Promise<{ success: boolean, creativeUrl?: string, error?: string }>} 
 */
export async function triggerCreateCreativeWebhook(payload: any): Promise<{ success: boolean, creativeUrl?: string, error?: string }> {
  try {
    const response = await fetch(CREATE_CREATIVE_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
    }
    const data = await response.json();
    // Expecting the response to contain a creative URL
    return {
      success: true,
      creativeUrl: data.url || data.creativeUrl || data.result || '',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Saves product data to localStorage
 * @returns {boolean} true if saved successfully, false if duplicate
 */
export function saveProductData(product: ProductData): boolean {
  try {
    console.log('💾 Attempting to save product data:', product);
    const existingProducts = getProductData();
    console.log('💾 Existing products:', existingProducts);
    
    // Check for duplicates by name and URL (if available)
    const isDuplicate = existingProducts.some(existingProduct => {
      const nameMatch = existingProduct.name.trim().toLowerCase() === product.name.trim().toLowerCase();
      const urlMatch = product.imageUrl && existingProduct.imageUrl && 
                      existingProduct.imageUrl.trim().toLowerCase() === product.imageUrl.trim().toLowerCase();
      return nameMatch || urlMatch;
    });
    
    if (isDuplicate) {
      console.log('⚠️ Product already exists, skipping save:', product.name);
      return false;
    }
    
    const updatedProducts = [...existingProducts, product];
    console.log('💾 Updated products array:', updatedProducts);
    localStorage.setItem('products', JSON.stringify(updatedProducts));
    console.log('💾 Product data saved successfully');
    
    // Verify save
    const savedData = localStorage.getItem('products');
    console.log('💾 Verification - saved data:', savedData);
    return true;
  } catch (error) {
    console.error('❌ Error saving product data:', error);
    return false;
  }
}

/**
 * Retrieves all product data from localStorage
 */
export function getProductData(): ProductData[] {
  try {
    const data = localStorage.getItem('products');
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('❌ Error retrieving product data:', error);
    return [];
  }
}

/**
 * Finds existing product by URL
 */
export function findProductByUrl(productUrl: string): ProductData | null {
  try {
    const products = getProductData();
    return products.find(product => 
      product.imageUrl && product.imageUrl.trim().toLowerCase() === productUrl.trim().toLowerCase()
    ) || null;
  } catch (error) {
    console.error('❌ Error finding product by URL:', error);
    return null;
  }
}

/**
 * Finds existing product by name
 */
export function findProductByName(productName: string): ProductData | null {
  try {
    const products = getProductData();
    return products.find(product => 
      product.name.trim().toLowerCase() === productName.trim().toLowerCase()
    ) || null;
  } catch (error) {
    console.error('❌ Error finding product by name:', error);
    return null;
  }
}

/**
 * Retrieves all avatar data from localStorage
 */
export function getAvatarData(): AvatarData[] {
  try {
    const data = localStorage.getItem('avatars');
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('❌ Error retrieving avatar data:', error);
    return [];
  }
}

/**
 * Saves creative plan data to localStorage
 */
export function saveCreativePlanData(creativePlan: any): void {
  try {
    localStorage.setItem('creativePlan', JSON.stringify(creativePlan));
    console.log('💾 Creative plan data saved to localStorage');
  } catch (error) {
    console.error('❌ Error saving creative plan data:', error);
  }
}

/**
 * Retrieves creative plan data from localStorage
 */
export function getCreativePlanData(): any | null {
  try {
    const data = localStorage.getItem('creativePlan');
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('❌ Error retrieving creative plan data:', error);
    return null;
  }
}

/**
 * Clears all stored data (for testing/reset purposes)
 */
export function clearStoredData(): void {
  localStorage.removeItem('products');
  localStorage.removeItem('avatars');
  console.log('🗑️ All stored data cleared');
}

/**
 * Test function to verify Product and avatar WebHook integration (call from console)
 */
export async function testProductAvatarWebhookIntegration(): Promise<void> {
  console.log('🧪 Testing Product and avatar WebHook integration...');
  
  try {
    const testUrl = 'https://example.com/test-product';
    console.log('🧪 Testing with URL:', testUrl);
    
    const response = await triggerProductScrapingWebhook({
      action: 'scrape_product_and_generate_avatar',
      productUrl: testUrl,
      timestamp: new Date().toISOString(),
    });
    console.log('🧪 Test response:', response);
    
    if (response.success) {
      console.log('✅ Product and avatar WebHook test successful');
    } else {
      console.log('❌ Product and avatar WebHook test failed:', response.error);
    }
  } catch (error) {
    console.error('❌ Product and avatar WebHook test error:', error);
  }
}

/**
 * Test function to verify Creative plan WebHook integration (call from console)
 */
export async function testCreativePlanWebhookIntegration(): Promise<void> {
  console.log('🧪 Testing Creative plan WebHook integration...');
  
  try {
    const testPayload = {
      action: 'generate_creative_plan',
      product: {
        name: 'Test Product',
        description: 'Test Description',
        features: ['Feature 1', 'Feature 2'],
        price: 99.99,
        offer: 'Special offer',
        images: ['https://example.com/image1.jpg'],
        videos: ['https://example.com/video1.mp4']
      },
      avatar: {
        name: 'Test Avatar',
        age: ['25-34'],
        gender: 'male',
        interests: 'Technology, Sports',
        painPoints: 'Time management',
        objections: 'Too expensive',
        dreamOutcome: 'Better productivity',
        createdAt: new Date().toISOString()
      },
      timestamp: new Date().toISOString(),
    };
    console.log('🧪 Testing with payload:', testPayload);
    
    const response = await triggerCreativePlanWebhook(testPayload);
    console.log('🧪 Test response:', response);
    
    if (response.success) {
      console.log('✅ Creative plan WebHook test successful');
    } else {
      console.log('❌ Creative plan WebHook test failed:', response.error);
    }
  } catch (error) {
    console.error('❌ Creative plan WebHook test error:', error);
  }
}

/**
 * Initialize sample product data for testing
 */
export function initializeSampleProducts(): void {
  const existingProducts = getProductData();
  if (existingProducts.length > 0) {
    console.log('📦 Sample products already exist, skipping initialization');
    return;
  }

  const sampleProducts: ProductData[] = [
    {
      id: 'sample_1',
      name: 'בקבוק מים חכם',
      description: 'בקבוק מים עם חיישן טמפרטורה וזיכרון לכמות המים היומית',
      price: 89.99,
      currency: 'ILS',
      imageUrl: 'https://example.com/smart-water-bottle',
      category: 'בריאות וספורט',
      brand: 'SmartHydrate',
      features: ['חיישן טמפרטורה', 'זיכרון יומי', 'חיבור לאפליקציה'],
      specifications: {
        'נפח': '750ml',
        'חומר': 'נירוסטה',
        'סוללה': 'עד 7 ימים'
      },
      createdAt: new Date().toISOString()
    },
    {
      id: 'sample_2',
      name: 'אוזניות אלחוטיות',
      description: 'אוזניות עם ביטול רעשים פעיל ואיכות סאונד מעולה',
      price: 299.99,
      currency: 'ILS',
      imageUrl: 'https://example.com/wireless-headphones',
      category: 'אלקטרוניקה',
      brand: 'SoundPro',
      features: ['ביטול רעשים', 'Bluetooth 5.0', 'עד 30 שעות האזנה'],
      specifications: {
        'סוללה': 'עד 30 שעות',
        'חיבור': 'Bluetooth 5.0',
        'משקל': '250g'
      },
      createdAt: new Date().toISOString()
    },
    {
      id: 'sample_3',
      name: 'כרית ארגונומית',
      description: 'כרית תומכת לצוואר עם זיכרון צורה מתקדם',
      price: 159.99,
      currency: 'ILS',
      imageUrl: 'https://example.com/ergonomic-pillow',
      category: 'בית וחדר שינה',
      brand: 'ComfortSleep',
      features: ['זיכרון צורה', 'ארגונומי', 'נושם'],
      specifications: {
        'גודל': '60x40cm',
        'חומר': 'זיכרון צורה',
        'כיסוי': 'כותנה 100%'
      },
      createdAt: new Date().toISOString()
    }
  ];

  // Save sample products
  sampleProducts.forEach(product => {
    saveProductData(product);
  });

  console.log('📦 Sample products initialized:', sampleProducts.length);
}

// Make test functions available globally for console access
if (typeof window !== 'undefined') {
  (window as any).testProductAvatarWebhook = testProductAvatarWebhookIntegration;
  (window as any).testCreativePlanWebhook = testCreativePlanWebhookIntegration;
  (window as any).clearWebhookData = clearStoredData;
  (window as any).getWebhookData = () => ({
    products: getProductData(),
    avatars: getAvatarData()
  });
} 