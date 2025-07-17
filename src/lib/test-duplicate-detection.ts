/**
 * Test suite for avatar duplicate detection
 * Verifies that the business rule "No duplicate Avatars per Product with identical core profile fields" is enforced
 */

import { 
  findAvatarDuplicate, 
  checkAvatarCoreFieldsMatch, 
  normalizeAvatarForComparison,
  type AvatarData 
} from './make-integration';

/**
 * Test data for duplicate detection
 */
const createTestAvatar = (overrides: Partial<AvatarData> = {}): AvatarData => ({
  name: 'Test User',
  age: '25',
  gender: 'female',
  personality: 'Extroverted and friendly',
  interests: ['technology', 'fitness', 'travel'],
  background: 'Marketing professional',
  goals: 'Increase productivity',
  painPoints: ['time management', 'work-life balance'],
  objections: ['cost concerns', 'complexity'],
  dreamOutcome: ['efficiency', 'success'],
  preferences: { communication: 'email', frequency: 'daily' },
  productId: 'test-product-1',
  ...overrides
});

/**
 * Test 1: Exact duplicate detection
 */
export function testExactDuplicateDetection(): void {
  console.log('🧪 Test 1: Exact duplicate detection');
  
  const originalAvatar = createTestAvatar();
  const duplicateAvatar = createTestAvatar(); // Same data
  
  const result = findAvatarDuplicate(duplicateAvatar);
  
  console.log('Result:', result);
  
  if (result.isDuplicate) {
    console.log('✅ PASS: Exact duplicate correctly detected');
  } else {
    console.log('❌ FAIL: Exact duplicate not detected');
  }
}

/**
 * Test 2: Similar but not exact duplicate
 */
export function testSimilarButNotExactDuplicate(): void {
  console.log('🧪 Test 2: Similar but not exact duplicate');
  
  const originalAvatar = createTestAvatar();
  const similarAvatar = createTestAvatar({
    name: 'Test User',
    age: '25',
    gender: 'female',
    personality: 'Extroverted and friendly',
    interests: ['technology', 'fitness', 'travel'],
    background: 'Marketing professional',
    goals: 'Increase productivity',
    painPoints: ['time management', 'work-life balance'],
    objections: ['cost concerns', 'complexity'],
    dreamOutcome: ['efficiency', 'success'],
    preferences: { communication: 'email', frequency: 'daily' },
    // Only difference: different productId
    productId: 'test-product-2'
  });
  
  const result = findAvatarDuplicate(similarAvatar);
  
  console.log('Result:', result);
  
  if (!result.isDuplicate) {
    console.log('✅ PASS: Similar avatar correctly not detected as duplicate (different productId)');
  } else {
    console.log('❌ FAIL: Similar avatar incorrectly detected as duplicate');
  }
}

/**
 * Test 3: Core field comparison
 */
export function testCoreFieldComparison(): void {
  console.log('🧪 Test 3: Core field comparison');
  
  const avatar1 = createTestAvatar();
  const avatar2 = createTestAvatar({
    name: 'Different Name' // Only difference
  });
  
  const result = checkAvatarCoreFieldsMatch(avatar1, avatar2);
  
  console.log('Match result:', result);
  
  if (!result.isMatch && result.mismatchedFields.includes('name')) {
    console.log('✅ PASS: Core field comparison correctly identifies mismatched fields');
  } else {
    console.log('❌ FAIL: Core field comparison failed');
  }
}

/**
 * Test 4: Array field comparison
 */
export function testArrayFieldComparison(): void {
  console.log('🧪 Test 4: Array field comparison');
  
  const avatar1 = createTestAvatar({
    interests: ['technology', 'fitness', 'travel']
  });
  
  const avatar2 = createTestAvatar({
    interests: ['travel', 'technology', 'fitness'] // Same elements, different order
  });
  
  const result = checkAvatarCoreFieldsMatch(avatar1, avatar2);
  
  console.log('Array comparison result:', result);
  
  if (result.isMatch && result.matchedFields.includes('interests')) {
    console.log('✅ PASS: Array field comparison correctly handles order differences');
  } else {
    console.log('❌ FAIL: Array field comparison failed');
  }
}

/**
 * Test 5: Object field comparison
 */
export function testObjectFieldComparison(): void {
  console.log('🧪 Test 5: Object field comparison');
  
  const avatar1 = createTestAvatar({
    preferences: { communication: 'email', frequency: 'daily' }
  });
  
  const avatar2 = createTestAvatar({
    preferences: { frequency: 'daily', communication: 'email' } // Same data, different order
  });
  
  const result = checkAvatarCoreFieldsMatch(avatar1, avatar2);
  
  console.log('Object comparison result:', result);
  
  if (result.isMatch && result.matchedFields.includes('preferences')) {
    console.log('✅ PASS: Object field comparison correctly handles property order');
  } else {
    console.log('❌ FAIL: Object field comparison failed');
  }
}

/**
 * Test 6: Normalization consistency
 */
export function testNormalizationConsistency(): void {
  console.log('🧪 Test 6: Normalization consistency');
  
  const avatar1 = createTestAvatar({
    name: '  Test User  ',
    age: '25',
    gender: 'FEMALE'
  });
  
  const avatar2 = createTestAvatar({
    name: 'test user',
    age: '25',
    gender: 'female'
  });
  
  const normalized1 = normalizeAvatarForComparison(avatar1);
  const normalized2 = normalizeAvatarForComparison(avatar2);
  
  console.log('Normalized avatar1:', normalized1);
  console.log('Normalized avatar2:', normalized2);
  
  if (normalized1.name === normalized2.name && normalized1.gender === normalized2.gender) {
    console.log('✅ PASS: Normalization correctly handles case and whitespace');
  } else {
    console.log('❌ FAIL: Normalization failed');
  }
}

/**
 * Run all tests
 */
export function runAllDuplicateDetectionTests(): void {
  console.log('🚀 Running all duplicate detection tests...');
  
  try {
    testExactDuplicateDetection();
    testSimilarButNotExactDuplicate();
    testCoreFieldComparison();
    testArrayFieldComparison();
    testObjectFieldComparison();
    testNormalizationConsistency();
    
    console.log('✅ All tests completed');
  } catch (error) {
    console.error('❌ Test suite failed:', error);
  }
}

/**
 * Make test functions globally available for browser console testing
 */
export function makeTestFunctionsGloballyAvailable(): void {
  if (typeof window !== 'undefined') {
    (window as any).runDuplicateTests = runAllDuplicateDetectionTests;
    (window as any).testExactDuplicate = testExactDuplicateDetection;
    (window as any).testSimilarDuplicate = testSimilarButNotExactDuplicate;
    (window as any).testCoreFields = testCoreFieldComparison;
    (window as any).testArrayFields = testArrayFieldComparison;
    (window as any).testObjectFields = testObjectFieldComparison;
    (window as any).testNormalization = testNormalizationConsistency;
    
    console.log('🧪 Test functions available globally:');
    console.log('  - runDuplicateTests() - Run all tests');
    console.log('  - testExactDuplicate() - Test exact duplicate detection');
    console.log('  - testSimilarDuplicate() - Test similar but not exact');
    console.log('  - testCoreFields() - Test core field comparison');
    console.log('  - testArrayFields() - Test array field comparison');
    console.log('  - testObjectFields() - Test object field comparison');
    console.log('  - testNormalization() - Test normalization consistency');
  }
} 