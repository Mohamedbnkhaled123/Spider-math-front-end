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

function collectCriticalModulePreloads() {
  const preloads = new Set();
  if (mainFile) preloads.add(mainFile);

  const extractStaticImports = (jsFile) => {
    const filePath = path.join(browserDir, jsFile);
    if (!fs.existsSync(filePath)) return [];
    const content = fs.readFileSync(filePath, 'utf8');
    const results = [];
    const staticRe = /from\s*["']\.\/(chunk-[A-Za-z0-9_-]+\.js)["']/g;
    let m;
    while ((m = staticRe.exec(content)) !== null) {
      results.push(m[1]);
    }
    return results;
  };

  if (mainFile) {
    for (const chunk of extractStaticImports(mainFile)) {
      preloads.add(chunk);
    }
    // Also find the landing-home chunk (first dynamic import in main or route table)
    const mainContent = fs.readFileSync(path.join(browserDir, mainFile), 'utf8');
    const dynMatch = mainContent.match(/import\(\s*["']\.\/(chunk-[A-Za-z0-9_-]+\.js)["']\s*\)/);
    if (dynMatch && dynMatch[1]) {
      const landingChunk = dynMatch[1];
      preloads.add(landingChunk);
      for (const subChunk of extractStaticImports(landingChunk)) {
        preloads.add(subChunk);
      }
    }
  }

  return Array.from(preloads);
}

const criticalPreloads = collectCriticalModulePreloads();

function injectBundles(html) {
  let updated = html;

  if (stylesFile) {
    const nonBlockingCss = `  <link rel="preload" href="/${stylesFile}" as="style">\n  <link rel="stylesheet" href="/${stylesFile}" media="print" onload="this.media='all'">\n  <noscript><link rel="stylesheet" href="/${stylesFile}"></noscript>`;
    // Replace any existing blocking stylesheet link for stylesFile or inject before </head>
    const blockingLinkRe = new RegExp(
      `<link[^>]*rel=["']stylesheet["'][^>]*href=["']\\/?${stylesFile.replace('.', '\\.')}["'][^>]*>`,
      'i'
    );
    if (!updated.includes(stylesFile)) {
      updated = updated.replace('</head>', `${nonBlockingCss}\n</head>`);
    } else if (blockingLinkRe.test(updated) && !updated.includes(`onload="this.media='all'"`)) {
      updated = updated.replace(blockingLinkRe, nonBlockingCss.trim());
    }
    // Ensure root-relative href for stylesFile
    updated = updated.replace(
      new RegExp(`href=["']${stylesFile.replace('.', '\\.')}["']`, 'g'),
      `href="/${stylesFile}"`
    );
  }

  // Inject modulepreload links for critical chunks to flatten the network dependency waterfall
  const preloadTags = criticalPreloads
    .filter((chunk) => !updated.includes(`href="/${chunk}"`) && !updated.includes(`href="${chunk}"`))
    .map((chunk) => `  <link rel="modulepreload" href="/${chunk}">`);
  if (preloadTags.length > 0) {
    updated = updated.replace('</head>', `${preloadTags.join('\n')}\n</head>`);
  }

  const scriptsToInject = [];
  if (polyfillsFile && !updated.includes(polyfillsFile)) {
    scriptsToInject.push(`  <script type="module" src="/${polyfillsFile}"></script>`);
  }
  if (mainFile && !updated.includes(`src="/${mainFile}"`) && !updated.includes(`src="${mainFile}"`)) {
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

let finalHtml = '';
if (fs.existsSync(sourceHtmlPath)) {
  const rawHtml = fs.readFileSync(sourceHtmlPath, 'utf8');
  finalHtml = injectBundles(rawHtml);
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

// ==============================================================================
// Generate Static Pre-rendered HTML for Google Search Console & SEO Crawlers
// ==============================================================================
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function generateStaticSeoPages(baseHtml) {
  if (!baseHtml) return;

  const tsPath = path.resolve('src/app/core/constants/seo-keywords.constant.ts');
  if (!fs.existsSync(tsPath)) {
    console.warn('[prepare-browser-index] seo-keywords.constant.ts not found, skipping static generation');
    return;
  }

  const content = fs.readFileSync(tsPath, 'utf8');
  const match = content.match(/export const SEO_KEYWORD_PAGES[^\=]*\=\s*(\[[\s\S]*?\]);\n\n\/\*\*/);
  if (!match) {
    console.warn('[prepare-browser-index] Could not parse SEO_KEYWORD_PAGES');
    return;
  }

  const pages = JSON.parse(match[1]);
  console.log(`[prepare-browser-index] Generating static SEO HTML files for ${pages.length} keywords & directory...`);

  function customizeHtml(config) {
    let html = baseHtml;

    // Title
    html = html.replace(/<title>.*?<\/title>/i, `<title>${escapeHtml(config.title)}</title>`);

    // Description
    if (html.includes('<meta name="description"')) {
      html = html.replace(/<meta name="description"[^>]*>/i, `<meta name="description" content="${escapeHtml(config.description)}">`);
    } else {
      html = html.replace('</head>', `  <meta name="description" content="${escapeHtml(config.description)}">\n</head>`);
    }

    // Canonical
    if (html.includes('<link rel="canonical"')) {
      html = html.replace(/<link rel="canonical"[^>]*>/i, `<link rel="canonical" href="${escapeHtml(config.canonicalUrl)}">`);
    } else {
      html = html.replace('</head>', `  <link rel="canonical" href="${escapeHtml(config.canonicalUrl)}">\n</head>`);
    }

    // OpenGraph & Twitter
    const ogTags = [
      `  <meta property="og:title" content="${escapeHtml(config.title)}">`,
      `  <meta property="og:description" content="${escapeHtml(config.description)}">`,
      `  <meta property="og:url" content="${escapeHtml(config.canonicalUrl)}">`,
      `  <meta property="og:type" content="${config.ogType || 'article'}">`,
      `  <meta property="og:site_name" content="Spider Math Educational Platform">`,
      `  <meta property="og:image" content="https://spider-math.com/assets/branding/spider-math-og.jpg">`,
      `  <meta name="twitter:card" content="summary_large_image">`,
      `  <meta name="twitter:title" content="${escapeHtml(config.title)}">`,
      `  <meta name="twitter:description" content="${escapeHtml(config.description)}">`,
      `  <meta name="twitter:image" content="https://spider-math.com/assets/branding/spider-math-og.jpg">`
    ];

    html = html.replace(/<meta property="og:[^>]*>\s*/gi, '');
    html = html.replace(/<meta name="twitter:[^>]*>\s*/gi, '');
    html = html.replace('</head>', `${ogTags.join('\n')}\n</head>`);

    // Schema.org scripts
    if (config.schemas && config.schemas.length > 0) {
      const schemaScripts = config.schemas.map(
        (s) => `  <script type="application/ld+json">${JSON.stringify(s)}</script>`
      );
      html = html.replace('</head>', `${schemaScripts.join('\n')}\n</head>`);
    }

    // Noscript crawler fallback inside app-root
    if (config.noscriptContent) {
      html = html.replace(
        '<app-root></app-root>',
        `<app-root>\n  <noscript>${config.noscriptContent}</noscript>\n</app-root>`
      );
    }

    return html;
  }

  // 1. Generate /topics/index.html
  const topicsDir = path.join(browserDir, 'topics');
  if (!fs.existsSync(topicsDir)) fs.mkdirSync(topicsDir, { recursive: true });

  const topicsItemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'فهرس مواضيع ومناهج سبايدر ماث | Spider Math Topics & Curricula',
    description: 'استعرض كافة الموضوعات والمناهج وشروحات الرياضيات للدبلومة الأمريكية والبكالوريا والثانوية العامة والشهادة الإعدادية مع المهندسة هبة عبدالوهاب.',
    numberOfItems: pages.length,
    itemListElement: pages.map((topic, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: topic.keywordAr,
      url: `https://spider-math.com/topic/${topic.slug}`
    }))
  };

  const topicsNoscript = `
    <div style="padding: 2rem; max-width: 900px; margin: 0 auto; color: #F8FAFC; background-color: #2A1D37; font-family: sans-serif;">
      <h1>فهرس مواضيع ومناهج سبايدر ماث | Spider Math Topics & Curricula</h1>
      <p>دليلك الشامل لجميع المناهج الدراسية، الشهادات الدولية (SAT • EST • ACT)، البكالوريا، مراجعات ليلة الامتحان، وشروحات المهندسة هبة عبدالوهاب (ميس هبة عياد).</p>
      <ul>
        ${pages.map(p => `<li><a href="/topic/${p.slug}" style="color: #D4AF6A;">${escapeHtml(p.keywordAr)} (${escapeHtml(p.keywordEn)})</a></li>`).join('')}
      </ul>
    </div>
  `;

  const topicsHtml = customizeHtml({
    title: 'فهرس مواضيع ومناهج سبايدر ماث | Spider Math Topics & Curricula',
    description: 'استعرض كافة الموضوعات والمناهج وشروحات الرياضيات للدبلومة الأمريكية والبكالوريا والثانوية العامة والشهادة الإعدادية مع المهندسة هبة عبدالوهاب.',
    canonicalUrl: 'https://spider-math.com/topics',
    ogType: 'website',
    schemas: [topicsItemListSchema],
    noscriptContent: topicsNoscript
  });

  fs.writeFileSync(path.join(topicsDir, 'index.html'), topicsHtml, 'utf8');

  // 2. Generate each of the 75 topic pages & aliases
  for (const item of pages) {
    const topicDir = path.join(browserDir, 'topic', item.slug);
    if (!fs.existsSync(topicDir)) fs.mkdirSync(topicDir, { recursive: true });

    const breadcrumbSchema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'الرئيسية', item: 'https://spider-math.com/' },
        { '@type': 'ListItem', position: 2, name: 'فهرس الموضوعات والمناهج', item: 'https://spider-math.com/topics' },
        { '@type': 'ListItem', position: 3, name: item.keywordAr, item: `https://spider-math.com/topic/${item.slug}` }
      ]
    };

    const courseSchema = {
      '@context': 'https://schema.org',
      '@type': 'Course',
      name: item.pageTitleAr,
      alternateName: item.pageTitleEn,
      description: item.metaDescriptionAr,
      provider: {
        '@type': 'EducationalOrganization',
        name: 'Spider Math Educational Platform',
        alternateName: 'منصة سبايدر ماث التعليمية',
        url: 'https://spider-math.com'
      },
      instructor: {
        '@type': 'Person',
        name: 'Eng. Heba Abdel-Wahab (Heba Ayad)',
        jobTitle: 'Senior Mathematics Lecturer'
      }
    };

    const schemas = [breadcrumbSchema, courseSchema];

    if (item.faqs && item.faqs.length > 0) {
      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: item.faqs.map(f => ({
          '@type': 'Question',
          name: f.questionAr,
          acceptedAnswer: { '@type': 'Answer', text: f.answerAr }
        }))
      });
    }

    const noscriptContent = `
      <div style="padding: 2rem; max-width: 900px; margin: 0 auto; color: #F8FAFC; background-color: #2A1D37; font-family: sans-serif;">
        <nav><a href="/" style="color: #D4AF6A;">الرئيسية</a> / <a href="/topics" style="color: #D4AF6A;">فهرس الموضوعات</a> / <span>${escapeHtml(item.keywordAr)}</span></nav>
        <h1>${escapeHtml(item.headlineAr)}</h1>
        <p><strong>الكلمة المفتاحية:</strong> ${escapeHtml(item.keywordAr)} ⇄ <strong>Translation:</strong> ${escapeHtml(item.keywordEn)}</p>
        <p>${escapeHtml(item.subheadlineAr)}</p>
        <p>${escapeHtml(item.overviewAr)}</p>
        <h2>الوحدات والمحتوى الدراسي</h2>
        <ul>
          ${item.syllabus.map(s => `<li><strong>${escapeHtml(s.titleAr)} (${escapeHtml(s.titleEn)})</strong>: ${escapeHtml(s.detailsAr)}</li>`).join('')}
        </ul>
        <h2>الأسئلة الشائعة</h2>
        ${item.faqs.map(f => `<div><h3>${escapeHtml(f.questionAr)}</h3><p>${escapeHtml(f.answerAr)}</p></div>`).join('')}
      </div>
    `;

    const topicHtml = customizeHtml({
      title: item.pageTitleAr,
      description: item.metaDescriptionAr,
      canonicalUrl: `https://spider-math.com/topic/${item.slug}`,
      ogType: 'article',
      schemas,
      noscriptContent
    });

    fs.writeFileSync(path.join(topicDir, 'index.html'), topicHtml, 'utf8');

    // Also write alias directories if valid
    if (item.slugAliases && item.slugAliases.length > 0) {
      for (const alias of item.slugAliases) {
        try {
          const aliasDir = path.join(browserDir, 'topic', alias);
          if (!fs.existsSync(aliasDir)) fs.mkdirSync(aliasDir, { recursive: true });
          fs.writeFileSync(path.join(aliasDir, 'index.html'), topicHtml, 'utf8');
        } catch {
          // ignore any filesystem naming issues with special characters
        }
      }
    }
  }

  console.log(`[prepare-browser-index] Successfully pre-rendered static HTML for ${pages.length} keywords & /topics!`);
}

if (typeof finalHtml !== 'undefined') {
  generateStaticSeoPages(finalHtml);
}

