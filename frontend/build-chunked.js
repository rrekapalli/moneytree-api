const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

try {
  // Run Angular build with production configuration
  // Angular 20 uses a different build command syntax
  execSync('npx ng build --configuration=production --project=money-plant-frontend', { stdio: 'inherit' });

  // Get the output directory path (Angular 20 uses a browser subdirectory)
  const distDir = path.resolve('./dist/money-plant-frontend/browser');

  if (fs.existsSync(distDir)) {
    // List all JS files in the dist directory
    const jsFiles = fs.readdirSync(distDir).filter(file => file.endsWith('.js'));

    // Update index.html to reference the chunked files
    const indexPath = path.join(distDir, 'index.html');
    if (fs.existsSync(indexPath)) {
      let indexContent = fs.readFileSync(indexPath, 'utf8');

      // Ensure all script tags have type="module" attribute
      const scriptRegex = /<script[^>]*src="[^"]*\.js[^"]*"[^>]*>/g;
      indexContent = indexContent.replace(scriptRegex, (match) => {
        if (!match.includes('type="module"')) {
          return match.replace('>', ' type="module">');
        }
        return match;
      });

      fs.writeFileSync(indexPath, indexContent);
    }
  }
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
}