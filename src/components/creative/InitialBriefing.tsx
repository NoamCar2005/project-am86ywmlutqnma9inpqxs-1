import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowRight, 
  Link as LinkIcon, 
  Video, 
  Image, 
  Layers, 
  Info, 
  TrendingUp, 
  Play,
  CheckCircle,
  XCircle,
  HelpCircle,
  Loader2,
  ChevronDown,
  Search,
  Package
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  triggerProductScrapingWebhook, 
  saveProductData, 
  getAvatarData,
  findProductByUrl,
  findProductByName,
  type ProductData,
  type AvatarData,
  getProductData
} from "@/lib/make-integration";
import { debugAvatarProductConnections, checkConnectionForUrl } from "@/lib/debug-avatar-connection";
import { useSynchronizedData, saveProductDataWithSync, saveAvatarDataWithSync } from "@/lib/data-sync";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface FormData {
  brief: string;
  productUrl: string;
  creativeType: string;
}

interface InitialBriefingProps {
  onComplete: (data: FormData, productData?: ProductData, avatarData?: AvatarData) => void;
  onWebhookStart?: () => void;
  onWebhookComplete?: () => void;
  initialData: Partial<FormData>;
}

// Utility to normalize URLs for robust comparison
function normalizeUrl(url: string | undefined | null): string {
  if (!url || typeof url !== 'string') return '';
  try {
    return decodeURIComponent(url.trim().replace(/\/+$/, '').toLowerCase());
  } catch {
    return url.trim().replace(/\/+$/, '').toLowerCase();
  }
}

export function InitialBriefing({ onComplete, onWebhookStart, onWebhookComplete, initialData }: InitialBriefingProps) {
  const [formData, setFormData] = useState<FormData>({
    brief: initialData.brief || "",
    productUrl: initialData.productUrl || "",
    creativeType: initialData.creativeType || "ugc"
  });
  
  const [urlValidation, setUrlValidation] = useState<{
    isValid: boolean;
    isChecking: boolean;
  }>({
    isValid: false,
    isChecking: false
  });
  
  const [isWebhookLoading, setIsWebhookLoading] = useState(false);
  
  // Use synchronized data for products
  const { products: allProducts, isLoading: dataLoading } = useSynchronizedData();
  
  // Debug logging for state changes
  useEffect(() => {
    console.log('🔄 InitialBriefing render - Products:', allProducts.length, 'Loading:', dataLoading);
  }, [allProducts.length, dataLoading]);
  
  // Product selection state - simplified to prevent loops
  const [selectedProduct, setSelectedProduct] = useState<ProductData | null>(null);
  const [isProductSelectorOpen, setIsProductSelectorOpen] = useState(false);
  const [productSearchTerm, setProductSearchTerm] = useState("");
  const productSelectorRef = useRef<HTMLDivElement>(null);
  
  // Avatar state
  const [relatedAvatars, setRelatedAvatars] = useState<AvatarData[]>([]);
  const [hasProduct, setHasProduct] = useState(false);
  const [hasAvatar, setHasAvatar] = useState(false);
  const [avatarId, setAvatarId] = useState<string | null>(null);

  // Add mode state: 'new' or 'existing'
  const [productMode, setProductMode] = useState<'new' | 'existing'>('new');

  // Add selectedAvatar state
  const [selectedAvatar, setSelectedAvatar] = useState<AvatarData | null>(null);

  // When switching modes, clear the other mode's state
  useEffect(() => {
    if (productMode === 'new') {
      setSelectedProduct(null);
      setProductSearchTerm("");
      setFormData(prev => ({ ...prev, productUrl: "" }));
    } else if (productMode === 'existing') {
      setFormData(prev => ({ ...prev, productUrl: "" }));
    }
  }, [productMode]);

  // URL validation function
  const validateUrl = useCallback((url: string | undefined | null) => {
    if (typeof url !== 'string' || !url.trim()) {
      setUrlValidation({ isValid: false, isChecking: false });
      return;
    }
    setUrlValidation({ isValid: false, isChecking: true });
    setTimeout(() => {
      try {
        const urlObj = new URL(url);
        const isValid = urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
        setUrlValidation({ isValid, isChecking: false });
      } catch {
        setUrlValidation({ isValid: false, isChecking: false });
      }
    }, 500);
  }, []);

  // Filtered products based on search
  const filteredProducts = allProducts.filter(product =>
    product.name.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(productSearchTerm.toLowerCase())
  );

  // Handle product selection from dropdown
  const handleProductSelect = useCallback((product: ProductData) => {
    console.log('[handleProductSelect] called with:', product);
    const allProducts = getProductData();
    const latestProduct = allProducts.find(p => p.id === product.id) || product;
    const safeUrl = typeof latestProduct.imageUrl === 'string' ? latestProduct.imageUrl : "";
    setSelectedProduct(latestProduct);
    setFormData(prev => ({ ...prev, productUrl: safeUrl }));
    setProductSearchTerm("");
    setIsProductSelectorOpen(false);
    validateUrl(safeUrl);
    console.log('[ProductSelect] Set URL to:', safeUrl);
  }, [validateUrl]);

  // Handle clearing product selection
  const handleClearProduct = useCallback(() => {
    setSelectedProduct(null);
    setFormData(prev => ({ ...prev, productUrl: "" }));
    setRelatedAvatars([]);
    setHasProduct(false);
    setHasAvatar(false);
    setAvatarId(null);
    setProductSearchTerm("");
    setIsProductSelectorOpen(false);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsProductSelectorOpen(false);
      setProductSearchTerm("");
    }
  }, []);

  // Update related avatars and selectedAvatar when product changes
  useEffect(() => {
    if (selectedProduct) {
      const avatars = getAvatarData();
      const related = avatars.filter(a => a.productId === selectedProduct.id);
      setRelatedAvatars(related);
      setHasProduct(true);
      setHasAvatar(related.length > 0);
      setAvatarId(related.length > 0 ? related[0].id || null : null);
      setSelectedAvatar(related.length > 0 ? related[0] : null); // <-- store avatar
    } else {
      setRelatedAvatars([]);
      setHasProduct(false);
      setHasAvatar(false);
      setAvatarId(null);
      setSelectedAvatar(null);
    }
  }, [selectedProduct]);

  // Click outside handler to close product selector
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (productSelectorRef.current && !productSelectorRef.current.contains(event.target as Node)) {
        setIsProductSelectorOpen(false);
      }
    };

    if (isProductSelectorOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProductSelectorOpen]);

  // Handle URL input change
  const handleUrlChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value || "";
    console.log('[handleUrlChange] called with:', url);
    setFormData(prev => ({ ...prev, productUrl: url }));
    // Try to find a matching product
    const allProducts = getProductData();
    const match = allProducts.find(p => normalizeUrl(p.imageUrl) === normalizeUrl(url));
    if (match) {
      setSelectedProduct(match);
      // Find related avatar
      const avatars = getAvatarData();
      const related = avatars.filter(a => a.productId === match.id);
      setSelectedAvatar(related.length > 0 ? related[0] : null);
      console.log('[handleUrlChange] matched product:', match);
    } else {
      setSelectedProduct(null);
      setSelectedAvatar(null);
      console.log('[handleUrlChange] no matching product, cleared selection');
    }
    validateUrl(url);
  }, [validateUrl]);

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

    if (productMode === 'new') {
    if (!formData.productUrl.trim()) {
      toast({
        title: "שגיאה", 
        description: "אנא הזן URL של המוצר",
        variant: "destructive"
      });
      return;
    }

    if (!urlValidation.isValid) {
      toast({
        title: "שגיאה", 
        description: "אנא הזן URL תקין",
        variant: "destructive"
      });
      return;
    }
    } else if (productMode === 'existing') {
      if (!selectedProduct) {
        toast({
          title: "שגיאה",
          description: "אנא בחר מוצר קיים",
          variant: "destructive"
        });
        return;
      }
    }

    // Always fetch the latest product and avatar data
    const allProducts = getProductData();
    const allAvatars = getAvatarData();
    let product: ProductData | null = null;
    let normalizedFormUrl = '';
    let urlToSend = '';

    if (productMode === 'new') {
      normalizedFormUrl = normalizeUrl(formData.productUrl);
      product = allProducts.find(p => normalizeUrl(p.imageUrl) === normalizedFormUrl) || null;
      urlToSend = formData.productUrl;
    } else if (productMode === 'existing' && selectedProduct) {
      product = selectedProduct;
      urlToSend = selectedProduct.imageUrl || '';
      normalizedFormUrl = normalizeUrl(urlToSend);
    }

    const relatedAvatars = product ? allAvatars.filter(a => a.productId === product.id) : [];
    const hasProduct = !!product;
    const hasAvatar = relatedAvatars.length > 0;
    const avatarId = hasAvatar ? relatedAvatars[0].id || null : null;
    console.log('[Webhook] Normalized form URL:', normalizedFormUrl);
    console.log('[Webhook] Product found:', product);
    console.log('[Webhook] Related avatars:', relatedAvatars);
    console.log('[Webhook] hasProduct:', hasProduct, 'hasAvatar:', hasAvatar);
    
    // DEBUG: Log the connection status
    console.log('�� Webhook activation check:', {
      productUrl: urlToSend,
      productFound: !!product,
      productId: product?.id,
      totalAvatars: allAvatars.length,
      relatedAvatarsCount: relatedAvatars.length,
      hasProduct,
      hasAvatar,
      relatedAvatarsDetails: relatedAvatars.map(a => ({ id: a.id, name: a.name, productId: a.productId }))
    });
    
    // Run debug check to identify connection issues
    debugAvatarProductConnections();
    checkConnectionForUrl(urlToSend);

    console.log('✅ WEBHOOK ACTIVATION: Will trigger Make.com scenario');
    setIsWebhookLoading(true);
    onWebhookStart?.();
    
    try {
      toast({
        title: "מעבד...",
        description: "מעבד את המוצר ויוצר נתוני אווטאר..."
      });
      
      const webhookPayload = {
        productUrl: urlToSend,
        productId: product?.id || null,
        avatarId,
        hasProduct,
        hasAvatar,
        userInput: formData
      };

      const webhookResponse = await triggerProductScrapingWebhook(webhookPayload);
      
      if (webhookResponse.success) {
        // Save product if it doesn't exist
        if (webhookResponse.product && !hasProduct) {
          saveProductDataWithSync(webhookResponse.product);
        }
        
        // Handle avatar creation
        if (webhookResponse.avatar) {
          const newAvatar = {
            ...webhookResponse.avatar,
            id: `avatar_${Date.now()}`,
            productId: product?.id || webhookResponse.product?.id,
            createdAt: new Date().toISOString()
          };
          
          console.log('✅ Creating new avatar from webhook response:', newAvatar.name);
          
          const saveResult = saveAvatarDataWithSync(newAvatar);
          if (saveResult) {
            toast({
              title: "אווטאר נוצר",
              description: "נוצר אווטאר חדש עבור המוצר."
            });
            console.log('🚀 onComplete (avatar created):', { formData, product: product || webhookResponse.product, newAvatar, hasProduct, hasAvatar });
            // Ensure the avatar has the correct productId
            const avatarWithProductId = { ...newAvatar, productId: product?.id || webhookResponse.product?.id };
            onComplete(formData, product || webhookResponse.product, avatarWithProductId);
          } else {
            toast({
              title: "שגיאה",
              description: "לא ניתן היה לשמור את האווטאר החדש.",
              variant: "destructive"
            });
            console.log('🚀 onComplete (avatar save failed):', { formData, product: product || webhookResponse.product, hasProduct, hasAvatar });
            onComplete(formData, product || webhookResponse.product);
          }
        } else {
          console.log('🚀 onComplete (no avatar in webhook):', { formData, product: product || webhookResponse.product, hasProduct, hasAvatar });
          // Pass hasProduct/hasAvatar as a separate object for debugging
          // Ensure selectedAvatar has the correct productId
          const avatarWithProductId = selectedAvatar ? { ...selectedAvatar, productId: product?.id || webhookResponse.product?.id } : undefined;
          onComplete({ ...formData }, product || webhookResponse.product, avatarWithProductId);
        }
      } else {
        toast({
          title: "המשך ללא נתונים",
          description: "לא ניתן היה לעבד את המוצר, ממשיך ללא נתונים..."
        });
        console.log('🚀 onComplete (webhook failed):', { formData });
        // Ensure selectedAvatar has the correct productId
        const avatarWithProductId = selectedAvatar ? { ...selectedAvatar, productId: product?.id || webhookResponse.product?.id } : undefined;
        onComplete(formData, product || webhookResponse.product, avatarWithProductId);
      }
    } finally {
      setIsWebhookLoading(false);
      onWebhookComplete?.();
    }
  };

  const creativeTypes = [
    { 
      id: "ugc", 
      label: "UGC", 
      icon: Video, 
      description: "תוכן שנוצר על ידי משתמשים",
      type: "video",
      tag: "וידאו"
    },
    { 
      id: "product_info", 
      label: "מידע על המוצר", 
      icon: Info, 
      description: "הצגת מידע מפורט על המוצר",
      type: "static",
      tag: "סטטי"
    },
    { 
      id: "trendy_reel", 
      label: "רילס טרנדי", 
      icon: TrendingUp, 
      description: "רילס עם טרנדים עדכניים",
      type: "video",
      tag: "וידאו"
    },
    { 
      id: "product_explanation", 
      label: "הסבר על המוצר", 
      icon: Play, 
      description: "הסבר מפורט איך המוצר עובד",
      type: "video",
      tag: "וידאו"
    },
    { 
      id: "reviews", 
      label: "ביקורות", 
      icon: Image, 
      description: "ביקורות לקוחות על המוצר",
      type: "static",
      tag: "סטטי"
    },
    { 
      id: "carousel", 
      label: "קרוסלה", 
      icon: Layers, 
      description: "קרוסלה אינטראקטיבית",
      type: "static",
      tag: "סטטי"
    }
  ];

  const aiHelperContent = {
    title: "טיפים לכתיבת קריאייטיב בריף יעיל",
    tips: [
      "מיקוד - תאר בדיוק מה אתה רוצה לראות",
      "מה היתרונות העיקריים של המוצר",
      "ציין את קהל היעד שלך",
      "הגדר את הטון והסגנון הרצוי",
      "הוסף דוגמאות או השראה"
    ],
    examples: [
      {
        title: "מוצר טכנולוגי",
        example: "צור סרטון קצר שמציג את המהירות והפשטות של האפליקציה החדשה שלנו, עם דגש על חיסכון בזמן למשתמשים עסקיים"
      },
      {
        title: "מוצר בריאות",
        example: "הכן רילס שמראה איך המוצר עוזר לאנשים להרגיש יותר אנרגטיים ובריאים, עם עדויות של משתמשים מרוצים"
      },
      {
        title: "מוצר אופנה",
        example: "צור סט תמונות שמציג את האיכות והסגנון של הבגדים החדשים, עם דגש על התאמה מושלמת לכל גוף"
      }
    ]
  };

  return (
    <div className="space-y-6 text-right" dir="rtl">
      {/* Product Mode Toggle (only if products exist) */}
      {allProducts.length > 0 && (
        <div className="mb-8 flex justify-center">
          <ToggleGroup
            type="single"
            value={productMode}
            onValueChange={val => val && setProductMode(val as 'new' | 'existing')}
            className="bg-white rounded-full border border-gray-200 p-2 w-full max-w-xl shadow-sm flex items-center justify-center gap-2"
            size="default"
          >
            {/* Force brand navy (#1E2849) for selected, gray for unselected, no gold or blue. */}
            <ToggleGroupItem
              value="new"
              style={productMode === 'new' ? { background: '#1E2849', color: 'white' } : {}}
              className={`flex-1 px-8 py-4 text-lg font-semibold rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-200
                ${productMode === 'new' ? 'shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-blue-50 active:bg-blue-50'}
              `}
            >
              מוצר חדש (URL)
            </ToggleGroupItem>
            <ToggleGroupItem
              value="existing"
              style={productMode === 'existing' ? { background: '#1E2849', color: 'white' } : {}}
              className={`flex-1 px-8 py-4 text-lg font-semibold rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-200
                ${productMode === 'existing' ? 'shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-blue-50 active:bg-blue-50'}
              `}
            >
              מוצר קיים
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      )}

      {/* Product Input Section */}
      {allProducts.length === 0 || productMode === 'new' ? (
        // URL input for new product
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
              value={formData.productUrl || ""}
              onChange={handleUrlChange}
              className={`pr-10 text-right ${urlValidation.isValid ? 'border-green-500 focus:border-green-500' : 
                formData.productUrl && !urlValidation.isValid ? 'border-red-500 focus:border-red-500' : ''}`}
              dir="rtl"
            />
            {/* URL Validation Indicator */}
            <div className="absolute left-3 top-3">
              {urlValidation.isChecking ? (
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              ) : urlValidation.isValid ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : formData.productUrl && !urlValidation.isValid ? (
                <XCircle className="w-4 h-4 text-red-500" />
              ) : null}
            </div>
          </div>
          <p className="text-sm text-gray-500">
            קישור לעמוד המוצר שלך - נשתמש בו כדי להבין טוב יותר את המוצר
          </p>
          {urlValidation.isValid && (
            <p className="text-sm text-green-600 flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              URL תקין
            </p>
          )}
          {formData.productUrl && !urlValidation.isValid && !urlValidation.isChecking && (
            <p className="text-sm text-red-600 flex items-center gap-1">
              <XCircle className="w-3 h-3" />
              URL לא תקין
            </p>
          )}
        </div>
      ) : null}

      {allProducts.length > 0 && productMode === 'existing' && (
        // Product selector for existing product
        <div className="mb-6">
          <Label className="text-base font-medium block mb-3 text-gray-700">
            בחר מוצר קיים
          </Label>
          <div className="relative" ref={productSelectorRef}>
            {/* Selected Product Display */}
            {selectedProduct ? (
              <div className="relative">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl shadow-sm transition-all duration-300 hover:shadow-md">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                      <Package className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 text-right">{selectedProduct.name}</h4>
                      <p className="text-sm text-gray-600 text-right">{selectedProduct.description}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleClearProduct}
                    className="p-2 rounded-full bg-white border border-gray-200 hover:bg-red-50 hover:border-red-300 transition-all duration-200 text-gray-400 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-red-200"
                    aria-label="נקה בחירת מוצר"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>
                {/* Related Avatars Info */}
                {relatedAvatars.length > 0 && (
                  <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-700 text-right">
                      נמצאו {relatedAvatars.length} אווטארים קיימים למוצר זה
                    </p>
                  </div>
                )}
              </div>
            ) : (
              /* Product Selector Dropdown */
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsProductSelectorOpen(!isProductSelectorOpen)}
                  className="w-full flex items-center justify-between p-4 bg-white border-2 border-gray-200 rounded-xl shadow-sm transition-all duration-300 hover:border-blue-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
        >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                      <Package className="w-5 h-5 text-gray-500" />
                    </div>
                    <span className="text-gray-500 font-medium">בחר מוצר מהרשימה</span>
                  </div>
                  <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isProductSelectorOpen ? 'rotate-180' : ''}`} />
                </button>
                {/* Dropdown Content */}
                {isProductSelectorOpen && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-lg z-50 max-h-80 overflow-hidden animate-in slide-in-from-top-2 duration-200">
                    {/* Search Input */}
                    <div className="p-3 border-b border-gray-100">
                      <div className="relative">
                        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="חפש מוצרים..."
                          value={productSearchTerm}
                          onChange={(e) => setProductSearchTerm(e.target.value)}
                          onKeyDown={handleKeyDown}
                          className="w-full pr-10 pl-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 text-right"
                          dir="rtl"
                        />
                      </div>
                    </div>
                    {/* Products List */}
                    <div className="max-h-60 overflow-y-auto">
                      {filteredProducts.length > 0 ? (
                        filteredProducts.map((product) => (
                          <button
                            key={product.id}
                            type="button"
                            onClick={() => handleProductSelect(product)}
                            className="w-full p-3 hover:bg-blue-50 transition-colors duration-200 border-b border-gray-100 last:border-b-0 text-right"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center">
                                <Package className="w-5 h-5 text-blue-600" />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900">{product.name}</h4>
                                <p className="text-sm text-gray-600 truncate">{product.description}</p>
                              </div>
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="p-4 text-center text-gray-500">
                          {productSearchTerm ? 'לא נמצאו מוצרים' : 'אין מוצרים זמינים'}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
      </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Creative Brief */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
          <Label htmlFor="brief" className="text-base font-medium">
              קריאייטיב בריף *
          </Label>
            <Popover>
              <PopoverTrigger asChild>
                <button type="button" tabIndex={0} aria-label="עזרה לכתיבת בריף" className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-gray-100 text-brand-primary hover:text-blue-700 cursor-pointer border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-primary">
                  <HelpCircle className="h-4 w-4" />
                </button>
              </PopoverTrigger>
              <PopoverContent side="left" className="max-w-md w-[400px] p-6 rounded-xl shadow-xl bg-white border border-blue-100 text-right">
                <div className="space-y-5">
                  <h4 className="font-extrabold text-2xl text-brand-primary text-[#1E2849] mb-3 leading-tight tracking-tight text-center">
                    {aiHelperContent.title}
                  </h4>
                  <div className="bg-blue-50/80 border border-blue-100 rounded-lg p-4 mb-2">
                    <p className="font-bold text-base text-brand-primary text-[#1E2849] mb-3 text-center">טיפים:</p>
                    <ul className="text-base space-y-2 pr-2 font-medium text-[#1E2849]">
                      {aiHelperContent.tips.map((tip, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-brand-primary text-[#1E2849] text-lg">•</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="mt-2">
                    <p className="font-bold text-base text-blue-700 mb-2 text-center">דוגמאות:</p>
                    <div className="space-y-3">
                      {aiHelperContent.examples.map((example, index) => (
                        <div key={index} className="text-sm bg-blue-50 border border-blue-100 rounded-md p-3">
                          <p className="font-bold text-blue-700 mb-1">{example.title}:</p>
                          <p className="text-[#1E2849]">{example.example}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
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

        {/* Creative Type */}
        <div className="space-y-4">
          <Label className="text-base font-medium">סוג קריאייטיב *</Label>
          <RadioGroup
            value={formData.creativeType}
            onValueChange={(value) => setFormData(prev => ({ ...prev, creativeType: value }))}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
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
                  className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-popover p-4 hover:bg-brand-primary hover:text-brand-light peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-colors relative"
                >
                  <Badge 
                    variant={type.type === 'video' ? 'default' : 'secondary'} 
                    className="absolute top-2 left-2 text-xs"
                  >
                    {type.tag}
                  </Badge>
                  <type.icon className="mb-3 h-6 w-6 mt-2" />
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
            disabled={
              isWebhookLoading ||
              !formData.brief.trim() ||
              (productMode === 'new'
                ? (!formData.productUrl.trim() || !urlValidation.isValid)
                : (allProducts.length > 0 && productMode === 'existing' && !selectedProduct)
              )
            }
            className="gradient-primary text-white min-w-[220px] text-lg font-bold rounded-full py-4 shadow-lg hover:text-brand-light"
          >
            {isWebhookLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                מעבד...
              </>
            ) : (
              <>
                המשך לאווטאר
                <ArrowRight className="w-4 h-4 mr-2" />
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}