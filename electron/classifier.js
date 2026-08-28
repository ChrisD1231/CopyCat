/**
 * Content Classifier
 * Detects content type, generates AI-like descriptions, extracts metadata, and creates tags.
 */

// ─── Content Type Detection ────────────────────────────────────────────────────

const TYPE_PATTERNS = {
  color: /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$|^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$|^hsl\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*\)$/i,
  email: /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/,
  phone: /^[\+]?[\d\s\-\.\(\)]{7,20}$|^\+?1?\s?(\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4})$/,
  url: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/i,
  address: /\d+\s+[\w\s]+(?:street|st|avenue|ave|road|rd|boulevard|blvd|drive|dr|lane|ln|court|ct|way|place|pl|circle|cr|highway|hwy)\s*,?\s*[\w\s]+,?\s*[A-Z]{2}\s*\d{5}/i,
  code: null, // handled separately
};

const CODE_INDICATORS = [
  /^(import|export|require|const|let|var|function|class|def|fn|pub|use|from|async|await)\s/m,
  /^(SELECT|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP|WITH)\s/im,
  /<[a-zA-Z][^>]*>[\s\S]*<\/[a-zA-Z]>/,
  /\{[\s\S]*\}|\[[\s\S]*\]/,
  /=>\s*\{|=>\s*\(|\(\)\s*=>/,
  /^\s*(\/\/|#|\/\*|\*\/|<!--|-->)/m,
  /\b(useState|useEffect|useCallback|useMemo|useRef)\s*\(/,
  /\b(gsap|anime|three|React|Vue|Angular|axios|fetch)\b/,
  /@(keyframes|media|import|mixin|include|extend)/,
];

const PROMPT_INDICATORS = [
  /\b(write|create|generate|make|build|design|help me|please|could you|act as|you are|imagine|describe)\b/i,
  /\b(AI|GPT|Claude|Gemini|prompt|assistant|model)\b/i,
];

function detectContentType(content) {
  if (!content || typeof content !== 'string') return 'text';
  
  const trimmed = content.trim();
  
  // Color
  if (TYPE_PATTERNS.color.test(trimmed)) return 'color';
  
  // Email  
  if (TYPE_PATTERNS.email.test(trimmed)) return 'email';
  
  // Phone
  if (trimmed.length < 25 && TYPE_PATTERNS.phone.test(trimmed)) return 'phone';
  
  // URL
  if (TYPE_PATTERNS.url.test(trimmed)) return 'url';
  
  // Address
  if (TYPE_PATTERNS.address.test(trimmed)) return 'address';
  
  // Code (check multiple indicators)
  const codeScore = CODE_INDICATORS.filter(pattern => pattern.test(trimmed)).length;
  if (codeScore >= 2 || (codeScore >= 1 && trimmed.includes('\n'))) return 'code';
  
  // AI Prompt (longer text that looks like an instruction)
  if (trimmed.length > 50 && PROMPT_INDICATORS.filter(p => p.test(trimmed)).length >= 2) return 'prompt';
  
  return 'text';
}

// ─── Code Language Detection ───────────────────────────────────────────────────

function detectLanguage(content) {
  if (/\b(import React|useState|useEffect|jsx|tsx|\.tsx|\.jsx)\b/i.test(content)) return 'React/TSX';
  if (/\b(const|let|var|function|=>|async|await|require|import)\b/.test(content) && !/<[a-z]/.test(content)) return 'JavaScript';
  if (/\b(def|class|import|print|__init__|self\.|isinstance)\b/.test(content)) return 'Python';
  if (/\b(fn |let |use |pub |impl |struct |enum |match )\b/.test(content)) return 'Rust';
  if (/\b(SELECT|INSERT|UPDATE|DELETE|FROM|WHERE|JOIN)\b/i.test(content)) return 'SQL';
  if (/<[a-zA-Z][^>]*>[\s\S]*<\//.test(content)) return content.includes('class=') ? 'JSX/HTML' : 'HTML';
  if (/@(keyframes|media|import|mixin)|^\s*\.[a-z-]+\s*\{/m.test(content)) return 'CSS';
  if (/\b(package main|func |import \(|:=)\b/.test(content)) return 'Go';
  if (/\b(public class|private|protected|void|String|int|boolean)\b/.test(content)) return 'Java';
  if (/\b(#include|std::|cout|cin|namespace|template<)\b/.test(content)) return 'C++';
  if (/\b(gsap|ScrollTrigger|ScrollSmoother|timeline|to\(|from\(|fromTo\()\b/.test(content)) return 'JavaScript/GSAP';
  if (/\b(three|THREE|Scene|Camera|WebGLRenderer|Mesh|Geometry)\b/.test(content)) return 'JavaScript/Three.js';
  return 'Code';
}

// ─── Color Analysis ────────────────────────────────────────────────────────────

function analyzeColor(hex) {
  // Convert to RGB
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);

  // Get HSL
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;

  let h, s;
  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rn: h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6; break;
      case gn: h = ((bn - rn) / d + 2) / 6; break;
      case bn: h = ((rn - gn) / d + 4) / 6; break;
    }
  }

  const hDeg = Math.round(h * 360);
  const sPct = Math.round(s * 100);
  const lPct = Math.round(l * 100);

  // Named color approximation
  const name = approximateColorName(hDeg, sPct, lPct, r, g, b);
  return { r, g, b, h: hDeg, s: sPct, l: lPct, name };
}

function approximateColorName(h, s, l, r, g, b) {
  if (s < 10) {
    if (l > 90) return 'White';
    if (l > 70) return 'Light Gray';
    if (l > 40) return 'Gray';
    if (l > 20) return 'Dark Gray';
    return 'Black';
  }
  
  if (l < 15) return 'Very Dark ' + getHueName(h);
  if (l > 85) return 'Very Light ' + getHueName(h);
  if (l < 30) return 'Dark ' + getHueName(h);
  if (l > 70) return 'Light ' + getHueName(h);
  
  // Specific color descriptions
  if (h >= 160 && h <= 200 && s >= 30 && l >= 50 && l <= 75) return 'Seafoam';
  if (h >= 195 && h <= 225 && s >= 50) return 'Sky Blue';
  if (h >= 270 && h <= 300 && s >= 40) return 'Purple';
  if (h >= 300 && h <= 330 && s >= 40) return 'Magenta';
  
  return getHueName(h);
}

function getHueName(h) {
  if (h < 15 || h >= 345) return 'Red';
  if (h < 45) return 'Orange';
  if (h < 75) return 'Yellow';
  if (h < 150) return 'Green';
  if (h < 180) return 'Teal';
  if (h < 240) return 'Blue';
  if (h < 270) return 'Indigo';
  if (h < 330) return 'Purple';
  return 'Pink';
}

// ─── URL Analysis ─────────────────────────────────────────────────────────────

function analyzeUrl(url) {
  try {
    const parsed = new URL(url);
    const domain = parsed.hostname.replace('www.', '');
    const path = parsed.pathname;
    
    // Extract readable title from path
    const pathParts = path.split('/').filter(p => p && p !== 'index.html');
    const title = pathParts.length > 0 
      ? pathParts[pathParts.length - 1].replace(/[-_]/g, ' ').replace(/\.\w+$/, '')
      : domain;

    return {
      domain,
      title: title.charAt(0).toUpperCase() + title.slice(1),
      favicon: `https://www.google.com/s2/favicons?domain=${domain}&sz=32`,
    };
  } catch {
    return { domain: url, title: url, favicon: null };
  }
}

// ─── Description Generator ────────────────────────────────────────────────────

function generateDescription(content, type, metadata) {
  switch (type) {
    case 'color': {
      const c = metadata.colorData;
      return `${c.name} color — rgb(${c.r}, ${c.g}, ${c.b}) · HSL(${c.h}°, ${c.s}%, ${c.l}%)`;
    }
    case 'email':
      return `Email address${metadata.name ? ` for ${metadata.name}` : ''}`;
    case 'phone':
      return `Phone number`;
    case 'url': {
      const u = metadata.urlData;
      return `Website: ${u.title} — ${u.domain}`;
    }
    case 'code': {
      const lang = metadata.language;
      const preview = content.trim().split('\n')[0].substring(0, 80);
      return generateCodeDescription(content, lang, preview);
    }
    case 'prompt':
      return `AI prompt — ${content.substring(0, 100)}${content.length > 100 ? '...' : ''}`;
    case 'address':
      return `Physical address`;
    default:
      return content.length > 120 
        ? content.substring(0, 120) + '...' 
        : content;
  }
}

function generateCodeDescription(content, lang, preview) {
  const contentLower = content.toLowerCase();
  
  // GSAP / Animation
  if (/gsap|scrolltrigger|scrollsmoother/.test(contentLower)) {
    if (/scrolltrigger/.test(contentLower)) return `GSAP ScrollTrigger code — scroll-based website animation`;
    if (/timeline/.test(contentLower)) return `GSAP timeline animation sequence`;
    return `GSAP animation code — ${lang}`;
  }
  
  // Three.js
  if (/three|webgl|scene|camera|renderer/.test(contentLower)) {
    return `Three.js 3D scene code — WebGL renderer setup`;
  }
  
  // React hooks
  if (/usestate|useeffect|usecallback/.test(contentLower)) {
    const hooks = [];
    if (/usestate/.test(contentLower)) hooks.push('useState');
    if (/useeffect/.test(contentLower)) hooks.push('useEffect');
    if (/usecallback/.test(contentLower)) hooks.push('useCallback');
    return `React hook — ${hooks.join(', ')} · ${lang}`;
  }
  
  // CSS animations
  if (/@keyframes|animation:|transition:/.test(contentLower)) {
    return `CSS animation — keyframe or transition definition`;
  }
  
  // SQL
  if (/select|insert|update|delete/i.test(content)) {
    const match = content.match(/(?:FROM|INTO|UPDATE|TABLE)\s+(\w+)/i);
    return `SQL query${match ? ` on ${match[1]} table` : ''}`;
  }
  
  // API calls
  if (/fetch\(|axios\.|\.get\(|\.post\(/.test(contentLower)) {
    return `API call — ${lang}`;
  }
  
  return `${lang} code snippet`;
}

// ─── Tag Generator ────────────────────────────────────────────────────────────

function generateTags(content, type, metadata) {
  const tags = new Set();
  const contentLower = content.toLowerCase();
  
  // Type tag
  tags.add(type);
  
  switch (type) {
    case 'code': {
      const lang = metadata.language?.toLowerCase().replace(/\s*\/.*/, '');
      if (lang) tags.add(lang);
      
      // Library/framework tags
      const techMap = {
        'gsap': ['gsap', 'animation', 'scrolling', 'frontend'],
        'three': ['three.js', '3d', 'webgl', 'animation'],
        'react': ['react', 'frontend', 'component', 'jsx'],
        'vue': ['vue', 'frontend', 'component'],
        'angular': ['angular', 'frontend', 'component'],
        'tailwind': ['tailwind', 'css', 'frontend'],
        'scrolltrigger': ['scrolltrigger', 'gsap', 'animation', 'scrolling'],
        'usestate': ['react', 'hooks', 'state-management'],
        'useeffect': ['react', 'hooks', 'lifecycle'],
        'fetch': ['api', 'http', 'networking'],
        'axios': ['api', 'http', 'networking'],
        'sql': ['database', 'query'],
        'select': ['database', 'sql', 'query'],
        'animation': ['animation', 'frontend'],
        'keyframes': ['css', 'animation', 'frontend'],
        'async': ['async', 'javascript'],
        'await': ['async', 'javascript'],
      };
      
      for (const [keyword, libTags] of Object.entries(techMap)) {
        if (contentLower.includes(keyword)) {
          libTags.forEach(t => tags.add(t));
        }
      }
      break;
    }
    
    case 'color': {
      const c = metadata.colorData;
      tags.add('color');
      tags.add('design');
      if (c.name) tags.add(c.name.toLowerCase().split(' ').pop());
      break;
    }
    
    case 'url': {
      const d = metadata.urlData?.domain || '';
      tags.add('link');
      tags.add('website');
      if (d.includes('github')) tags.add('github');
      if (d.includes('figma')) tags.add('figma');
      if (d.includes('notion')) tags.add('notion');
      if (d.includes('dribbble')) { tags.add('design'); tags.add('inspiration'); }
      if (d.includes('behance')) { tags.add('design'); tags.add('inspiration'); }
      if (d.includes('stackoverflow')) { tags.add('stackoverflow'); tags.add('code'); }
      if (d.includes('npm')) { tags.add('npm'); tags.add('package'); }
      if (d.includes('docs.')) tags.add('documentation');
      break;
    }
    
    case 'email':
      tags.add('contact');
      break;
    
    case 'phone':
      tags.add('contact');
      break;
    
    case 'address':
      tags.add('contact');
      tags.add('location');
      break;
    
    case 'prompt':
      tags.add('ai');
      tags.add('prompt');
      if (/image|photo|picture|visual/.test(contentLower)) tags.add('image-generation');
      if (/video|animation/.test(contentLower)) tags.add('video-generation');
      if (/code|function|script/.test(contentLower)) tags.add('code-generation');
      break;
  }
  
  // Topic tags from content
  const topicMap = {
    'boat': ['boat', 'marine', 'water'],
    'lighthouse': ['lighthouse', 'construction'],
    'construction': ['construction', 'building'],
    'design': ['design', 'ui'],
    'animation': ['animation'],
    'scroll': ['scrolling', 'animation'],
    'dark mode': ['dark-mode', 'theme'],
    'gradient': ['gradient', 'css', 'design'],
    'firebase': ['firebase', 'backend'],
    'supabase': ['supabase', 'backend'],
    'stripe': ['stripe', 'payments'],
    'tailwind': ['tailwind', 'css'],
  };
  
  for (const [keyword, topicTags] of Object.entries(topicMap)) {
    if (contentLower.includes(keyword)) {
      topicTags.forEach(t => tags.add(t));
    }
  }
  
  return Array.from(tags).slice(0, 10);
}

// ─── Collection Hint ──────────────────────────────────────────────────────────

function detectCollectionHint(content, tags) {
  const contentLower = content.toLowerCase();
  const tagSet = new Set(tags);
  
  if (/lighthouse|construction/.test(contentLower)) return 'lighthouse-construction';
  if (/boat|wake|marine/.test(contentLower)) return 'boat-project';
  if (tagSet.has('gsap') || tagSet.has('animation') && tagSet.has('scrolling')) return 'animation-code';
  if (tagSet.has('prompt') || tagSet.has('ai')) return 'ai-prompts';
  if (tagSet.has('code') && (tagSet.has('react') || tagSet.has('javascript'))) return 'code-snippets';
  if (tagSet.has('color') || tagSet.has('design')) return 'design-assets';
  if (tagSet.has('contact')) return 'contacts';
  
  return null;
}

// ─── Main Classifier ──────────────────────────────────────────────────────────

function classifyContent(content, sourceApp) {
  const type = detectContentType(content);
  const metadata = {};

  if (type === 'color') {
    const hex = content.trim().startsWith('#') ? content.trim() : '#' + content.trim();
    try {
      metadata.colorData = analyzeColor(hex.length > 7 ? hex.substring(0, 7) : hex);
      metadata.colorHex = hex;
    } catch { metadata.colorData = { name: 'Color' }; }
  }

  if (type === 'code') {
    metadata.language = detectLanguage(content);
  }

  if (type === 'url') {
    metadata.urlData = analyzeUrl(content.trim());
  }

  const description = generateDescription(content, type, metadata);
  const tags = generateTags(content, type, metadata);
  const collectionHint = detectCollectionHint(content, tags);

  // Build title
  let title;
  switch (type) {
    case 'color': title = `${metadata.colorData?.name || 'Color'} — ${content.trim()}`; break;
    case 'code': title = metadata.language; break;
    case 'url': title = metadata.urlData?.domain || content.substring(0, 50); break;
    case 'email': title = content.trim(); break;
    case 'phone': title = content.trim(); break;
    case 'prompt': title = 'AI Prompt — ' + content.substring(0, 40); break;
    default: title = content.substring(0, 60) + (content.length > 60 ? '...' : '');
  }

  return {
    content_type: type,
    title,
    description,
    tags,
    collection_hint: collectionHint,
    color_hex: metadata.colorHex || null,
    color_name: metadata.colorData?.name || null,
    source_domain: type === 'url' ? metadata.urlData?.domain : null,
    favicon_url: type === 'url' ? metadata.urlData?.favicon : null,
    language: type === 'code' ? metadata.language : null,
  };
}

module.exports = { classifyContent, detectContentType, generateTags, detectCollectionHint };
