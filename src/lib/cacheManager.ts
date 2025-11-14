/**
 * Cache Management Utility
 * 
 * Handles Apollo Client cache invalidation and refresh strategies
 * for production-grade data consistency
 */

import client from './apolloClient';

/**
 * Clear all Apollo cache
 * Use this after major data changes (orders, user updates, etc.)
 */
export const clearAllCache = async () => {
  try {
    await client.clearStore();
    console.log('✅ Apollo cache cleared successfully');
  } catch (error) {
    console.error('❌ Error clearing cache:', error);
  }
};

/**
 * Reset Apollo cache and refetch all active queries
 * More aggressive than clearStore - use after order placement
 */
export const resetCache = async () => {
  try {
    await client.resetStore();
    console.log('✅ Apollo cache reset and queries refetched');
  } catch (error) {
    console.error('❌ Error resetting cache:', error);
  }
};

/**
 * Evict specific cache entries by typename
 * More targeted approach for specific data types
 */
export const evictCacheByType = (typename: string) => {
  try {
    client.cache.evict({ fieldName: typename });
    client.cache.gc(); // Garbage collect
    console.log(`✅ Cache evicted for type: ${typename}`);
  } catch (error) {
    console.error(`❌ Error evicting cache for ${typename}:`, error);
  }
};

/**
 * Clear cache for specific queries
 * Use when you know exactly which queries to invalidate
 */
export const evictQueries = (queryNames: string[]) => {
  try {
    queryNames.forEach(queryName => {
      client.cache.evict({ fieldName: queryName });
    });
    client.cache.gc();
    console.log(`✅ Cache evicted for queries:`, queryNames);
  } catch (error) {
    console.error('❌ Error evicting queries:', error);
  }
};

/**
 * Refresh specific query by refetching
 * Use when you want to update specific data without clearing everything
 */
export const refetchQuery = async (queryName: string, variables?: any) => {
  try {
    await client.refetchQueries({
      include: [queryName],
    });
    console.log(`✅ Query refetched: ${queryName}`);
  } catch (error) {
    console.error(`❌ Error refetching query ${queryName}:`, error);
  }
};

/**
 * Clear cache after successful order placement
 * Invalidates cart, customer, and order-related data
 */
export const clearCacheAfterOrder = async () => {
  try {
    // Evict specific cache entries
    evictCacheByType('Order');
    evictCacheByType('Customer');
    evictCacheByType('Cart');
    
    // Clear cart from localStorage
    localStorage.removeItem('cart');
    
    // Refetch active queries
    await client.refetchQueries({
      include: 'active',
    });
    
    console.log('✅ Cache cleared after order placement');
  } catch (error) {
    console.error('❌ Error clearing cache after order:', error);
  }
};

/**
 * Clear cache after user login/logout
 * Ensures fresh user-specific data
 */
export const clearCacheAfterAuth = async () => {
  try {
    await resetCache();
    console.log('✅ Cache cleared after authentication change');
  } catch (error) {
    console.error('❌ Error clearing cache after auth:', error);
  }
};

/**
 * Periodic cache cleanup
 * Call this on app initialization or periodically
 */
export const performCacheCleanup = () => {
  try {
    client.cache.gc();
    console.log('✅ Cache garbage collection completed');
  } catch (error) {
    console.error('❌ Error during cache cleanup:', error);
  }
};

/**
 * Get cache statistics (for debugging)
 */
export const getCacheStats = () => {
  try {
    const cache = client.cache.extract();
    const size = JSON.stringify(cache).length;
    const keys = Object.keys(cache);
    
    console.log('📊 Cache Statistics:', {
      entries: keys.length,
      sizeInBytes: size,
      sizeInKB: (size / 1024).toFixed(2),
    });
    
    return {
      entries: keys.length,
      sizeInBytes: size,
      sizeInKB: (size / 1024).toFixed(2),
    };
  } catch (error) {
    console.error('❌ Error getting cache stats:', error);
    return null;
  }
};

export default {
  clearAllCache,
  resetCache,
  evictCacheByType,
  evictQueries,
  refetchQuery,
  clearCacheAfterOrder,
  clearCacheAfterAuth,
  performCacheCleanup,
  getCacheStats,
};
