#!/usr/bin/env node

/**
 * Sitemap Generator Script
 * 
 * This script automatically generates a sitemap.xml file based on your routes and products.
 * Run this script as part of your build process to always have an up-to-date sitemap.
 * 
 * Usage: node generate-sitemap.js
 */

const fs = require('fs');
const path = require('path');
const { gql } = require('@apollo/client/core');
const { ApolloClient, InMemoryCache, HttpLink } = require('@apollo/client/core');
const fetch = require('cross-fetch');
require('dotenv').config();

// Create Apollo Client
const client = new ApolloClient({
  link: new HttpLink({ 
    uri: process.env.VITE_GRAPHQL_ENDPOINT || 'https://admin.teakacacia.com/graphql',
    fetch 
  }),
  cache: new InMemoryCache()
});

// GraphQL query to get all products
const GET_ALL_PRODUCTS = gql`
  query GetAllProducts {
    products(first: 1000) {
      nodes {
        id
        slug
        modified
      }
    }
  }
`;

// GraphQL query to get all categories
const GET_ALL_CATEGORIES = gql`
  query GetAllCategories {
    productCategories(first: 100) {
      nodes {
        id
        slug
        modified
      }
    }
  }
`;

// GraphQL query to get all blog posts
const GET_ALL_POSTS = gql`
  query GetAllPosts {
    posts(first: 100) {
      nodes {
        id
        slug
        modified
      }
    }
  }
`;

// Static routes
const staticRoutes = [
  { path: '/', priority: 1.0, changefreq: 'weekly' },
  { path: '/products', priority: 0.9, changefreq: 'daily' },
  { path: '/categories', priority: 0.8, changefreq: 'weekly' },
  { path: '/about', priority: 0.7, changefreq: 'monthly' },
  { path: '/contact', priority: 0.7, changefreq: 'monthly' },
  { path: '/blog', priority: 0.8, changefreq: 'weekly' },
];

// Generate sitemap XML
async function generateSitemap() {
  try {
    console.log('Generating sitemap.xml...');
    
    // Fetch all products
    const productsResult = await client.query({ query: GET_ALL_PRODUCTS });
    const products = productsResult.data?.products?.nodes || [];
    
    // Fetch all categories
    const categoriesResult = await client.query({ query: GET_ALL_CATEGORIES });
    const categories = categoriesResult.data?.productCategories?.nodes || [];
    
    // Fetch all blog posts
    const postsResult = await client.query({ query: GET_ALL_POSTS });
    const posts = postsResult.data?.posts?.nodes || [];
    
    // Start XML content
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    
    // Add static routes
    const baseUrl = process.env.VITE_APP_URL || 'https://teakacacia.com';
    const today = new Date().toISOString().split('T')[0];
    
    staticRoutes.forEach(route => {
      xml += '  <url>\n';
      xml += `    <loc>${baseUrl}${route.path}</loc>\n`;
      xml += `    <lastmod>${today}</lastmod>\n`;
      xml += `    <changefreq>${route.changefreq}</changefreq>\n`;
      xml += `    <priority>${route.priority}</priority>\n`;
      xml += '  </url>\n';
    });
    
    // Add product routes
    products.forEach(product => {
      const lastmod = product.modified ? product.modified.split('T')[0] : today;
      
      xml += '  <url>\n';
      xml += `    <loc>${baseUrl}/products/${product.slug}</loc>\n`;
      xml += `    <lastmod>${lastmod}</lastmod>\n`;
      xml += '    <changefreq>weekly</changefreq>\n';
      xml += '    <priority>0.8</priority>\n';
      xml += '  </url>\n';
    });
    
    // Add category routes
    categories.forEach(category => {
      const lastmod = category.modified ? category.modified.split('T')[0] : today;
      
      xml += '  <url>\n';
      xml += `    <loc>${baseUrl}/category/${category.slug}</loc>\n`;
      xml += `    <lastmod>${lastmod}</lastmod>\n`;
      xml += '    <changefreq>weekly</changefreq>\n';
      xml += '    <priority>0.7</priority>\n';
      xml += '  </url>\n';
    });
    
    // Add blog post routes
    posts.forEach(post => {
      const lastmod = post.modified ? post.modified.split('T')[0] : today;
      
      xml += '  <url>\n';
      xml += `    <loc>${baseUrl}/blog/${post.slug}</loc>\n`;
      xml += `    <lastmod>${lastmod}</lastmod>\n`;
      xml += '    <changefreq>monthly</changefreq>\n';
      xml += '    <priority>0.6</priority>\n';
      xml += '  </url>\n';
    });
    
    // Close XML
    xml += '</urlset>';
    
    // Write to file
    const publicDir = path.join(process.cwd(), 'public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    
    fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), xml);
    console.log('Sitemap generated successfully!');
    
    // Also generate robots.txt if it doesn't exist
    const robotsPath = path.join(publicDir, 'robots.txt');
    if (!fs.existsSync(robotsPath)) {
      const robotsTxt = `User-agent: *\nAllow: /\n\n# Sitemaps\nSitemap: ${baseUrl}/sitemap.xml`;
      fs.writeFileSync(robotsPath, robotsTxt);
      console.log('robots.txt generated successfully!');
    }
    
  } catch (error) {
    console.error('Error generating sitemap:', error);
    process.exit(1);
  }
}

// Run the generator
generateSitemap();
