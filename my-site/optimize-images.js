#!/usr/bin/env node

/**
 * Image Optimization Script
 * 
 * This script provides recommendations for optimizing your images for faster loading.
 * Run this to get suggestions for image optimization.
 */

const fs = require('fs');
const path = require('path');

const adventurePath = './public/photos/adventure';
const projectsPath = './public/photos/projects';

function getFileSizeInMB(filePath) {
  const stats = fs.statSync(filePath);
  return (stats.size / (1024 * 1024)).toFixed(2);
}

function analyzeImages() {
  console.log('🔍 Analyzing images for optimization...\n');
  
  // Analyze adventure photos
  if (fs.existsSync(adventurePath)) {
    const adventureFiles = fs.readdirSync(adventurePath);
    console.log('📸 Adventure Photos:');
    
    adventureFiles.forEach(file => {
      if (file.match(/\.(jpg|jpeg|png|gif)$/i)) {
        const filePath = path.join(adventurePath, file);
        const size = getFileSizeInMB(filePath);
        const sizeNum = parseFloat(size);
        
        let recommendation = '';
        if (sizeNum > 0.5) {
          recommendation = ' ⚠️  Consider compressing to <500KB';
        } else if (sizeNum > 0.3) {
          recommendation = ' 💡 Could be optimized further';
        } else {
          recommendation = ' ✅ Good size';
        }
        
        console.log(`  ${file}: ${size}MB${recommendation}`);
      }
    });
  }
  
  // Analyze project images
  if (fs.existsSync(projectsPath)) {
    const projectFiles = fs.readdirSync(projectsPath);
    console.log('\n💼 Project Images:');
    
    projectFiles.forEach(file => {
      if (file.match(/\.(jpg|jpeg|png|gif)$/i)) {
        const filePath = path.join(projectsPath, file);
        const size = getFileSizeInMB(filePath);
        const sizeNum = parseFloat(size);
        
        let recommendation = '';
        if (sizeNum > 0.5) {
          recommendation = ' ⚠️  Consider compressing to <500KB';
        } else if (sizeNum > 0.3) {
          recommendation = ' 💡 Could be optimized further';
        } else {
          recommendation = ' ✅ Good size';
        }
        
        console.log(`  ${file}: ${size}MB${recommendation}`);
      }
    });
  }
  
  // Check profile pic
  const profilePicPath = './public/photos/profilePic.jpeg';
  if (fs.existsSync(profilePicPath)) {
    const size = getFileSizeInMB(profilePicPath);
    const sizeNum = parseFloat(size);
    
    let recommendation = '';
    if (sizeNum > 1.0) {
      recommendation = ' ⚠️  Consider compressing to <1MB';
    } else if (sizeNum > 0.5) {
      recommendation = ' 💡 Could be optimized further';
    } else {
      recommendation = ' ✅ Good size';
    }
    
    console.log('\n👤 Profile Picture:');
    console.log(`  profilePic.jpeg: ${size}MB${recommendation}`);
  }
  
  console.log('\n🚀 Optimization Recommendations:');
  console.log('1. Use tools like TinyPNG, ImageOptim, or Squoosh to compress images');
  console.log('2. Consider converting to WebP format for better compression');
  console.log('3. Resize images to the actual display size needed');
  console.log('4. Use progressive JPEGs for better perceived loading');
  console.log('5. The preloading system is already in place for instant loading!');
  
  console.log('\n✨ Your images will now load instantly thanks to:');
  console.log('   • Aggressive preloading on app start');
  console.log('   • Service worker caching');
  console.log('   • HTML preload links');
  console.log('   • Next.js image optimization');
  console.log('   • Priority loading attributes');
}

analyzeImages();
