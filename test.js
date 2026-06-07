const fs = require('fs');
const path = require('path');
const assert = require('assert').strict;

const PAGES = [
  'index.html',
  'services.html',
  'about.html',
  'industries.html',
  'contact.html',
  'quote.html'
];

console.log('Starting Unit Tests for Logistica Global Website...\n');

let failedTests = 0;
let passedTests = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`✓ Passed: ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`✗ Failed: ${name}`);
    console.error(err.message || err);
    failedTests++;
  }
}

// 1. Check if files exist
test('HTML Files exist in workspace', () => {
  PAGES.forEach(page => {
    const filePath = path.join(__dirname, page);
    assert.ok(fs.existsSync(filePath), `${page} does not exist in workspace.`);
  });
});

// 2. Check if main.js and style.css exist
test('Shared assets exist', () => {
  assert.ok(fs.existsSync(path.join(__dirname, 'css', 'style.css')), 'css/style.css is missing');
  assert.ok(fs.existsSync(path.join(__dirname, 'js', 'main.js')), 'js/main.js is missing');
});

// 3. Verify HTML structure & link integrity
PAGES.forEach(page => {
  test(`Verify structure & links of ${page}`, () => {
    const content = fs.readFileSync(path.join(__dirname, page), 'utf8');
    
    // Check for CSS link
    assert.match(content, /href=["']css\/style\.css["']/, `${page} is missing stylesheet link`);
    
    // Check for JS link
    assert.match(content, /src=["']js\/main\.js["']/, `${page} is missing JS script link`);
    
    // Check for FOUC opacity style block
    assert.match(content, /body\s*\{\s*opacity:\s*0/i, `${page} is missing FOUC opacity style block in <head>`);
    
    // Check that all href links pointing to local HTML files actually exist
    const hrefRegex = /href=["']([^"']+\.html)(#[^"']*)?["']/g;
    let match;
    while ((match = hrefRegex.exec(content)) !== null) {
      const linkTarget = match[1];
      if (linkTarget.startsWith('http://') || linkTarget.startsWith('https://')) {
        continue;
      }
      assert.ok(PAGES.includes(linkTarget), `${page} links to non-existent page: ${linkTarget}`);
    }
  });
});

// 4. Verify main.js contains reveal code
test('Verify main.js contains body opacity reveal', () => {
  const mainJsContent = fs.readFileSync(path.join(__dirname, 'js', 'main.js'), 'utf8');
  assert.match(mainJsContent, /document\.body\.style\.opacity\s*=\s*['"]1['"]/, 'js/main.js is missing reveal logic');
});

console.log(`\nTests finished: ${passedTests} passed, ${failedTests} failed.`);
if (failedTests > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
