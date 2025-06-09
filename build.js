const fs = require('fs');
const path = require('path');
const { minify: minifyHTML } = require('html-minifier-terser');
const CleanCSS = require('clean-css');
const { minify: minifyJS } = require('terser');

// Create dist directory
if (!fs.existsSync('dist')) {
  fs.mkdirSync('dist', { recursive: true });
}

// Copy img directory
if (fs.existsSync('img')) {
  fs.cpSync('img', 'dist/img', { recursive: true });
}

// Minify HTML
async function minifyHTMLFile() {
  try {
    const html = fs.readFileSync('index.html', 'utf8');
    const minified = await minifyHTML(html, {
      removeComments: true,
      removeRedundantAttributes: true,
      removeScriptTypeAttributes: true,
      removeStyleLinkTypeAttributes: true,
      sortClassName: true,
      useShortDoctype: true,
      collapseWhitespace: true,
      conservativeCollapse: true,
      minifyCSS: true,
      minifyJS: true,
      // Keep important comments
      ignoreCustomComments: [/^\s*#/]
    });
    fs.writeFileSync('dist/index.html', minified);
    console.log('✅ HTML minified');
    
    // Calculate size reduction
    const originalSize = Buffer.byteLength(html, 'utf8');
    const minifiedSize = Buffer.byteLength(minified, 'utf8');
    const reduction = ((originalSize - minifiedSize) / originalSize * 100).toFixed(1);
    console.log(`📊 HTML size reduction: ${reduction}% (${originalSize} → ${minifiedSize} bytes)`);
  } catch (error) {
    console.error('❌ HTML minification failed:', error);
  }
}

// Minify CSS
function minifyCSSFile() {
  try {
    const css = fs.readFileSync('style.css', 'utf8');
    const minified = new CleanCSS({
      level: 2,
      returnPromise: false,
      format: {
        breakWith: 'lf'
      }
    }).minify(css);
    
    if (minified.errors.length > 0) {
      console.error('❌ CSS errors:', minified.errors);
      return;
    }
    
    if (minified.warnings.length > 0) {
      console.warn('⚠️ CSS warnings:', minified.warnings);
    }
    
    fs.writeFileSync('dist/style.css', minified.styles);
    console.log('✅ CSS minified');
    
    const originalSize = Buffer.byteLength(css, 'utf8');
    const minifiedSize = Buffer.byteLength(minified.styles, 'utf8');
    const reduction = ((originalSize - minifiedSize) / originalSize * 100).toFixed(1);
    console.log(`📊 CSS size reduction: ${reduction}% (${originalSize} → ${minifiedSize} bytes)`);
  } catch (error) {
    console.error('❌ CSS minification failed:', error);
  }
}

// Minify JavaScript
async function minifyJSFile() {
  try {
    const js = fs.readFileSync('script.js', 'utf8');
    const minified = await minifyJS(js, {
      compress: {
        drop_console: false, // Keep console.log for debugging
        drop_debugger: true,
        pure_funcs: ['console.info', 'console.debug'],
        passes: 2
      },
      mangle: {
        keep_fnames: false,
        reserved: ['changeImage'] // Keep function names used in HTML
      },
      format: {
        comments: false
      }
    });
    
    if (minified.error) {
      console.error('❌ JS minification error:', minified.error);
      return;
    }
    
    fs.writeFileSync('dist/script.js', minified.code);
    console.log('✅ JavaScript minified');
    
    const originalSize = Buffer.byteLength(js, 'utf8');
    const minifiedSize = Buffer.byteLength(minified.code, 'utf8');
    const reduction = ((originalSize - minifiedSize) / originalSize * 100).toFixed(1);
    console.log(`📊 JS size reduction: ${reduction}% (${originalSize} → ${minifiedSize} bytes)`);
  } catch (error) {
    console.error('❌ JavaScript minification failed:', error);
  }
}

// Copy other important files
function copyOtherFiles() {
  const filesToCopy = ['sitemap.xml', 'robots.txt', 'README.md'];
  filesToCopy.forEach(file => {
    if (fs.existsSync(file)) {
      fs.copyFileSync(file, `dist/${file}`);
      console.log(`✅ Copied ${file}`);
    }
  });
}

// Generate build info
function generateBuildInfo() {
  const buildInfo = {
    buildTime: new Date().toISOString(),
    version: require('./package.json').version,
    nodeVersion: process.version
  };
  
  fs.writeFileSync('dist/build-info.json', JSON.stringify(buildInfo, null, 2));
  console.log('✅ Build info generated');
}

// Run all minification tasks
async function build() {
  console.log('🚀 Starting build process for Gainesport University website...');
  console.log('');
  
  await minifyHTMLFile();
  minifyCSSFile();
  await minifyJSFile();
  copyOtherFiles();
  generateBuildInfo();
  
  console.log('');
  console.log('✅ Build complete! Minified files are in the dist/ directory');
  console.log('💡 You can preview the minified site by running: npm run dev-built');
}

build().catch(console.error);
