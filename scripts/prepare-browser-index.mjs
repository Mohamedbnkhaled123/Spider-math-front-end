import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const browserDir = path.resolve('dist/spider-math-frontend/browser');
const serverDir = path.resolve('dist/spider-math-frontend/server');

if (!fs.existsSync(browserDir)) {
  console.error('[prepare-browser-index] Browser output directory not found:', browserDir);
  process.exit(1);
}

const files = fs.readdirSync(browserDir);
const stylesFile = files.find((f) => /^styles(?:-[A-Za-z0-9_-]+)?\.css$/.test(f));
const polyfillsFile = files.find((f) => /^polyfills(?:-[A-Za-z0-9_-]+)?\.js$/.test(f));
const mainFile = files.find((f) => /^main(?:-[A-Za-z0-9_-]+)?\.js$/.test(f));

function injectBundles(html) {
  let updated = html;

  if (stylesFile && !updated.includes(stylesFile)) {
    updated = updated.replace(
      '</head>',
      `  <link rel="stylesheet" href="/${stylesFile}">\n</head>`
    );
  }

  const scriptsToInject = [];
  if (polyfillsFile && !updated.includes(polyfillsFile)) {
    scriptsToInject.push(`  <script type="module" src="/${polyfillsFile}"></script>`);
  }
  if (mainFile && !updated.includes(mainFile)) {
    scriptsToInject.push(`  <script type="module" src="/${mainFile}"></script>`);
  }

  if (scriptsToInject.length > 0) {
    updated = updated.replace(
      '</body>',
      `${scriptsToInject.join('\n')}\n</body>`
    );
  }

  return updated;
}

const csrPath = path.join(browserDir, 'index.csr.html');
const indexPath = path.join(browserDir, 'index.html');
const sourceHtmlPath = fs.existsSync(csrPath) ? csrPath : indexPath;

if (fs.existsSync(sourceHtmlPath)) {
  const rawHtml = fs.readFileSync(sourceHtmlPath, 'utf8');
  const finalHtml = injectBundles(rawHtml);
  fs.writeFileSync(csrPath, finalHtml, 'utf8');
  fs.writeFileSync(indexPath, finalHtml, 'utf8');
  console.log(
    `[prepare-browser-index] Synced index.html & index.csr.html with bundles: ${[
      stylesFile,
      polyfillsFile,
      mainFile,
    ]
      .filter(Boolean)
      .join(', ')}`
  );
}

// Keep SSR server assets in sync as well
const serverIndexHtmlPath = path.join(serverDir, 'index.server.html');
if (fs.existsSync(serverIndexHtmlPath)) {
  const rawServerHtml = fs.readFileSync(serverIndexHtmlPath, 'utf8');
  const finalServerHtml = injectBundles(rawServerHtml);
  fs.writeFileSync(serverIndexHtmlPath, finalServerHtml, 'utf8');
}

const manifestPath = path.join(serverDir, 'angular-app-manifest.mjs');
const csrChunkPath = path.join(serverDir, 'assets-chunks', 'index_csr_html.mjs');
const serverChunkPath = path.join(serverDir, 'assets-chunks', 'index_server_html.mjs');

function updateServerChunk(chunkPath, assetKey) {
  if (!fs.existsSync(chunkPath)) return;
  const chunkContent = fs.readFileSync(chunkPath, 'utf8');
  const match = chunkContent.match(/^export default `([\s\S]*)`;\s*$/);
  if (!match) return;
  const updatedHtml = injectBundles(match[1]);
  const newChunkContent = `export default \`${updatedHtml.replace(/`/g, '\\`').replace(/\$\{/g, '\\${')}\`;\n`;
  fs.writeFileSync(chunkPath, newChunkContent, 'utf8');

  if (fs.existsSync(manifestPath)) {
    const size = Buffer.byteLength(updatedHtml, 'utf8');
    const hash = crypto.createHash('sha256').update(updatedHtml).digest('hex').slice(0, 16);
    let manifest = fs.readFileSync(manifestPath, 'utf8');
    const regex = new RegExp(`'${assetKey.replace('.', '\\.')}':\\s*\\{size:\\s*\\d+,\\s*hash:\\s*'[^']+'`);
    manifest = manifest.replace(regex, `'${assetKey}': {size: ${size}, hash: '${hash}'`);
    fs.writeFileSync(manifestPath, manifest, 'utf8');
  }
}

updateServerChunk(csrChunkPath, 'index.csr.html');
updateServerChunk(serverChunkPath, 'index.server.html');

