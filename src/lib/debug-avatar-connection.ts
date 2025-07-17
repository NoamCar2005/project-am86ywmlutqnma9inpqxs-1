/**
 * Debug utility for avatar-product connection issues
 * This helps track and verify that avatars are properly connected to products
 */

import { getAvatarData, getProductData, type AvatarData, type ProductData } from './make-integration';

/**
 * Make debug functions globally available in browser console
 */
export function makeDebugGloballyAvailable(): void {
  if (typeof window !== 'undefined') {
    (window as any).debugAvatarConnections = debugAvatarProductConnections;
    (window as any).checkConnectionForUrl = checkConnectionForUrl;
    (window as any).fixOrphanedAvatars = fixOrphanedAvatars;
    (window as any).validateConnections = validateAvatarConnections;
    (window as any).getAllData = () => ({
      avatars: getAvatarData(),
      products: getProductData()
    });
    (window as any).fixProductConnections = fixProductConnections;
    
    console.log('🔧 Debug functions available globally:');
    console.log('  - debugAvatarConnections() - Check all connections');
    console.log('  - checkConnectionForUrl(url) - Check specific URL');
    console.log('  - fixOrphanedAvatars() - Fix orphaned avatars');
    console.log('  - validateConnections() - Validate all connections');
    console.log('  - getAllData() - Get all data');
    console.log('  - fixProductConnections() - Fix product-avatar connections');
  }
}

/**
 * Debug function to check avatar-product connections
 */
export function debugAvatarProductConnections(): void {
  console.log('🔍 Debugging Avatar-Product Connections...');
  
  const avatars = getAvatarData();
  const products = getProductData();
  
  console.log('📊 Total avatars:', avatars.length);
  console.log('📊 Total products:', products.length);
  
  // Check for avatars without productId
  const avatarsWithoutProduct = avatars.filter(avatar => !avatar.productId);
  console.log('⚠️ Avatars without productId:', avatarsWithoutProduct.length);
  if (avatarsWithoutProduct.length > 0) {
    console.log('⚠️ Avatars without productId:', avatarsWithoutProduct.map(a => ({ id: a.id, name: a.name })));
  }
  
  // Check for products without avatars
  const productsWithoutAvatars = products.filter(product => {
    const productAvatars = avatars.filter(avatar => avatar.productId === product.id);
    return productAvatars.length === 0;
  });
  
  console.log('⚠️ Products without avatars:', productsWithoutAvatars.length);
  if (productsWithoutAvatars.length > 0) {
    console.log('⚠️ Products without avatars:', productsWithoutAvatars.map(p => ({ id: p.id, name: p.name })));
  }
  
  // Check for orphaned avatars (productId doesn't match any product)
  const orphanedAvatars = avatars.filter(avatar => {
    if (!avatar.productId) return false;
    return !products.some(product => product.id === avatar.productId);
  });
  
  console.log('⚠️ Orphaned avatars (productId not found):', orphanedAvatars.length);
  if (orphanedAvatars.length > 0) {
    console.log('⚠️ Orphaned avatars:', orphanedAvatars.map(a => ({ id: a.id, name: a.name, productId: a.productId })));
  }
  
  // Show successful connections
  const successfulConnections = avatars.filter(avatar => {
    if (!avatar.productId) return false;
    return products.some(product => product.id === avatar.productId);
  });
  
  console.log('✅ Successful avatar-product connections:', successfulConnections.length);
  if (successfulConnections.length > 0) {
    console.log('✅ Connected avatars:', successfulConnections.map(a => ({ 
      id: a.id, 
      name: a.name, 
      productId: a.productId,
      productName: products.find(p => p.id === a.productId)?.name || 'Unknown'
    })));
  }
}

/**
 * Check connection status for a specific product URL
 */
export function checkConnectionForUrl(productUrl: string): void {
  console.log('🔍 Checking connection status for URL:', productUrl);
  
  const avatars = getAvatarData();
  const products = getProductData();
  
  // Find product by URL
  const product = products.find(p => p.imageUrl === productUrl);
  
  if (!product) {
    console.log('❌ No product found for URL:', productUrl);
    return;
  }
  
  console.log('✅ Found product:', { id: product.id, name: product.name });
  
  // Find avatars connected to this product
  const connectedAvatars = avatars.filter(a => a.productId === product.id);
  
  console.log('📊 Connected avatars for this product:', connectedAvatars.length);
  if (connectedAvatars.length > 0) {
    console.log('📊 Connected avatars:', connectedAvatars.map(a => ({ 
      id: a.id, 
      name: a.name, 
      productId: a.productId 
    })));
  } else {
    console.log('⚠️ No avatars connected to this product');
    
    // Check for potential avatars that could be used
    const potentialAvatars = avatars.filter(avatar => {
      // Avatars without productId
      if (!avatar.productId) return true;
      
      // Avatars with different productId but good characteristics
      if (avatar.productId !== product.id) {
        const hasGoodCharacteristics = 
          avatar.interests && avatar.interests.length > 0 &&
          avatar.painPoints && avatar.painPoints.length > 0;
        
        return hasGoodCharacteristics;
      }
      
      return false;
    });
    
    console.log('🔍 Potential avatars that could be used:', potentialAvatars.length);
    if (potentialAvatars.length > 0) {
      console.log('🔍 Potential avatars:', potentialAvatars.map(a => ({ 
        id: a.id, 
        name: a.name, 
        productId: a.productId || 'none'
      })));
    }
  }
}

/**
 * Fix orphaned avatars by connecting them to products based on name matching
 */
export function fixOrphanedAvatars(): void {
  console.log('🔧 Attempting to fix orphaned avatars...');
  
  const avatars = getAvatarData();
  const products = getProductData();
  
  let fixedCount = 0;
  const updatedAvatars = avatars.map(avatar => {
    // If avatar has no productId, try to find a matching product
    if (!avatar.productId) {
      // Try to find product by name similarity
      const matchingProduct = products.find(product => {
        const avatarName = avatar.name.toLowerCase();
        const productName = product.name.toLowerCase();
        return avatarName.includes(productName) || productName.includes(avatarName);
      });
      
      if (matchingProduct) {
        console.log(`🔧 Fixed avatar "${avatar.name}" -> product "${matchingProduct.name}"`);
        fixedCount++;
        return { ...avatar, productId: matchingProduct.id };
      }
    }
    
    return avatar;
  });
  
  if (fixedCount > 0) {
    localStorage.setItem('avatars', JSON.stringify(updatedAvatars));
    console.log(`✅ Fixed ${fixedCount} orphaned avatars`);
  } else {
    console.log('ℹ️ No orphaned avatars found to fix');
  }
}

/**
 * Validate that all avatars have proper product connections
 */
export function validateAvatarConnections(): boolean {
  const avatars = getAvatarData();
  const products = getProductData();
  
  const orphanedAvatars = avatars.filter(avatar => {
    if (!avatar.productId) return true;
    return !products.some(product => product.id === avatar.productId);
  });
  
  const productsWithoutAvatars = products.filter(product => {
    const productAvatars = avatars.filter(avatar => avatar.productId === product.id);
    return productAvatars.length === 0;
  });
  
  const isValid = orphanedAvatars.length === 0 && productsWithoutAvatars.length === 0;
  
  console.log('🔍 Avatar connection validation:', {
    isValid,
    orphanedAvatars: orphanedAvatars.length,
    productsWithoutAvatars: productsWithoutAvatars.length,
    totalAvatars: avatars.length,
    totalProducts: products.length
  });
  
  return isValid;
}

/**
 * Fix product-avatar connections by ensuring all avatars have valid productId
 */
export function fixProductConnections(): void {
  console.log('🔧 Attempting to fix product-avatar connections...');
  
  const avatars = getAvatarData();
  const products = getProductData();
  
  let fixedCount = 0;
  const updatedAvatars = avatars.map(avatar => {
    // If avatar has no productId or invalid productId, try to fix it
    if (!avatar.productId || !products.some(p => p.id === avatar.productId)) {
      // Try to find a product by name similarity
      const matchingProduct = products.find(product => {
        const avatarName = avatar.name.toLowerCase();
        const productName = product.name.toLowerCase();
        return avatarName.includes(productName) || productName.includes(avatarName);
      });
      
      if (matchingProduct) {
        console.log(`🔧 Fixed avatar "${avatar.name}" -> product "${matchingProduct.name}"`);
        fixedCount++;
        return { ...avatar, productId: matchingProduct.id };
      }
      
      // If no match found, assign to the first available product
      if (products.length > 0) {
        console.log(`🔧 Assigned avatar "${avatar.name}" to first available product "${products[0].name}"`);
        fixedCount++;
        return { ...avatar, productId: products[0].id };
      }
    }
    
    return avatar;
  });
  
  if (fixedCount > 0) {
    localStorage.setItem('avatars', JSON.stringify(updatedAvatars));
    console.log(`✅ Fixed ${fixedCount} product-avatar connections`);
  } else {
    console.log('ℹ️ No product-avatar connections found to fix');
  }
}

// Make debug functions available globally
if (typeof window !== 'undefined') {
  (window as any).debugAvatarConnections = debugAvatarProductConnections;
  (window as any).fixOrphanedAvatars = fixOrphanedAvatars;
  (window as any).validateAvatarConnections = validateAvatarConnections;
} 