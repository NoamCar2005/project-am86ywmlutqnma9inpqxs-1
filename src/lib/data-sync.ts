/**
 * Data Synchronization System
 * 
 * This system ensures that React state stays in sync with localStorage
 * and provides real-time updates across components when data changes.
 */

import React from 'react';
import { getProductData, getAvatarData, type ProductData, type AvatarData } from './make-integration';

// Event system for data changes
class DataSyncEventEmitter {
  private listeners: Map<string, Set<() => void>> = new Map();

  subscribe(event: string, callback: () => void): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    // Return unsubscribe function
    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }

  emit(event: string): void {
    this.listeners.get(event)?.forEach(callback => callback());
  }
}

// Global event emitter instance
export const dataSyncEmitter = new DataSyncEventEmitter();

// Event types
export const DATA_EVENTS = {
  PRODUCTS_UPDATED: 'products_updated',
  AVATARS_UPDATED: 'avatars_updated',
  ALL_DATA_UPDATED: 'all_data_updated'
} as const;

/**
 * Enhanced data management functions that emit events when data changes
 */
export function saveProductDataWithSync(product: ProductData): boolean {
  try {
    const existingProducts = getProductData();
    
    // Check for duplicates
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
    localStorage.setItem('products', JSON.stringify(updatedProducts));
    
    // Emit event for data change
    dataSyncEmitter.emit(DATA_EVENTS.PRODUCTS_UPDATED);
    dataSyncEmitter.emit(DATA_EVENTS.ALL_DATA_UPDATED);
    
    console.log('💾 Product data saved successfully with sync');
    return true;
  } catch (error) {
    console.error('❌ Error saving product data:', error);
    return false;
  }
}

export function saveAvatarDataWithSync(avatar: AvatarData): boolean {
  try {
    const existingAvatars = getAvatarData();
    const updatedAvatars = [...existingAvatars, avatar];
    localStorage.setItem('avatars', JSON.stringify(updatedAvatars));
    // Emit event for data change
    dataSyncEmitter.emit(DATA_EVENTS.AVATARS_UPDATED);
    dataSyncEmitter.emit(DATA_EVENTS.ALL_DATA_UPDATED);
    console.log('💾 Avatar data saved successfully with sync');
    return true;
  } catch (error) {
    console.error('❌ Error saving avatar data:', error);
    return false;
  }
}

export function updateProductDataWithSync(updatedProduct: ProductData): void {
  try {
    const existingProducts = getProductData();
    const updatedProducts = existingProducts.map(p => 
      p.id === updatedProduct.id ? { ...p, ...updatedProduct } : p
    );
    
    localStorage.setItem('products', JSON.stringify(updatedProducts));
    
    // Emit event for data change
    dataSyncEmitter.emit(DATA_EVENTS.PRODUCTS_UPDATED);
    dataSyncEmitter.emit(DATA_EVENTS.ALL_DATA_UPDATED);
    
    console.log('💾 Product data updated successfully with sync');
  } catch (error) {
    console.error('❌ Error updating product data:', error);
  }
}

export function updateAvatarDataWithSync(updatedAvatar: AvatarData): void {
  try {
    const existingAvatars = getAvatarData();
    const updatedAvatars = existingAvatars.map(a => 
      a.id === updatedAvatar.id ? { ...a, ...updatedAvatar } : a
    );
    
    localStorage.setItem('avatars', JSON.stringify(updatedAvatars));
    
    // Emit event for data change
    dataSyncEmitter.emit(DATA_EVENTS.AVATARS_UPDATED);
    dataSyncEmitter.emit(DATA_EVENTS.ALL_DATA_UPDATED);
    
    console.log('💾 Avatar data updated successfully with sync');
  } catch (error) {
    console.error('❌ Error updating avatar data:', error);
  }
}

export function deleteProductDataWithSync(productId: string): void {
  try {
    const existingProducts = getProductData();
    const updatedProducts = existingProducts.filter(p => p.id !== productId);
    
    localStorage.setItem('products', JSON.stringify(updatedProducts));
    
    // Emit event for data change
    dataSyncEmitter.emit(DATA_EVENTS.PRODUCTS_UPDATED);
    dataSyncEmitter.emit(DATA_EVENTS.ALL_DATA_UPDATED);
    
    console.log('💾 Product data deleted successfully with sync');
  } catch (error) {
    console.error('❌ Error deleting product data:', error);
  }
}

export function deleteAvatarDataWithSync(avatarId: string): void {
  try {
    const existingAvatars = getAvatarData();
    const updatedAvatars = existingAvatars.filter(a => a.id !== avatarId);
    
    localStorage.setItem('avatars', JSON.stringify(updatedAvatars));
    
    // Emit event for data change
    dataSyncEmitter.emit(DATA_EVENTS.AVATARS_UPDATED);
    dataSyncEmitter.emit(DATA_EVENTS.ALL_DATA_UPDATED);
    
    console.log('💾 Avatar data deleted successfully with sync');
  } catch (error) {
    console.error('❌ Error deleting avatar data:', error);
  }
}

/**
 * React hook for synchronized data loading
 * Automatically reloads data when localStorage changes
 */
export function useSynchronizedData() {
  const [products, setProducts] = React.useState<ProductData[]>([]);
  const [avatars, setAvatars] = React.useState<AvatarData[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  // Memoize the loadData function to prevent infinite re-renders
  const loadData = React.useCallback(() => {
    console.log('🔄 Loading synchronized data...');
    setIsLoading(true);
    try {
      const productData = getProductData();
      const avatarData = getAvatarData();
      
      // Only update state if data actually changed to prevent unnecessary re-renders
      setProducts(prevProducts => {
        const productsChanged = JSON.stringify(prevProducts) !== JSON.stringify(productData);
        if (productsChanged) {
          console.log('📦 Products updated:', productData.length);
          return productData;
        }
        return prevProducts;
      });
      
      setAvatars(prevAvatars => {
        const avatarsChanged = JSON.stringify(prevAvatars) !== JSON.stringify(avatarData);
        if (avatarsChanged) {
          console.log('👤 Avatars updated:', avatarData.length);
          return avatarData;
        }
        return prevAvatars;
      });
      
    } catch (error) {
      console.error('❌ Error loading synchronized data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load data on mount only
  React.useEffect(() => {
    loadData();
  }, []); // Remove loadData dependency to prevent infinite loops

  // Subscribe to data change events with stable references
  React.useEffect(() => {
    const handleProductsUpdate = () => {
      console.log('📦 Products update event received');
      loadData();
    };
    
    const handleAvatarsUpdate = () => {
      console.log('👤 Avatars update event received');
      loadData();
    };
    
    const handleAllDataUpdate = () => {
      console.log('🔄 All data update event received');
      loadData();
    };

    const unsubscribeProducts = dataSyncEmitter.subscribe(
      DATA_EVENTS.PRODUCTS_UPDATED, 
      handleProductsUpdate
    );
    
    const unsubscribeAvatars = dataSyncEmitter.subscribe(
      DATA_EVENTS.AVATARS_UPDATED, 
      handleAvatarsUpdate
    );
    
    const unsubscribeAll = dataSyncEmitter.subscribe(
      DATA_EVENTS.ALL_DATA_UPDATED, 
      handleAllDataUpdate
    );

    // Cleanup subscriptions
    return () => {
      unsubscribeProducts();
      unsubscribeAvatars();
      unsubscribeAll();
    };
  }, []); // Empty dependency array to prevent re-subscriptions

  return {
    products,
    avatars,
    isLoading,
    reloadData: loadData
  };
}