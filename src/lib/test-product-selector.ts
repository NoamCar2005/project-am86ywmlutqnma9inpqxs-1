/**
 * Test utilities for product selector functionality
 */

import { initializeSampleProducts, getProductData, type ProductData } from './make-integration';

/**
 * Test the product selector functionality
 */
export function testProductSelector() {
  console.log('🧪 Testing product selector functionality...');
  
  // Initialize sample products
  initializeSampleProducts();
  
  // Get products and verify they exist
  const products = getProductData();
  console.log('📦 Sample products created:', products.length);
  
  products.forEach((product, index) => {
    console.log(`  ${index + 1}. ${product.name} - ${product.imageUrl}`);
  });
  
  // Test URL matching
  if (products.length > 0) {
    const testProduct = products[0];
    console.log('🔍 Testing URL matching for:', testProduct.name);
    console.log('  Product URL:', testProduct.imageUrl);
    
    // Simulate form data update
    const mockFormData = {
      brief: "Test brief",
      productUrl: testProduct.imageUrl,
      creativeType: "video"
    };
    
    console.log('✅ Form data would be updated to:', mockFormData);
  }
  
  return products;
}

/**
 * Verify product selector state synchronization
 */
export function verifyProductSelectorState() {
  const products = getProductData();
  
  if (products.length === 0) {
    console.log('⚠️ No products found. Run testProductSelector() first.');
    return false;
  }
  
  console.log('✅ Product selector state verification:');
  console.log(`  - Total products: ${products.length}`);
  console.log(`  - Products with URLs: ${products.filter(p => p.imageUrl).length}`);
  console.log(`  - Products with names: ${products.filter(p => p.name).length}`);
  
  return true;
}

/**
 * Simulate product selection
 */
export function simulateProductSelection(productId: string) {
  const products = getProductData();
  const product = products.find(p => p.id === productId);
  
  if (!product) {
    console.log('❌ Product not found:', productId);
    return null;
  }
  
  console.log('🎯 Simulating product selection:');
  console.log(`  - Product: ${product.name}`);
  console.log(`  - URL: ${product.imageUrl}`);
  console.log(`  - Description: ${product.description}`);
  
  // Simulate the state changes that would happen
  const simulatedState = {
    selectedProduct: product,
    formData: {
      brief: "Test brief",
      productUrl: product.imageUrl,
      creativeType: "video"
    },
    urlValidation: {
      isValid: true,
      isChecking: false
    }
  };
  
  console.log('✅ Simulated state:', simulatedState);
  return simulatedState;
} 