import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { 
  Trash2, 
  Download, 
  Eye, 
  RefreshCw, 
  Package, 
  Users, 
  FileText,
  Calendar,
  Tag,
  DollarSign,
  Image,
  Settings,
  Plus
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { 
  getProductData, 
  getAvatarData, 
  clearStoredData, 
  type ProductData, 
  type AvatarData 
} from "@/lib/make-integration";
import { 
  useSynchronizedData,
  updateProductDataWithSync,
  updateAvatarDataWithSync,
  deleteProductDataWithSync,
  deleteAvatarDataWithSync,
  saveProductDataWithSync,
  saveAvatarDataWithSync
} from "@/lib/data-sync";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function DataManagement() {
  // Use synchronized data hook instead of manual state management
  const { products, avatars, isLoading, reloadData } = useSynchronizedData();
  const [selectedProduct, setSelectedProduct] = useState<ProductData | null>(null);
  const [selectedAvatar, setSelectedAvatar] = useState<AvatarData | null>(null);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editingAvatarId, setEditingAvatarId] = useState<string | null>(null);
  const [editProductData, setEditProductData] = useState<Partial<ProductData>>({});
  const [editAvatarData, setEditAvatarData] = useState<Partial<AvatarData>>({});
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createType, setCreateType] = useState<'product' | 'avatar' | null>(null);
  const [newProduct, setNewProduct] = useState<Partial<ProductData>>({});
  const [newAvatar, setNewAvatar] = useState<Partial<AvatarData>>({});
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'product' | 'avatar'; id: string } | null>(null);

  // Ensure IDs are set for existing data
  useEffect(() => {
    if (products.length > 0 || avatars.length > 0) {
      console.log('📊 Data loaded with sync:', { 
        products: products.length, 
        avatars: avatars.length 
      });
    }
  }, [products.length, avatars.length]);

  // Make debug functions available globally
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).debugAvatarConnections = () => {
        const { debugAvatarProductConnections } = require('@/lib/debug-avatar-connection');
        debugAvatarProductConnections();
      };
      (window as any).checkConnectionForUrl = (url: string) => {
        const { checkConnectionForUrl } = require('@/lib/debug-avatar-connection');
        checkConnectionForUrl(url);
      };
      (window as any).getAllData = () => ({ products, avatars });
      
      // Add test functions
      (window as any).runDuplicateTests = () => {
        const { runAllDuplicateDetectionTests } = require('@/lib/test-duplicate-detection');
        runAllDuplicateDetectionTests();
      };
      
      (window as any).testRealDuplicate = () => {
        const { testRealDuplicateDetection } = require('@/lib/test-real-duplicate-detection');
        testRealDuplicateDetection();
      };
      
      (window as any).testSyncDuplicate = () => {
        const { testSynchronousDuplicateCheck } = require('@/lib/test-synchronous-duplicate-check');
        testSynchronousDuplicateCheck();
      };
      
      (window as any).testCompleteFlow = () => {
        const { testCompleteFlow } = require('@/lib/test-synchronous-duplicate-check');
        testCompleteFlow();
      };
      
      console.log('🔧 Debug functions available:');
      console.log('  - debugAvatarConnections() - Check all connections');
      console.log('  - checkConnectionForUrl(url) - Check specific URL');
      console.log('  - getAllData() - Get all data');
      console.log('  - runDuplicateTests() - Run duplicate detection tests');
      console.log('  - testRealDuplicate() - Test real duplicate detection');
      console.log('  - testSyncDuplicate() - Test synchronous duplicate check');
      console.log('  - testCompleteFlow() - Test complete flow');
    }
  }, [products, avatars]);

  const handleClearAllData = () => {
    if (confirm('האם אתה בטוח שברצונך למחוק את כל הנתונים? פעולה זו אינה הפיכה.')) {
      clearStoredData();
      setSelectedProduct(null);
      setSelectedAvatar(null);
      toast({
        title: "נתונים נמחקו",
        description: "כל הנתונים נמחקו בהצלחה"
      });
    }
  };

  const handleExportData = () => {
    const data = {
      products,
      avatars,
      exportDate: new Date().toISOString(),
      totalProducts: products.length,
      totalAvatars: avatars.length
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `webhook-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "נתונים יוצאו",
      description: "הנתונים יוצאו בהצלחה לקובץ JSON"
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('he-IL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: currency || 'ILS'
    }).format(price);
  };

  const countProductsWithReadyCreatives = (products: ProductData[]): number => {
    return products.length;
  };

  const countAvatarsWithReadyCreatives = (avatars: AvatarData[]): number => {
    return avatars.length;
  };

  const handleEditProduct = (product: ProductData) => {
    if (!product) return;
    setEditingProductId(product.id || "temp-" + Math.random());
    // Ensure we have the latest data from the synchronized state
    const currentProduct = products.find(p => p.id === product.id);
    setEditProductData({ ...currentProduct });
    console.log('🔧 Editing product with data:', currentProduct);
  };

  const handleEditAvatar = (avatar: AvatarData) => {
    if (!avatar) return;
    setEditingAvatarId(avatar.id || "temp-" + Math.random());
    // Ensure we have the latest data from the synchronized state
    const currentAvatar = avatars.find(a => a.id === avatar.id);
    setEditAvatarData({ ...currentAvatar });
    console.log('🔧 Editing avatar with data:', currentAvatar);
  };

  const handleSaveProduct = () => {
    if (!editProductData.id) return setEditingProductId(null);
    updateProductDataWithSync(editProductData as ProductData);
    setEditingProductId(null);
    toast({ title: "עודכן בהצלחה", description: "המוצר עודכן ושמור." });
  };

  const handleSaveAvatar = () => {
    if (!editAvatarData.id) return setEditingAvatarId(null);
    console.log('[Avatar Edit] Saving avatar:', editAvatarData);
    updateAvatarDataWithSync(editAvatarData as AvatarData);
    setEditingAvatarId(null);
    reloadData(); // force UI sync
    console.log('[Avatar Edit] All avatars after save:', getAvatarData());
    console.log('[Avatar Edit] All products after save:', getProductData());
    toast({ title: "עודכן בהצלחה", description: "האווטאר עודכן ושמור." });
  };

  const handleOpenCreate = (type: 'product' | 'avatar') => {
    setCreateType(type);
    setCreateModalOpen(true);
    setNewProduct({});
    setNewAvatar({});
  };

  const handleCreateProduct = () => {
    if (!newProduct.name || !newProduct.description) return;
    // Prevent duplicate products by URL only (not name)
    const exists = products.some(p => {
      const urlMatch = newProduct.imageUrl && p.imageUrl && 
                      p.imageUrl.trim().toLowerCase() === newProduct.imageUrl.trim().toLowerCase();
      return urlMatch;
    });
    if (exists) {
      toast({ title: 'מוצר קיים', description: 'המוצר כבר קיים, נעשה בו שימוש.' });
      setCreateModalOpen(false);
      return;
    }
    const created: ProductData = {
      id: `prod_${Date.now()}`,
      name: newProduct.name || '',
      description: newProduct.description || '',
      price: newProduct.price || 0,
      currency: newProduct.currency || 'ILS',
      imageUrl: newProduct.imageUrl || '',
      category: newProduct.category || '',
      brand: newProduct.brand || '',
      features: newProduct.features || [],
      specifications: newProduct.specifications || {},
      createdAt: new Date().toISOString(),
    };
    console.log('[Product Creation] product:', created);
    saveProductDataWithSync(created);
    setCreateModalOpen(false);
    reloadData(); // force UI sync
    console.log('[Product Creation] All products after save:', getProductData());
    toast({ title: 'מוצר נוצר', description: 'המוצר נשמר בהצלחה!' });
  };

  const handleCreateAvatar = () => {
    if (!newAvatar.name || !newAvatar.age || !newAvatar.gender) return;
    // Require product selection for avatar creation
    if (!newAvatar.productId) {
      toast({ 
        title: 'שגיאה', 
        description: 'יש לבחור מוצר עבור האווטאר',
        variant: "destructive"
      });
      return;
    }
    // Prevent duplicate avatars by name + productId + age + gender
    const exists = avatars.some(a => {
      const nameMatch = a.name.trim().toLowerCase() === newAvatar.name.trim().toLowerCase();
      const productMatch = a.productId === newAvatar.productId;
      const ageMatch = a.age === newAvatar.age;
      const genderMatch = a.gender === newAvatar.gender;
      
      // Consider it a duplicate if name matches and either productId matches OR age+gender match
      return nameMatch && (productMatch || (ageMatch && genderMatch));
    });
    if (exists) {
      toast({ title: 'אווטאר קיים', description: 'האווטאר כבר קיים, נעשה בו שימוש.' });
      setCreateModalOpen(false);
      return;
    }
    const created: AvatarData = {
      id: `avatar_${Date.now()}`,
      name: newAvatar.name || '',
      age: newAvatar.age || '',
      gender: newAvatar.gender || '',
      personality: newAvatar.personality || '',
      interests: newAvatar.interests || [],
      background: newAvatar.background || '',
      goals: newAvatar.goals || '',
      painPoints: newAvatar.painPoints || [],
      objections: newAvatar.objections || [],
      dreamOutcome: newAvatar.dreamOutcome || [],
      preferences: newAvatar.preferences || {},
      createdAt: new Date().toISOString(),
      productId: newAvatar.productId || '',
    };
    console.log('[Avatar Creation] productId:', created.productId, 'avatar:', created);
    saveAvatarDataWithSync(created);
    setCreateModalOpen(false);
    reloadData(); // force UI sync
    console.log('[Avatar Creation] All avatars after save:', getAvatarData());
    console.log('[Avatar Creation] All products after save:', getProductData());
    toast({ title: 'אווטאר נוצר', description: 'האווטאר נשמר בהצלחה!' });
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === 'product') {
      deleteProductDataWithSync(deleteTarget.id);
      toast({ title: 'מוצר נמחק', description: 'המוצר נמחק בהצלחה!' });
    } else if (deleteTarget.type === 'avatar') {
      deleteAvatarDataWithSync(deleteTarget.id);
      toast({ title: 'אווטאר נמחק', description: 'האווטאר נמחק בהצלחה!' });
    }
    setDeleteTarget(null);
  };

  // Helper to format age nicely
  const formatAvatarAge = (age: string | string[]) => {
    if (Array.isArray(age)) return age.join(' - ');
    if (typeof age === 'string' && age.includes(',')) return age.split(',').map(a => a.trim()).join(' - ');
    return age;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 text-right" dir="rtl">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <SidebarTrigger />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">ניהול נתונים</h1>
              <p className="text-gray-600 mt-1">צפה, נהל וייצא את כל הנתונים מהוובוק</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={reloadData} 
              variant="outline"
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              רענן
            </Button>
            <Button 
              onClick={handleExportData}
              variant="outline"
              disabled={products.length === 0 && avatars.length === 0}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              ייצא נתונים
            </Button>
            <Button 
              onClick={handleClearAllData}
              variant="destructive"
              disabled={products.length === 0 && avatars.length === 0}
              className="flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              מחק הכל
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Products with ready creatives (leftmost) */}
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">מוצרים עם קריאייטיב מוכן</p>
                  <p className="text-2xl font-bold text-blue-600">{countProductsWithReadyCreatives(products)}</p>
                </div>
                <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                  <Package className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Avatars with ready creatives */}
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">אווטארים עם קריאייטיב מוכן</p>
                  <p className="text-2xl font-bold text-green-600">{countAvatarsWithReadyCreatives(avatars)}</p>
                </div>
                <div className="p-3 rounded-full bg-green-100 text-green-600">
                  <Users className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Avatars number (right) */}
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">מספר אווטארים</p>
                  <p className="text-2xl font-bold text-green-600">{avatars.length}</p>
                </div>
                <div className="p-3 rounded-full bg-green-100 text-green-600">
                  <Users className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Product number (rightmost) */}
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">מספר מוצרים</p>
                  <p className="text-2xl font-bold text-yellow-600">{products.length}</p>
                </div>
                <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                  <Tag className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Data Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Products Table */}
          <Card className="shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    מוצרים ({products.length})
                  </CardTitle>
                  <CardDescription>
                    כל המוצרים שלך
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  className="flex items-center gap-2"
                  onClick={() => { setCreateType('product'); setCreateModalOpen(true); }}
                >
                  <Plus className="w-4 h-4" />
                  הוסף מוצר
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {products.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>אין מוצרים מאוחסנים</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {products.map((product, index) => {
                    const linkedAvatars = avatars.filter(a => a.productId === product.id);
                    return (
                      <div 
                        key={product.id || index}
                        className="p-5 border rounded-2xl shadow-sm bg-white hover:bg-blue-50 flex flex-col gap-2 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-bold text-lg text-gray-900 truncate max-w-[70%]">{product.name}</h4>
                          <div className="flex gap-2">
                            <button type="button" className="p-2 rounded-full hover:bg-blue-100 transition-colors" onClick={() => handleEditProduct(product)}>
                              <Eye className="w-5 h-5 text-blue-500" />
                            </button>
                            <button type="button" className="p-2 rounded-full hover:bg-red-100 transition-colors" onClick={() => setDeleteTarget({ type: 'product', id: product.id })}>
                              <Trash2 className="w-5 h-5 text-red-500" />
                            </button>
                          </div>
                        </div>
                        <div className="text-gray-600 text-sm mb-2 truncate">{product.description}</div>
                        <div className="flex flex-wrap gap-2 items-center mb-1">
                          <span className="text-green-700 font-bold text-base">{formatPrice(product.price || 0, product.currency || 'ILS')}</span>
                          <span className="badge-gold rounded px-3 py-1 text-xs">{product.category || 'ללא קטגוריה'}</span>
                          <span className="bg-green-100 text-green-700 rounded px-3 py-1 text-xs font-medium">
                            👥 {linkedAvatars.length} אווטארים
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2 items-center text-xs text-gray-500">
                          <span>
                            {product.createdAt
                              ? `נוצר בתאריך: ${formatDate(product.createdAt)}`
                              : 'תאריך לא ידוע'}
                          </span>
                          {product.brand && <span>מותג: {product.brand}</span>}
                          {linkedAvatars.length > 0 && (
                            <span className="text-green-600">
                              • אווטארים: {linkedAvatars.map(a => a.name).join(', ')}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Avatars Table */}
          <Card className="shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    אווטארים ({avatars.length})
                  </CardTitle>
                  <CardDescription>
                    כל האווטארים שלך
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  className="flex items-center gap-2"
                  onClick={() => { setCreateType('avatar'); setCreateModalOpen(true); }}
                >
                  <Plus className="w-4 h-4" />
                  הוסף אווטאר
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {avatars.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>אין אווטארים מאוחסנים</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {avatars.map((avatar, index) => {
                    const relatedProduct = products.find(p => p.id === avatar.productId);
                    return (
                      <div 
                        key={avatar.id || index}
                        className="p-5 border rounded-2xl shadow-sm bg-white hover:bg-green-50 flex flex-col gap-2 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-bold text-lg text-gray-900 truncate max-w-[70%]">{avatar.name}</h4>
                          <div className="flex gap-2">
                            <button type="button" className="p-2 rounded-full hover:bg-green-100 transition-colors" onClick={() => handleEditAvatar(avatar)}>
                              <Eye className="w-5 h-5 text-green-600" />
                            </button>
                            <button type="button" className="p-2 rounded-full hover:bg-red-100 transition-colors" onClick={() => setDeleteTarget({ type: 'avatar', id: avatar.id })}>
                              <Trash2 className="w-5 h-5 text-red-500" />
                            </button>
                          </div>
                        </div>
                        <div className="text-gray-600 text-sm mb-2 truncate">{avatar.personality || 'ללא תיאור'}</div>
                        <div className="flex flex-wrap gap-2 items-center mb-1">
                          <Badge variant="outline">{formatAvatarAge(avatar.age) || 'גיל לא ידוע'}</Badge>
                          <Badge variant="outline">{avatar.gender || 'מין לא ידוע'}</Badge>
                          {relatedProduct ? (
                            <span className="bg-green-100 text-green-700 rounded px-3 py-1 text-xs font-medium">
                              ✅ {relatedProduct.name}
                            </span>
                          ) : (
                            <span className="bg-red-100 text-red-700 rounded px-3 py-1 text-xs font-medium">
                              ⚠️ ללא מוצר
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2 items-center text-xs text-gray-500">
                          <span>
                            {avatar.createdAt
                              ? `נוצר בתאריך: ${formatDate(avatar.createdAt)}`
                              : 'תאריך לא ידוע'}
                          </span>
                          {relatedProduct && (
                            <span className="text-blue-600">
                              • מוצר: {relatedProduct.name}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Product Edit Modal */}
        <Dialog open={!!editingProductId} onOpenChange={open => !open && setEditingProductId(null)}>
          <DialogContent className="max-w-lg w-full p-8 rounded-2xl shadow-2xl bg-white border border-blue-200" dir="rtl">
            <DialogHeader>
              <DialogTitle className="text-blue-700 text-2xl font-extrabold mb-2 text-right">עריכת מוצר</DialogTitle>
              <p className="text-gray-500 text-sm mb-4 text-right">מלא את כל שדות המוצר שלך</p>
            </DialogHeader>
            <div className="space-y-4 bg-blue-50/40 p-4 rounded-xl">
              <div>
                <label className="block font-bold mb-1 text-blue-900">שם מוצר</label>
                <Input value={editProductData.name || ''} onChange={e => setEditProductData(d => ({ ...d, name: e.target.value }))} placeholder="שם מוצר" className="text-right" />
              </div>
              <div>
                <label className="block font-bold mb-1 text-blue-900">תיאור</label>
                <Textarea value={editProductData.description || ''} onChange={e => setEditProductData(d => ({ ...d, description: e.target.value }))} placeholder="תיאור" className="text-right min-h-[60px]" />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block font-bold mb-1 text-blue-900">מחיר</label>
                  <Input type="number" value={editProductData.price || ''} onChange={e => setEditProductData(d => ({ ...d, price: Number(e.target.value) }))} placeholder="מחיר" className="text-right" />
                </div>
                <div className="flex-1">
                  <label className="block font-bold mb-1 text-blue-900">קטגוריה</label>
                  <Input value={editProductData.category || ''} onChange={e => setEditProductData(d => ({ ...d, category: e.target.value }))} placeholder="קטגוריה" className="text-right" />
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block font-bold mb-1 text-blue-900">מותג</label>
                  <Input value={editProductData.brand || ''} onChange={e => setEditProductData(d => ({ ...d, brand: e.target.value }))} placeholder="מותג" className="text-right" />
                </div>
                <div className="flex-1">
                  <label className="block font-bold mb-1 text-blue-900">תכונות (מופרדות בפסיק)</label>
                  <Textarea value={editProductData.features ? editProductData.features.join(", ") : ''} onChange={e => setEditProductData(d => ({ ...d, features: e.target.value.split(",").map(f => f.trim()) }))} placeholder="תכונות (מופרדות בפסיק)" className="text-right min-h-[40px]" />
                </div>
              </div>
            </div>
            <DialogFooter className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setEditingProductId(null)}>ביטול</Button>
              <Button onClick={handleSaveProduct} className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2 rounded-lg shadow">שמור</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Avatar Edit Modal */}
        <Dialog open={!!editingAvatarId} onOpenChange={open => !open && setEditingAvatarId(null)}>
          <DialogContent className="max-w-lg w-full p-8 rounded-2xl shadow-2xl bg-white border border-green-200" dir="rtl">
            <DialogHeader>
              <DialogTitle className="text-green-700 text-2xl font-extrabold mb-2 text-right">עריכת אווטאר</DialogTitle>
              <p className="text-gray-500 text-sm mb-4 text-right">מלא את כל שדות האווטאר שלך</p>
            </DialogHeader>
            <div className="space-y-4 bg-green-50/40 p-4 rounded-xl">
              <div>
                <label className="block font-bold mb-1 text-green-900">שם אווטאר</label>
                <Input value={editAvatarData.name || ''} onChange={e => setEditAvatarData(d => ({ ...d, name: e.target.value }))} placeholder="שם אווטאר" className="text-right" />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block font-bold mb-1 text-green-900">גיל</label>
                  <Input value={editAvatarData.age || ''} onChange={e => setEditAvatarData(d => ({ ...d, age: e.target.value }))} placeholder="גיל" className="text-right" />
                </div>
                <div className="flex-1">
                  <label className="block font-bold mb-1 text-green-900">מין</label>
                  <Input value={editAvatarData.gender || ''} onChange={e => setEditAvatarData(d => ({ ...d, gender: e.target.value }))} placeholder="מין" className="text-right" />
                </div>
              </div>
              <div>
                <label className="block font-bold mb-1 text-green-900">מוצר קשור</label>
                <select
                  className="w-full p-2 rounded border border-green-300 text-right bg-white"
                  value={editAvatarData.productId || ''}
                  onChange={e => setEditAvatarData(d => ({ ...d, productId: e.target.value }))}
                  required={products.length > 0}
                >
                  <option value="">ללא מוצר</option>
                  {products.map(product => (
                    <option key={product.id} value={product.id}>{product.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-bold mb-1 text-green-900">תחומי עניין (מופרדים בפסיק)</label>
                <Textarea value={editAvatarData.interests ? editAvatarData.interests.join(", ") : ''} onChange={e => setEditAvatarData(d => ({ ...d, interests: e.target.value.split(",").map(f => f.trim()) }))} placeholder="תחומי עניין (מופרדים בפסיק)" className="text-right min-h-[40px]" />
              </div>
              <div>
                <label className="block font-bold mb-1 text-green-900">נקודות כאב (מופרדות בפסיק)</label>
                <Textarea value={editAvatarData.painPoints ? editAvatarData.painPoints.join(", ") : ''} onChange={e => setEditAvatarData(d => ({ ...d, painPoints: e.target.value.split(",").map(f => f.trim()) }))} placeholder="נקודות כאב (מופרדות בפסיק)" className="text-right min-h-[40px]" />
              </div>
              <div>
                <label className="block font-bold mb-1 text-green-900">התנגדויות (מופרדות בפסיק)</label>
                <Textarea value={editAvatarData.objections ? editAvatarData.objections.join(", ") : ''} onChange={e => setEditAvatarData(d => ({ ...d, objections: e.target.value.split(",").map(f => f.trim()) }))} placeholder="התנגדויות (מופרדות בפסיק)" className="text-right min-h-[40px]" />
              </div>
              <div>
                <label className="block font-bold mb-1 text-green-900">תוצאת החלום (מופרדות בפסיק)</label>
                <Textarea value={editAvatarData.dreamOutcome ? editAvatarData.dreamOutcome.join(", ") : ''} onChange={e => setEditAvatarData(d => ({ ...d, dreamOutcome: e.target.value.split(",").map(f => f.trim()) }))} placeholder="תוצאת החלום (מופרדות בפסיק)" className="text-right min-h-[40px]" />
              </div>
            </div>
            <DialogFooter className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setEditingAvatarId(null)}>ביטול</Button>
              <Button onClick={handleSaveAvatar} className="bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-2 rounded-lg shadow">שמור</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Detail Modals */}
        {selectedProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">פרטי מוצר</h2>
                <Button onClick={() => setSelectedProduct(null)} variant="outline" size="sm">
                  סגור
                </Button>
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold">{selectedProduct.name}</h3>
                  <p className="text-gray-600">{selectedProduct.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="font-medium">מחיר:</span>
                    <span className="text-green-600 font-bold mr-2">
                      {formatPrice(selectedProduct.price || 0, selectedProduct.currency || 'ILS')}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">קטגוריה:</span>
                    <Badge className="mr-2">{selectedProduct.category || 'ללא קטגוריה'}</Badge>
                  </div>
                  <div>
                    <span className="font-medium">מותג:</span>
                    <span className="mr-2">{selectedProduct.brand || 'ללא מותג'}</span>
                  </div>
                  <div>
                    <span className="font-medium">תאריך יצירה:</span>
                    <span className="mr-2">
                      {selectedProduct.createdAt ? formatDate(selectedProduct.createdAt) : 'תאריך לא ידוע'}
                    </span>
                  </div>
                </div>
                {selectedProduct.features && selectedProduct.features.length > 0 && (
                  <div>
                    <span className="font-medium">תכונות:</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {selectedProduct.features.map((feature, index) => (
                        <Badge key={index} variant="secondary">{feature}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {selectedProduct.imageUrl && (
                  <div>
                    <span className="font-medium">תמונה:</span>
                    <img 
                      src={selectedProduct.imageUrl} 
                      alt={selectedProduct.name}
                      className="mt-2 max-w-full h-32 object-cover rounded-lg"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {selectedAvatar && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">פרטי אווטאר</h2>
                <Button onClick={() => setSelectedAvatar(null)} variant="outline" size="sm">
                  סגור
                </Button>
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold">{selectedAvatar.name}</h3>
                  <p className="text-gray-600">{selectedAvatar.personality || 'ללא תיאור'}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="font-medium">גיל:</span>
                    <Badge className="mr-2">{selectedAvatar.age || 'גיל לא ידוע'}</Badge>
                  </div>
                  <div>
                    <span className="font-medium">מין:</span>
                    <Badge className="mr-2">{selectedAvatar.gender || 'מין לא ידוע'}</Badge>
                  </div>
                  <div>
                    <span className="font-medium">רקע:</span>
                    <span className="mr-2">{selectedAvatar.background || 'ללא רקע'}</span>
                  </div>
                  <div>
                    <span className="font-medium">תאריך יצירה:</span>
                    <span className="mr-2">
                      {selectedAvatar.createdAt ? formatDate(selectedAvatar.createdAt) : 'תאריך לא ידוע'}
                    </span>
                  </div>
                </div>
                {selectedAvatar.interests && selectedAvatar.interests.length > 0 && (
                  <div>
                    <span className="font-medium">תחומי עניין:</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {selectedAvatar.interests.map((interest, index) => (
                        <Badge key={index} variant="secondary">{interest}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {selectedAvatar.painPoints && selectedAvatar.painPoints.length > 0 && (
                  <div>
                    <span className="font-medium">נקודות כאב:</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {selectedAvatar.painPoints.map((point, index) => (
                        <Badge key={index} variant="destructive">{point}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {selectedAvatar.objections && selectedAvatar.objections.length > 0 && (
                  <div>
                    <span className="font-medium">התנגדויות:</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {selectedAvatar.objections.map((objection, index) => (
                        <Badge key={index} variant="outline">{objection}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {selectedAvatar.dreamOutcome && selectedAvatar.dreamOutcome.length > 0 && (
                  <div>
                    <span className="font-medium">תוצאת החלום:</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {selectedAvatar.dreamOutcome.map((outcome, index) => (
                        <Badge key={index} variant="secondary">{outcome}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <span className="font-medium">מטרות:</span>
                  <p className="mt-1 text-gray-600">{selectedAvatar.goals || 'ללא מטרות מוגדרות'}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Create Modal */}
        <Dialog open={createModalOpen} onOpenChange={open => { setCreateModalOpen(open); if (!open) setCreateType(null); }}>
          <DialogContent className="max-w-lg w-full p-8 rounded-2xl shadow-2xl bg-white border border-blue-200" dir="rtl">
            <DialogHeader>
              <DialogTitle className="text-blue-700 text-2xl font-extrabold mb-2 text-right">צור חדש</DialogTitle>
              <p className="text-gray-500 text-sm mb-4 text-right">בחר מה ברצונך ליצור ומלא את כל השדות</p>
            </DialogHeader>
            {!createType ? (
              <div className="flex gap-6 justify-center mt-4">
                <button className="flex flex-col items-center gap-2 p-6 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 transition" onClick={() => handleOpenCreate('product')}>
                  <Package className="w-8 h-8 text-blue-600" />
                  <span className="font-bold text-blue-700">מוצר חדש</span>
                </button>
                <button className="flex flex-col items-center gap-2 p-6 rounded-xl border border-green-200 bg-green-50 hover:bg-green-100 transition" onClick={() => handleOpenCreate('avatar')}>
                  <Users className="w-8 h-8 text-green-600" />
                  <span className="font-bold text-green-700">אווטאר חדש</span>
                </button>
              </div>
            ) : createType === 'product' ? (
              <form className="space-y-4 bg-blue-50/40 p-4 rounded-xl" onSubmit={e => { e.preventDefault(); handleCreateProduct(); }}>
                <div>
                  <label className="block font-bold mb-1 text-blue-900">שם מוצר</label>
                  <Input value={newProduct.name || ''} onChange={e => setNewProduct(d => ({ ...d, name: e.target.value }))} placeholder="שם מוצר" className="text-right" required />
                </div>
                <div>
                  <label className="block font-bold mb-1 text-blue-900">תיאור</label>
                  <Textarea value={newProduct.description || ''} onChange={e => setNewProduct(d => ({ ...d, description: e.target.value }))} placeholder="תיאור" className="text-right min-h-[60px]" required />
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block font-bold mb-1 text-blue-900">מחיר</label>
                    <Input type="number" value={newProduct.price || ''} onChange={e => setNewProduct(d => ({ ...d, price: Number(e.target.value) }))} placeholder="מחיר" className="text-right" />
                  </div>
                  <div className="flex-1">
                    <label className="block font-bold mb-1 text-blue-900">קטגוריה</label>
                    <Input value={newProduct.category || ''} onChange={e => setNewProduct(d => ({ ...d, category: e.target.value }))} placeholder="קטגוריה" className="text-right" />
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block font-bold mb-1 text-blue-900">מותג</label>
                    <Input value={newProduct.brand || ''} onChange={e => setNewProduct(d => ({ ...d, brand: e.target.value }))} placeholder="מותג" className="text-right" />
                  </div>
                  <div className="flex-1">
                    <label className="block font-bold mb-1 text-blue-900">תכונות (מופרדות בפסיק)</label>
                    <Textarea value={newProduct.features ? newProduct.features.join(", ") : ''} onChange={e => setNewProduct(d => ({ ...d, features: e.target.value.split(",").map(f => f.trim()) }))} placeholder="תכונות (מופרדות בפסיק)" className="text-right min-h-[40px]" />
                  </div>
                </div>
                <DialogFooter className="flex justify-end gap-2 mt-6">
                  <Button variant="outline" onClick={() => setCreateModalOpen(false)}>ביטול</Button>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2 rounded-lg shadow">צור מוצר</Button>
                </DialogFooter>
              </form>
            ) : (
              <form className="space-y-4 bg-green-50/40 p-4 rounded-xl" onSubmit={e => { e.preventDefault(); handleCreateAvatar(); }}>
                <div>
                  <label className="block font-bold mb-1 text-green-900">שם אווטאר</label>
                  <Input value={newAvatar.name || ''} onChange={e => setNewAvatar(d => ({ ...d, name: e.target.value }))} placeholder="שם אווטאר" className="text-right" required />
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block font-bold mb-1 text-green-900">גיל</label>
                    <Input value={newAvatar.age || ''} onChange={e => setNewAvatar(d => ({ ...d, age: e.target.value }))} placeholder="גיל" className="text-right" required />
                  </div>
                  <div className="flex-1">
                    <label className="block font-bold mb-1 text-green-900">מין</label>
                    <Input value={newAvatar.gender || ''} onChange={e => setNewAvatar(d => ({ ...d, gender: e.target.value }))} placeholder="מין" className="text-right" required />
                  </div>
                </div>
                <div>
                  <label className="block font-bold mb-1 text-green-900">מוצר קשור *</label>
                  <select
                    className="w-full p-2 rounded border border-green-300 text-right bg-white"
                    value={newAvatar.productId || ''}
                    onChange={e => setNewAvatar(d => ({ ...d, productId: e.target.value }))}
                    required
                  >
                    <option value="">בחר מוצר (חובה)</option>
                    {products.map(product => (
                      <option key={product.id} value={product.id}>{product.name}</option>
                    ))}
                  </select>
                  {products.length === 0 && (
                    <p className="text-sm text-red-600 mt-1">יש ליצור מוצר תחילה</p>
                  )}
                </div>
                <div>
                  <label className="block font-bold mb-1 text-green-900">תחומי עניין (מופרדים בפסיק)</label>
                  <Textarea value={newAvatar.interests ? newAvatar.interests.join(", ") : ''} onChange={e => setNewAvatar(d => ({ ...d, interests: e.target.value.split(",").map(f => f.trim()) }))} placeholder="תחומי עניין (מופרדים בפסיק)" className="text-right min-h-[40px]" />
                </div>
                <div>
                  <label className="block font-bold mb-1 text-green-900">נקודות כאב (מופרדות בפסיק)</label>
                  <Textarea value={newAvatar.painPoints ? newAvatar.painPoints.join(", ") : ''} onChange={e => setNewAvatar(d => ({ ...d, painPoints: e.target.value.split(",").map(f => f.trim()) }))} placeholder="נקודות כאב (מופרדות בפסיק)" className="text-right min-h-[40px]" />
                </div>
                <div>
                  <label className="block font-bold mb-1 text-green-900">התנגדויות (מופרדות בפסיק)</label>
                  <Textarea value={newAvatar.objections ? newAvatar.objections.join(", ") : ''} onChange={e => setNewAvatar(d => ({ ...d, objections: e.target.value.split(",").map(f => f.trim()) }))} placeholder="התנגדויות (מופרדות בפסיק)" className="text-right min-h-[40px]" />
                </div>
                <div>
                  <label className="block font-bold mb-1 text-green-900">תוצאת החלום (מופרדות בפסיק)</label>
                  <Textarea value={newAvatar.dreamOutcome ? newAvatar.dreamOutcome.join(", ") : ''} onChange={e => setNewAvatar(d => ({ ...d, dreamOutcome: e.target.value.split(",").map(f => f.trim()) }))} placeholder="תוצאת החלום (מופרדות בפסיק)" className="text-right min-h-[40px]" />
                </div>
                <DialogFooter className="flex justify-end gap-2 mt-6">
                  <Button variant="outline" onClick={() => setCreateModalOpen(false)}>ביטול</Button>
                  <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-2 rounded-lg shadow">צור אווטאר</Button>
                </DialogFooter>
              </form>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={!!deleteTarget} onOpenChange={open => { if (!open) setDeleteTarget(null); }}>
          <DialogContent className="max-w-md w-full p-8 rounded-2xl shadow-2xl bg-white border border-red-200" dir="rtl">
            <DialogHeader>
              <DialogTitle className="text-red-700 text-2xl font-extrabold mb-2 text-right">אישור מחיקה</DialogTitle>
              <p className="text-gray-500 text-sm mb-4 text-right">האם אתה בטוח שברצונך למחוק {deleteTarget?.type === 'product' ? 'את המוצר' : 'את האווטאר'}? פעולה זו אינה הפיכה.</p>
            </DialogHeader>
            <DialogFooter className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setDeleteTarget(null)}>ביטול</Button>
              <Button variant="destructive" onClick={handleDelete}>מחק</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add custom style for gold badge with white text */}
        <style>{`
          .badge-gold {
            background: linear-gradient(90deg, #bfa14a 0%, #e6c36b 100%);
            color: #fff !important;
            font-weight: bold;
            border: none;
          }
        `}</style>
      </div>
    </div>
  );
} 