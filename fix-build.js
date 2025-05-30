import fs from 'fs';
import path from 'path';

// Function to copy directory recursively
function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

try {
  const distPublicPath = path.resolve('dist/public');
  const publicPath = path.resolve('public');
  
  if (fs.existsSync(distPublicPath)) {
    console.log('Moving built files to correct location...');
    
    // Remove existing public directory if it exists
    if (fs.existsSync(publicPath)) {
      fs.rmSync(publicPath, { recursive: true, force: true });
    }
    
    // Copy dist/public to public
    copyDir(distPublicPath, publicPath);
    
    console.log('✅ Build files moved successfully!');
    console.log('Frontend files are now in the "public" directory where the server expects them.');
  } else {
    console.error('❌ dist/public directory not found. Make sure to run "npm run build" first.');
    process.exit(1);
  }
} catch (error) {
  console.error('❌ Error moving build files:', error.message);
  process.exit(1);
}