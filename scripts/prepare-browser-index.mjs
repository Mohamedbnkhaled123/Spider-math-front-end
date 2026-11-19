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

function collectCriticalModulePreloads(includeLandingRoute = true) {
  // Keep modulepreload strictly lean (main + optional landing route entry chunk) so slow 4G
  // connections don't saturate bandwidth with 20+ JS chunks ahead of FCP/LCP image & CSS.
  const preloads = new Set();
  if (mainFile) preloads.add(mainFile);

  if (includeLandingRoute && mainFile) {
    const mainContent = fs.readFileSync(path.join(browserDir, mainFile), 'utf8');
    const dynMatch = mainContent.match(/import\(\s*["']\.\/(chunk-[A-Za-z0-9_-]+\.js)["']\s*\)/);
    if (dynMatch && dynMatch[1]) {
      preloads.add(dynMatch[1]);
    }
  }

  return Array.from(preloads);
}

const criticalPreloads = collectCriticalModulePreloads(true);
const coreOnlyPreloads = collectCriticalModulePreloads(false);

function injectBundles(html, preloads = criticalPreloads, options = {}) {
  const { blockingStyles = false } = options;
  let updated = html;

  if (stylesFile) {
    const escapedStyles = stylesFile.replace('.', '\\.');
    if (blockingStyles) {
      // On prerendered SSG pages, load the small (~16 KB gzipped) main stylesheet synchronously
      // so the prerendered DOM paints 100% styled on frame 1 with zero FOUC and zero CLS.
      const blockingCss = `  <link rel="stylesheet" href="/${stylesFile}">`;
      if (!updated.includes(stylesFile)) {
        updated = updated.replace('</head>', `${blockingCss}\n</head>`);
      } else {
        // Normalize any media="print" async trick back to standard blocking stylesheet on SSG page
        updated = updated.replace(
          new RegExp(`\\s*<link[^>]*rel=["']preload["'][^>]*href=["']\\/?${escapedStyles}["'][^>]*>`, 'gi'),
          ''
        );
        updated = updated.replace(
          new RegExp(`\\s*<noscript>\\s*<link[^>]*href=["']\\/?${escapedStyles}["'][^>]*>\\s*<\\/noscript>`, 'gi'),
          ''
        );
        updated = updated.replace(
          new RegExp(`<link[^>]*rel=["']stylesheet["'][^>]*href=["']\\/?${escapedStyles}["'][^>]*>`, 'gi'),
          `<link rel="stylesheet" href="/${stylesFile}">`
        );
      }
    } else {
      const nonBlockingCss = `  <link rel="preload" href="/${stylesFile}" as="style">\n  <link rel="stylesheet" href="/${stylesFile}" media="print" onload="this.media='all'">\n  <noscript><link rel="stylesheet" href="/${stylesFile}"></noscript>`;
      const blockingLinkRe = new RegExp(
        `<link[^>]*rel=["']stylesheet["'][^>]*href=["']\\/?${escapedStyles}["'][^>]*>`,
        'i'
      );
      if (!updated.includes(stylesFile)) {
        updated = updated.replace('</head>', `${nonBlockingCss}\n</head>`);
      } else if (blockingLinkRe.test(updated) && !updated.includes(`onload="this.media='all'"`)) {
        updated = updated.replace(blockingLinkRe, nonBlockingCss.trim());
      }
    }
    // Ensure root-relative href for stylesFile (works on nested routes like /topic/slug)
    updated = updated.replace(
      new RegExp(`href=["']${escapedStyles}["']`, 'g'),
      `href="/${stylesFile}"`
    );
  }

  // Inject lean modulepreload links for critical chunks
  const preloadTags = preloads
    .filter((chunk) => !updated.includes(`href="/${chunk}"`) && !updated.includes(`href="${chunk}"`))
    .map((chunk) => `  <link rel="modulepreload" href="/${chunk}">`);
  if (preloadTags.length > 0) {
    updated = updated.replace('</head>', `${preloadTags.join('\n')}\n</head>`);
  }

  const scriptsToInject = [];
  if (polyfillsFile) {
    updated = updated.replace(
      new RegExp(`\\s*<script[^>]*src=["']\\/?${polyfillsFile.replace('.', '\\.')}["'][^>]*><\\/script>`, 'gi'),
      ''
    );
    scriptsToInject.push(`  <script type="module" src="/${polyfillsFile}"></script>`);
  }
  if (mainFile) {
    updated = updated.replace(
      new RegExp(`\\s*<script[^>]*src=["']\\/?${mainFile.replace('.', '\\.')}["'][^>]*><\\/script>`, 'gi'),
      ''
    );
    scriptsToInject.push(`  <script type="module" src="/${mainFile}"></script>`);
  }

  if (scriptsToInject.length > 0) {
    updated = updated.replace(
      '</body>',
      `\n${scriptsToInject.join('\n')}\n</body>`
    );
  }

  return updated;
}

const csrPath = path.join(browserDir, 'index.csr.html');
const indexPath = path.join(browserDir, 'index.html');

let csrHtml = '';
if (fs.existsSync(csrPath)) {
  const rawCsrHtml = fs.readFileSync(csrPath, 'utf8');
  csrHtml = injectBundles(rawCsrHtml, coreOnlyPreloads);
  fs.writeFileSync(csrPath, csrHtml, 'utf8');
}

// Preserve prerendered SSG index.html for '/' (do NOT overwrite with CSR skeleton!)
let finalHtml = '';
if (fs.existsSync(indexPath)) {
  const rawIndexHtml = fs.readFileSync(indexPath, 'utf8');
  const isPrerendered = rawIndexHtml.includes('ng-server-context=') || rawIndexHtml.includes('<app-landing-home');
  finalHtml = injectBundles(rawIndexHtml, criticalPreloads, { blockingStyles: isPrerendered });
  fs.writeFileSync(indexPath, finalHtml, 'utf8');
  console.log(
    `[prepare-browser-index] Processed ${isPrerendered ? 'PRERENDERED SSG' : 'CSR'} index.html & index.csr.html with bundles: ${[
      stylesFile,
      polyfillsFile,
      mainFile,
    ]
      .filter(Boolean)
      .join(', ')}`
  );
} else if (csrHtml) {
  finalHtml = injectBundles(csrHtml, criticalPreloads);
  fs.writeFileSync(indexPath, finalHtml, 'utf8');
  console.log(
    `[prepare-browser-index] Synced index.html from index.csr.html with bundles: ${[
      stylesFile,
      polyfillsFile,
      mainFile,
    ]
      .filter(Boolean)
      .join(', ')}`
  );
}

const seoBaseHtml = csrHtml || finalHtml;

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
      `  <meta property="og:image" content="https://www.spider-math.com/assets/branding/spider-math-og.jpg">`,
      `  <meta property="og:image:secure_url" content="https://www.spider-math.com/assets/branding/spider-math-og.jpg">`,
      `  <meta property="og:image:type" content="image/jpeg">`,
      `  <meta property="og:image:width" content="1024">`,
      `  <meta property="og:image:height" content="1024">`,
      `  <meta property="og:image:alt" content="Spider Math Platform | منصة سبايدر ماث — المهندسة هبة عبدالوهاب">`,
      `  <link rel="image_src" href="https://www.spider-math.com/assets/branding/spider-math-og.jpg">`,
      `  <meta name="twitter:card" content="summary_large_image">`,
      `  <meta name="twitter:title" content="${escapeHtml(config.title)}">`,
      `  <meta name="twitter:description" content="${escapeHtml(config.description)}">`,
      `  <meta name="twitter:image" content="https://www.spider-math.com/assets/branding/spider-math-og.jpg">`,
      `  <meta name="twitter:image:alt" content="Spider Math Platform | منصة سبايدر ماث — المهندسة هبة عبدالوهاب">`
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
      url: `https://www.spider-math.com/topic/${topic.slug}`
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
    canonicalUrl: 'https://www.spider-math.com/topics',
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
        { '@type': 'ListItem', position: 1, name: 'الرئيسية', item: 'https://www.spider-math.com/' },
        { '@type': 'ListItem', position: 2, name: 'فهرس الموضوعات والمناهج', item: 'https://www.spider-math.com/topics' },
        { '@type': 'ListItem', position: 3, name: item.keywordAr, item: `https://www.spider-math.com/topic/${item.slug}` }
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
        url: 'https://www.spider-math.com'
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
      canonicalUrl: `https://www.spider-math.com/topic/${item.slug}`,
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

if (typeof seoBaseHtml !== 'undefined' && seoBaseHtml) {
  generateStaticSeoPages(seoBaseHtml);
} else if (typeof finalHtml !== 'undefined' && finalHtml) {
  generateStaticSeoPages(finalHtml);
}

