/**
 * Seed Data — Realistic clipboard history for demo/development.
 * Includes related items forming natural collections.
 */

const { insertItem, createCollection, addToCollection, getAllItemsForIndex } = require('./database');
const { buildIndex } = require('./search-engine');

const now = Date.now();
const DAY = 86400000;
const HOUR = 3600000;

function ts(daysAgo, hoursAgo = 0) {
  return now - (daysAgo * DAY) - (hoursAgo * HOUR);
}

function seedDemoData() {
  console.log('Seeding demo data...');

  const items = [
    // ─── CODE SNIPPETS ────────────────────────────────────────────────────
    {
      content: `gsap.registerPlugin(ScrollTrigger);

gsap.to(".hero-text", {
  opacity: 1,
  y: 0,
  duration: 1.2,
  ease: "power4.out",
  scrollTrigger: {
    trigger: ".hero-section",
    start: "top 80%",
    end: "bottom 20%",
    toggleActions: "play none none reverse"
  }
});`,
      content_type: 'code',
      title: 'JavaScript/GSAP',
      description: 'GSAP ScrollTrigger code — scroll-based website animation',
      tags: ['javascript', 'gsap', 'animation', 'scrolling', 'frontend', 'scrolltrigger'],
      preview_text: 'gsap.registerPlugin(ScrollTrigger)',
      collection_hint: 'boat-project',
      created_at: ts(21),
      updated_at: ts(21),
    },
    {
      content: `const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshStandardMaterial({ color: 0x67C7B5 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

camera.position.z = 5;

function animate() {
  requestAnimationFrame(animate);
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;
  renderer.render(scene, camera);
}
animate();`,
      content_type: 'code',
      title: 'JavaScript/Three.js',
      description: 'Three.js 3D scene code — WebGL renderer setup with animated cube',
      tags: ['javascript', 'three.js', '3d', 'webgl', 'animation', 'frontend'],
      preview_text: 'Three.js WebGL 3D scene setup',
      collection_hint: 'boat-project',
      created_at: ts(45),
      updated_at: ts(45),
    },
    {
      content: `import { useState, useCallback } from 'react';

export function useClipboard(timeout = 2000) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), timeout);
      return true;
    } catch (err) {
      console.error('Failed to copy:', err);
      return false;
    }
  }, [timeout]);

  return { copied, copy };
}`,
      content_type: 'code',
      title: 'React/TypeScript',
      description: 'React hook — useClipboard — copies text to clipboard with success state',
      tags: ['react', 'javascript', 'hooks', 'clipboard', 'frontend', 'useState', 'useCallback'],
      preview_text: 'useClipboard React hook',
      created_at: ts(7),
      updated_at: ts(7),
    },
    {
      content: `@keyframes smoothSlideUp {
  from {
    opacity: 0;
    transform: translateY(24px) scale(0.97);
    filter: blur(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
    filter: blur(0);
  }
}

.animate-in {
  animation: smoothSlideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}`,
      content_type: 'code',
      title: 'CSS',
      description: 'CSS animation — smooth slide-up with blur reveal keyframe',
      tags: ['css', 'animation', 'keyframes', 'frontend', 'smooth'],
      preview_text: '@keyframes smoothSlideUp',
      collection_hint: 'animation-code',
      created_at: ts(14),
      updated_at: ts(14),
    },
    {
      content: `SELECT 
  p.name,
  COUNT(o.id) as order_count,
  SUM(o.total) as revenue,
  AVG(o.total) as avg_order_value
FROM products p
LEFT JOIN order_items oi ON oi.product_id = p.id
LEFT JOIN orders o ON o.id = oi.order_id
WHERE o.created_at >= NOW() - INTERVAL '30 days'
GROUP BY p.id, p.name
ORDER BY revenue DESC
LIMIT 20;`,
      content_type: 'code',
      title: 'SQL',
      description: 'SQL query — product revenue report for last 30 days with aggregates',
      tags: ['sql', 'database', 'query', 'analytics', 'revenue'],
      preview_text: 'Product revenue SQL query',
      created_at: ts(3),
      updated_at: ts(3),
    },
    {
      content: `const parallaxElements = document.querySelectorAll('[data-parallax]');

window.addEventListener('scroll', () => {
  const scrollY = window.scrollY;
  
  parallaxElements.forEach(el => {
    const speed = parseFloat(el.dataset.parallax) || 0.5;
    const yPos = -(scrollY * speed);
    el.style.transform = \`translateY(\${yPos}px)\`;
  });
}, { passive: true });`,
      content_type: 'code',
      title: 'JavaScript',
      description: 'Vanilla JS parallax scrolling effect — uses data attributes for speed control',
      tags: ['javascript', 'parallax', 'scrolling', 'animation', 'frontend', 'performance'],
      preview_text: 'Parallax scroll animation JavaScript',
      collection_hint: 'boat-project',
      created_at: ts(33),
      updated_at: ts(33),
    },
    {
      content: `export async function fetchWithRetry(url, options = {}, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });
      
      if (!response.ok) throw new Error(\`HTTP \${response.status}\`);
      return await response.json();
    } catch (err) {
      if (i === retries - 1) throw err;
      await new Promise(r => setTimeout(r, Math.pow(2, i) * 1000));
    }
  }
}`,
      content_type: 'code',
      title: 'JavaScript',
      description: 'Fetch with exponential backoff retry — handles failed HTTP requests gracefully',
      tags: ['javascript', 'api', 'fetch', 'networking', 'async', 'error-handling'],
      preview_text: 'fetchWithRetry utility function',
      created_at: ts(5),
      updated_at: ts(5),
    },
    {
      content: `const glassmorphism = {
  background: 'rgba(255, 255, 255, 0.05)',
  backdropFilter: 'blur(20px) saturate(180%)',
  WebkitBackdropFilter: 'blur(20px) saturate(180%)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  borderRadius: '16px',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
};`,
      content_type: 'code',
      title: 'JavaScript/React',
      description: 'Glassmorphism CSS-in-JS style object — frosted glass UI effect',
      tags: ['css', 'glassmorphism', 'design', 'ui', 'react', 'frontend'],
      preview_text: 'Glassmorphism style constants',
      created_at: ts(2),
      updated_at: ts(2),
    },
    {
      content: `// Smooth scroll to element
function scrollToElement(selector, offset = 80) {
  const element = document.querySelector(selector);
  if (!element) return;
  
  const elementPosition = element.getBoundingClientRect().top;
  const offsetPosition = elementPosition + window.pageYOffset - offset;
  
  window.scrollTo({
    top: offsetPosition,
    behavior: 'smooth'
  });
}`,
      content_type: 'code',
      title: 'JavaScript',
      description: 'Smooth scroll to element with offset — pure JavaScript implementation',
      tags: ['javascript', 'scrolling', 'smooth', 'animation', 'navigation', 'frontend'],
      preview_text: 'scrollToElement smooth scroll function',
      collection_hint: 'boat-project',
      created_at: ts(28),
      updated_at: ts(28),
    },
    {
      content: `function debounce(fn, delay) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
}

const debouncedSearch = debounce((query) => {
  performSearch(query);
}, 300);`,
      content_type: 'code',
      title: 'JavaScript',
      description: 'Debounce utility — prevents excessive function calls during rapid input',
      tags: ['javascript', 'performance', 'utility', 'search', 'optimization'],
      preview_text: 'debounce utility function',
      created_at: ts(1),
      updated_at: ts(1),
    },

    // ─── URLS ─────────────────────────────────────────────────────────────
    {
      content: 'https://ui.aceternity.com/components',
      content_type: 'url',
      title: 'Aceternity UI Components',
      description: 'Animated React UI component library — trending modern web components',
      tags: ['design', 'react', 'ui', 'animation', 'components', 'frontend', 'inspiration'],
      source_domain: 'ui.aceternity.com',
      favicon_url: 'https://www.google.com/s2/favicons?domain=ui.aceternity.com&sz=32',
      preview_text: 'ui.aceternity.com/components',
      created_at: ts(31),
      updated_at: ts(31),
    },
    {
      content: 'https://lighthouseconstruction.com',
      content_type: 'url',
      title: 'Lighthouse Construction Co.',
      description: 'Lighthouse Construction Company — commercial and residential contractor website',
      tags: ['lighthouse', 'construction', 'website', 'client', 'contractor'],
      source_domain: 'lighthouseconstruction.com',
      favicon_url: 'https://www.google.com/s2/favicons?domain=lighthouseconstruction.com&sz=32',
      preview_text: 'lighthouseconstruction.com',
      collection_hint: 'lighthouse-construction',
      created_at: ts(12, 2),
      updated_at: ts(12, 2),
    },
    {
      content: 'https://framer.com/motion/',
      content_type: 'url',
      title: 'Framer Motion — React Animation Library',
      description: 'Production-ready animation library for React — smooth spring physics',
      tags: ['react', 'animation', 'motion', 'frontend', 'library', 'framer'],
      source_domain: 'framer.com',
      favicon_url: 'https://www.google.com/s2/favicons?domain=framer.com&sz=32',
      preview_text: 'framer.com/motion',
      collection_hint: 'animation-code',
      created_at: ts(18),
      updated_at: ts(18),
    },
    {
      content: 'https://www.builtatlightspeed.com/',
      content_type: 'url',
      title: 'Built at Lightspeed — Web Inspiration',
      description: 'Curated showcase of beautifully designed websites — web design inspiration gallery',
      tags: ['design', 'inspiration', 'website', 'ui', 'gallery', 'reference'],
      source_domain: 'builtatlightspeed.com',
      favicon_url: 'https://www.google.com/s2/favicons?domain=builtatlightspeed.com&sz=32',
      preview_text: 'builtatlightspeed.com',
      created_at: ts(44),
      updated_at: ts(44),
    },
    {
      content: 'https://www.nautique.com/boats/super-air-nautique-g23',
      content_type: 'url',
      title: 'Nautique G23 — Wake Boat',
      description: 'Nautique Super Air G23 — premium wake and wakeboard boat specifications',
      tags: ['boat', 'marine', 'wake', 'nautique', 'reference', 'product'],
      source_domain: 'nautique.com',
      favicon_url: 'https://www.google.com/s2/favicons?domain=nautique.com&sz=32',
      preview_text: 'nautique.com/super-air-g23',
      collection_hint: 'boat-project',
      created_at: ts(56),
      updated_at: ts(56),
    },
    {
      content: 'https://gsap.com/docs/v3/Plugins/ScrollTrigger/',
      content_type: 'url',
      title: 'GSAP ScrollTrigger Docs',
      description: 'Official GSAP ScrollTrigger plugin documentation — scroll-based animation API',
      tags: ['gsap', 'scrolltrigger', 'animation', 'documentation', 'scrolling', 'frontend'],
      source_domain: 'gsap.com',
      favicon_url: 'https://www.google.com/s2/favicons?domain=gsap.com&sz=32',
      preview_text: 'gsap.com/docs/ScrollTrigger',
      collection_hint: 'animation-code',
      created_at: ts(22),
      updated_at: ts(22),
    },
    {
      content: 'https://www.radix-ui.com/primitives',
      content_type: 'url',
      title: 'Radix UI Primitives',
      description: 'Unstyled, accessible React component primitives for building design systems',
      tags: ['react', 'ui', 'components', 'accessibility', 'design-system', 'frontend'],
      source_domain: 'radix-ui.com',
      favicon_url: 'https://www.google.com/s2/favicons?domain=radix-ui.com&sz=32',
      preview_text: 'radix-ui.com/primitives',
      created_at: ts(9),
      updated_at: ts(9),
    },
    {
      content: 'https://github.com/pmndrs/zustand',
      content_type: 'url',
      title: 'Zustand — State Management',
      description: 'Zustand — small, fast, scalable React state management — GitHub repository',
      tags: ['react', 'state-management', 'github', 'library', 'javascript', 'code'],
      source_domain: 'github.com',
      favicon_url: 'https://www.google.com/s2/favicons?domain=github.com&sz=32',
      preview_text: 'github.com/pmndrs/zustand',
      created_at: ts(4),
      updated_at: ts(4),
    },
    {
      content: 'https://www.awwwards.com/websites/scroll-effects/',
      content_type: 'url',
      title: 'Awwwards — Scroll Effect Sites',
      description: 'Award-winning websites with scroll effects — animation and motion inspiration',
      tags: ['design', 'inspiration', 'animation', 'scrolling', 'website', 'awwwards'],
      source_domain: 'awwwards.com',
      favicon_url: 'https://www.google.com/s2/favicons?domain=awwwards.com&sz=32',
      preview_text: 'awwwards.com/scroll-effects',
      collection_hint: 'boat-project',
      created_at: ts(36),
      updated_at: ts(36),
    },
    {
      content: 'https://supabase.com/docs/reference/javascript/select',
      content_type: 'url',
      title: 'Supabase JS — Select API',
      description: 'Supabase JavaScript client documentation — database query API reference',
      tags: ['supabase', 'database', 'api', 'documentation', 'backend', 'javascript'],
      source_domain: 'supabase.com',
      favicon_url: 'https://www.google.com/s2/favicons?domain=supabase.com&sz=32',
      preview_text: 'supabase.com/docs/reference',
      created_at: ts(6),
      updated_at: ts(6),
    },

    // ─── COLORS ───────────────────────────────────────────────────────────
    {
      content: '#67C7B5',
      content_type: 'color',
      title: 'Seafoam — #67C7B5',
      description: 'Seafoam color — rgb(103, 199, 181) · HSL(172°, 44%, 59%)',
      tags: ['color', 'design', 'seafoam', 'green', 'teal', 'palette'],
      color_hex: '#67C7B5',
      color_name: 'Seafoam',
      preview_text: '#67C7B5 — Seafoam',
      collection_hint: 'design-assets',
      created_at: ts(58),
      updated_at: ts(58),
    },
    {
      content: '#1A1A2E',
      content_type: 'color',
      title: 'Deep Space — #1A1A2E',
      description: 'Deep space dark blue — rgb(26, 26, 46) · Perfect for dark UI backgrounds',
      tags: ['color', 'design', 'dark', 'navy', 'ui', 'background', 'dark-mode'],
      color_hex: '#1A1A2E',
      color_name: 'Deep Space',
      preview_text: '#1A1A2E — Deep Space',
      created_at: ts(15),
      updated_at: ts(15),
    },
    {
      content: '#F59E0B',
      content_type: 'color',
      title: 'Amber — #F59E0B',
      description: 'Amber orange — rgb(245, 158, 11) · Tailwind amber-500 · Warning accent color',
      tags: ['color', 'design', 'amber', 'orange', 'yellow', 'accent', 'tailwind'],
      color_hex: '#F59E0B',
      color_name: 'Amber',
      preview_text: '#F59E0B — Amber',
      created_at: ts(8),
      updated_at: ts(8),
    },
    {
      content: '#6366F1',
      content_type: 'color',
      title: 'Indigo — #6366F1',
      description: 'Indigo — rgb(99, 102, 241) · Tailwind indigo-500 · Perfect primary brand color',
      tags: ['color', 'design', 'indigo', 'purple', 'primary', 'brand', 'tailwind'],
      color_hex: '#6366F1',
      color_name: 'Indigo',
      preview_text: '#6366F1 — Indigo',
      created_at: ts(3, 4),
      updated_at: ts(3, 4),
    },
    {
      content: '#0EA5E9',
      content_type: 'color',
      title: 'Sky Blue — #0EA5E9',
      description: 'Sky blue — rgb(14, 165, 233) · Tailwind sky-500 · Vibrant link and info color',
      tags: ['color', 'design', 'blue', 'sky', 'link', 'info', 'tailwind'],
      color_hex: '#0EA5E9',
      color_name: 'Sky Blue',
      preview_text: '#0EA5E9 — Sky Blue',
      created_at: ts(55),
      updated_at: ts(55),
    },

    // ─── TEXT ─────────────────────────────────────────────────────────────
    {
      content: 'The Lighthouse Construction Company — Building Excellence Since 1987\n\nSpecializing in commercial, residential, and waterfront construction. Licensed, bonded, and insured. Serving the Pacific Northwest.',
      content_type: 'text',
      title: 'Lighthouse Construction — About Text',
      description: 'Company about text for Lighthouse Construction Co. website homepage',
      tags: ['lighthouse', 'construction', 'copy', 'about', 'homepage', 'text'],
      preview_text: 'The Lighthouse Construction Company — Building Excellence Since 1987',
      collection_hint: 'lighthouse-construction',
      created_at: ts(12, 1),
      updated_at: ts(12, 1),
    },
    {
      content: 'Explore the open water from a new perspective. The 2024 Nautique G23 delivers world-class wake performance with unmatched luxury. Feel the power. Own the moment.',
      content_type: 'text',
      title: 'Nautique G23 — Marketing Copy',
      description: 'Product marketing copy for Nautique G23 wake boat — used for boat project',
      tags: ['boat', 'marine', 'wake', 'nautique', 'copy', 'marketing'],
      preview_text: 'Explore the open water from a new perspective...',
      collection_hint: 'boat-project',
      created_at: ts(48),
      updated_at: ts(48),
    },
    {
      content: 'Mike Thompson\nSenior Project Manager\nLighthouse Construction Co.\nOffice: (503) 847-2291\nMobile: (503) 612-7834\nmike.thompson@lighthouseconstruction.com',
      content_type: 'text',
      title: 'Mike Thompson — Contact Card',
      description: 'Contact information for Mike Thompson at Lighthouse Construction',
      tags: ['contact', 'lighthouse', 'construction', 'person', 'project-manager'],
      preview_text: 'Mike Thompson — Lighthouse Construction',
      collection_hint: 'lighthouse-construction',
      created_at: ts(11),
      updated_at: ts(11),
    },
    {
      content: 'URGENT: Deck materials delayed until Thursday. Moving site inspection to Friday 2pm. All contractors must update schedules. Contact foreman Jake at (503) 881-4423.',
      content_type: 'text',
      title: 'Construction Update Note',
      description: 'Internal project update about deck material delay and schedule change',
      tags: ['construction', 'project', 'note', 'update', 'lighthouse'],
      preview_text: 'URGENT: Deck materials delayed until Thursday...',
      collection_hint: 'lighthouse-construction',
      created_at: ts(10),
      updated_at: ts(10),
    },
    {
      content: 'Fontaine — Boat Interior Design inspiration\n\n- Cream and cognac leather seating\n- Teak wood flooring\n- Brushed chrome hardware\n- Ambient LED underglow\n- Custom upholstered bow area',
      content_type: 'text',
      title: 'Boat Interior Design Notes',
      description: 'Design notes for boat interior — materials, finishes, and color palette',
      tags: ['boat', 'design', 'interior', 'inspiration', 'material', 'notes'],
      preview_text: 'Boat interior design inspiration notes',
      collection_hint: 'boat-project',
      created_at: ts(52),
      updated_at: ts(52),
    },
    {
      content: `Typography System:
Heading: "Inter" 700, -0.02em tracking
Body: "Inter" 400, 1.6 line-height
Mono: "JetBrains Mono" 500
Scale: 12 / 14 / 16 / 18 / 24 / 32 / 48 / 64px
`,
      content_type: 'text',
      title: 'Typography System Notes',
      description: 'Design system typography specification — font, size, weight, and spacing',
      tags: ['design', 'typography', 'font', 'system', 'ui', 'inter'],
      preview_text: 'Typography design system specification',
      created_at: ts(2, 3),
      updated_at: ts(2, 3),
    },
    {
      content: 'Meeting Notes — Boat Website Project\n\n• Hero: full-bleed video of wake boat at golden hour\n• Scroll-triggered reveal of features\n• Water/wave particle animation in background\n• Color: deep navy + seafoam green (#67C7B5)\n• Mobile-first, 60fps animations\n• Launch: 3 weeks',
      content_type: 'text',
      title: 'Boat Website — Meeting Notes',
      description: 'Meeting notes for boat website project — design direction and requirements',
      tags: ['boat', 'website', 'design', 'project', 'notes', 'animation', 'meeting'],
      preview_text: 'Boat website project meeting notes',
      collection_hint: 'boat-project',
      created_at: ts(62),
      updated_at: ts(62),
    },
    {
      content: 'Premium maritime lifestyle. Where performance meets elegance on the water.',
      content_type: 'text',
      title: 'Marine Brand Tagline',
      description: 'Brand tagline for marine/boat client — premium lifestyle positioning',
      tags: ['boat', 'brand', 'tagline', 'copy', 'marketing', 'marine'],
      preview_text: 'Premium maritime lifestyle tagline',
      collection_hint: 'boat-project',
      created_at: ts(47),
      updated_at: ts(47),
    },
    {
      content: 'Shipping Address:\n1847 Harbor View Drive\nPortland, OR 97201\nUnited States',
      content_type: 'text',
      title: 'Harbor View Shipping Address',
      description: 'Shipping address on Harbor View Drive, Portland',
      tags: ['address', 'shipping', 'contact', 'portland'],
      preview_text: '1847 Harbor View Drive, Portland, OR',
      created_at: ts(16),
      updated_at: ts(16),
    },
    {
      content: '~/Documents/Projects/Boat-Website\n~/Desktop/LighthouseAssets\n~/Downloads/nautique-specs-2024.pdf',
      content_type: 'text',
      title: 'Project File Paths',
      description: 'Local file system paths for active projects',
      tags: ['paths', 'files', 'project', 'boat', 'lighthouse'],
      preview_text: 'Project file paths',
      created_at: ts(0, 6),
      updated_at: ts(0, 6),
    },

    // ─── EMAILS ───────────────────────────────────────────────────────────
    {
      content: 'mike.thompson@lighthouseconstruction.com',
      content_type: 'email',
      title: 'mike.thompson@lighthouseconstruction.com',
      description: 'Email address for Mike Thompson at Lighthouse Construction',
      tags: ['email', 'contact', 'lighthouse', 'construction'],
      preview_text: 'mike.thompson@lighthouseconstruction.com',
      collection_hint: 'lighthouse-construction',
      created_at: ts(12, 3),
      updated_at: ts(12, 3),
    },
    {
      content: 'sarah.chen@nautiquedesign.co',
      content_type: 'email',
      title: 'sarah.chen@nautiquedesign.co',
      description: 'Email for Sarah Chen at Nautique Design — boat design contact',
      tags: ['email', 'contact', 'boat', 'design'],
      preview_text: 'sarah.chen@nautiquedesign.co',
      collection_hint: 'boat-project',
      created_at: ts(50),
      updated_at: ts(50),
    },
    {
      content: 'hello@raycast.com',
      content_type: 'email',
      title: 'hello@raycast.com',
      description: 'Raycast general contact email',
      tags: ['email', 'contact', 'raycast', 'productivity'],
      preview_text: 'hello@raycast.com',
      created_at: ts(20),
      updated_at: ts(20),
    },
    {
      content: 'design@linearapp.com',
      content_type: 'email',
      title: 'design@linearapp.com',
      description: 'Linear design team contact email',
      tags: ['email', 'contact', 'linear', 'design'],
      preview_text: 'design@linearapp.com',
      created_at: ts(25),
      updated_at: ts(25),
    },
    {
      content: 'contractors@lighthouseconstruction.com',
      content_type: 'email',
      title: 'contractors@lighthouseconstruction.com',
      description: 'Lighthouse Construction contractors department email',
      tags: ['email', 'contact', 'lighthouse', 'construction', 'contractors'],
      preview_text: 'contractors@lighthouseconstruction.com',
      collection_hint: 'lighthouse-construction',
      created_at: ts(11, 4),
      updated_at: ts(11, 4),
    },

    // ─── PHONE NUMBERS ─────────────────────────────────────────────────────
    {
      content: '(503) 847-2291',
      content_type: 'phone',
      title: '(503) 847-2291',
      description: 'Lighthouse Construction — main office phone number',
      tags: ['phone', 'contact', 'lighthouse', 'construction'],
      preview_text: '(503) 847-2291',
      collection_hint: 'lighthouse-construction',
      created_at: ts(12, 5),
      updated_at: ts(12, 5),
    },
    {
      content: '(503) 612-7834',
      content_type: 'phone',
      title: '(503) 612-7834',
      description: "Mike Thompson's mobile number — Lighthouse Construction project manager",
      tags: ['phone', 'contact', 'lighthouse', 'mobile'],
      preview_text: '(503) 612-7834 — Mike mobile',
      collection_hint: 'lighthouse-construction',
      created_at: ts(12, 4),
      updated_at: ts(12, 4),
    },
    {
      content: '+1 (206) 344-8820',
      content_type: 'phone',
      title: '+1 (206) 344-8820',
      description: 'Sarah Chen at Nautique Design — boat project contact',
      tags: ['phone', 'contact', 'boat', 'marine'],
      preview_text: '+1 (206) 344-8820 — Sarah Chen',
      collection_hint: 'boat-project',
      created_at: ts(50, 2),
      updated_at: ts(50, 2),
    },
    {
      content: '1-800-GO-GSAP1',
      content_type: 'phone',
      title: '1-800-GO-GSAP1',
      description: 'GSAP support hotline number',
      tags: ['phone', 'gsap', 'support', 'animation'],
      preview_text: '1-800-GO-GSAP1',
      created_at: ts(30),
      updated_at: ts(30),
    },
    {
      content: '(971) 220-4567',
      content_type: 'phone',
      title: '(971) 220-4567',
      description: 'Jake the foreman — Lighthouse Construction site supervisor',
      tags: ['phone', 'contact', 'lighthouse', 'construction', 'foreman'],
      preview_text: '(971) 220-4567 — Jake foreman',
      collection_hint: 'lighthouse-construction',
      created_at: ts(10, 2),
      updated_at: ts(10, 2),
    },

    // ─── AI PROMPTS ────────────────────────────────────────────────────────
    {
      content: 'Create a cinematic video of a green wake boat speeding across a pristine blue lake at golden hour. Low angle shot from the water, spray catching the warm sunlight, dramatic wake behind the vessel. 4K, photorealistic, film grain.',
      content_type: 'prompt',
      title: 'AI Prompt — Wake Boat Video Generation',
      description: 'Video generation prompt for cinematic wake boat footage at golden hour',
      tags: ['prompt', 'ai', 'video-generation', 'boat', 'marine', 'cinematic'],
      preview_text: 'Video prompt: cinematic wake boat at golden hour',
      collection_hint: 'boat-project',
      created_at: ts(40),
      updated_at: ts(40),
    },
    {
      content: `You are a senior frontend developer and UI/UX expert. Analyze the following design specification and generate a complete, production-ready React component with:
- TypeScript types
- Framer Motion animations
- Accessible markup (ARIA attributes)
- Responsive CSS
- Dark mode support

Design spec: [paste design here]`,
      content_type: 'prompt',
      title: 'AI Prompt — React Component Generator',
      description: 'System prompt for generating production-ready React components with animations',
      tags: ['prompt', 'ai', 'code-generation', 'react', 'frontend', 'design'],
      preview_text: 'You are a senior frontend developer...',
      collection_hint: 'ai-prompts',
      created_at: ts(19),
      updated_at: ts(19),
    },
    {
      content: 'Write compelling website copy for a luxury construction company called Lighthouse Construction. Tone: authoritative, trustworthy, premium. Include: hero headline, value proposition, 3 key services, testimonial placeholder, CTA. Keep it concise and conversion-focused.',
      content_type: 'prompt',
      title: 'AI Prompt — Lighthouse Construction Copy',
      description: 'ChatGPT prompt for generating Lighthouse Construction website copy',
      tags: ['prompt', 'ai', 'copy', 'lighthouse', 'construction', 'marketing'],
      preview_text: 'Write copy for Lighthouse Construction website...',
      collection_hint: 'lighthouse-construction',
      created_at: ts(13),
      updated_at: ts(13),
    },
    {
      content: 'Generate a modern, premium website color palette for a marine lifestyle brand. Must include: primary color (deep navy or teal), accent color (gold or seafoam), neutral colors (cream, slate), and semantic colors (error, success). Provide hex codes and usage context for each.',
      content_type: 'prompt',
      title: 'AI Prompt — Brand Color Palette',
      description: 'Prompt for generating a marine lifestyle brand color palette with hex codes',
      tags: ['prompt', 'ai', 'design', 'color', 'palette', 'brand', 'marine', 'boat'],
      preview_text: 'Generate a marine lifestyle brand color palette...',
      collection_hint: 'boat-project',
      created_at: ts(60),
      updated_at: ts(60),
    },
    {
      content: 'Act as an expert in scroll-based web animations. I want to create a website where sections reveal as the user scrolls, with parallax effects and smooth transitions between scenes. The theme is a premium wake boat brand. Suggest the best animation approach: GSAP ScrollTrigger, Framer Motion, or CSS scroll animations. Explain tradeoffs and provide starter code.',
      content_type: 'prompt',
      title: 'AI Prompt — Scroll Animation Consultation',
      description: 'Consultation prompt comparing scroll animation libraries for boat brand website',
      tags: ['prompt', 'ai', 'animation', 'scrolling', 'gsap', 'frontend', 'boat'],
      preview_text: 'Act as an expert in scroll-based animations...',
      collection_hint: 'boat-project',
      created_at: ts(23),
      updated_at: ts(23),
    },

    // ─── FILE REFERENCES ───────────────────────────────────────────────────
    {
      content: 'nautique-g23-specs-2024.pdf',
      content_type: 'text',
      title: '📄 nautique-g23-specs-2024.pdf',
      description: 'Nautique G23 technical specifications PDF — downloaded from manufacturer',
      tags: ['file', 'pdf', 'boat', 'nautique', 'specs', 'marine'],
      preview_text: 'nautique-g23-specs-2024.pdf',
      collection_hint: 'boat-project',
      created_at: ts(55),
      updated_at: ts(55),
    },
    {
      content: 'lighthouse-construction-logo-v3.ai',
      content_type: 'text',
      title: '🎨 lighthouse-construction-logo-v3.ai',
      description: 'Adobe Illustrator file — Lighthouse Construction logo version 3',
      tags: ['file', 'illustrator', 'logo', 'lighthouse', 'construction', 'design'],
      preview_text: 'Lighthouse Construction logo .ai file',
      collection_hint: 'lighthouse-construction',
      created_at: ts(12, 6),
      updated_at: ts(12, 6),
    },
    {
      content: 'boat-website-wireframes.fig',
      content_type: 'text',
      title: '📐 boat-website-wireframes.fig',
      description: 'Figma file — boat website wireframes and design mockups',
      tags: ['file', 'figma', 'design', 'wireframes', 'boat', 'website'],
      preview_text: 'boat-website-wireframes.fig',
      collection_hint: 'boat-project',
      created_at: ts(59),
      updated_at: ts(59),
    },
    {
      content: 'animation-references-moodboard.zip',
      content_type: 'text',
      title: '📦 animation-references-moodboard.zip',
      description: 'ZIP archive of animation reference videos and moodboard images',
      tags: ['file', 'zip', 'animation', 'moodboard', 'reference', 'design'],
      preview_text: 'animation-references-moodboard.zip',
      collection_hint: 'animation-code',
      created_at: ts(35),
      updated_at: ts(35),
    },
    {
      content: 'construction-contract-2024-signed.pdf',
      content_type: 'text',
      title: '📄 construction-contract-2024-signed.pdf',
      description: 'Signed construction contract PDF for Lighthouse Construction project 2024',
      tags: ['file', 'pdf', 'contract', 'lighthouse', 'construction', 'legal'],
      preview_text: 'Signed construction contract 2024',
      collection_hint: 'lighthouse-construction',
      created_at: ts(13, 7),
      updated_at: ts(13, 7),
    },
  ];

  // Insert all items and track IDs
  const itemIds = {};
  
  for (const item of items) {
    const stored = insertItem({
      ...item,
    });
    if (stored) {
      // Manually update timestamps after insert using sql.js
      const { getDb } = require('./database');
      const sqlDb = getDb();
      if (sqlDb && item.created_at) {
        sqlDb.run(
          'UPDATE clipboard_items SET created_at = ?, updated_at = ? WHERE id = ?',
          [item.created_at, item.updated_at || item.created_at, stored.id]
        );
      }
      
      if (item.collection_hint) {
        if (!itemIds[item.collection_hint]) itemIds[item.collection_hint] = [];
        itemIds[item.collection_hint].push(stored.id);
      }
    }
  }

  // ─── Create Collections ──────────────────────────────────────────────────

  const collectionsData = [
    {
      key: 'lighthouse-construction',
      name: 'Lighthouse Construction',
      description: 'All clipboard memories related to the Lighthouse Construction website project',
      icon: '🏗️',
      color: '#F59E0B',
      isAuto: true,
    },
    {
      key: 'boat-project',
      name: 'Boat Website',
      description: 'Wake boat brand website — design, code, assets, and inspiration',
      icon: '⛵',
      color: '#67C7B5',
      isAuto: true,
    },
    {
      key: 'animation-code',
      name: 'Animation & Scroll',
      description: 'Scroll animation libraries, GSAP code, and motion design resources',
      icon: '✨',
      color: '#6366F1',
      isAuto: true,
    },
    {
      key: 'ai-prompts',
      name: 'AI Prompts',
      description: 'Saved prompts for ChatGPT, Claude, Midjourney, and other AI tools',
      icon: '🤖',
      color: '#0EA5E9',
      isAuto: true,
    },
    {
      key: 'design-assets',
      name: 'Design Assets',
      description: 'Colors, typography, and design system references',
      icon: '🎨',
      color: '#EC4899',
      isAuto: true,
    },
  ];

  for (const col of collectionsData) {
    const colId = createCollection(col.name, col.description, col.icon, col.color, col.isAuto);
    const ids = itemIds[col.key] || [];
    for (const itemId of ids) {
      addToCollection(colId, itemId);
    }
  }

  // Build the search index
  buildIndex();

  console.log(`Demo data seeded: ${items.length} items, ${collectionsData.length} collections`);
}

module.exports = { seedDemoData };
