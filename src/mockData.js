/**
 * Mock Data for Web Browser Preview Fallback
 */

export const mockItems = [
  {
    id: 'mock-code-1',
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
    created_at: Date.now() - 21 * 24 * 60 * 60 * 1000,
    use_count: 3,
    is_favorite: false,
  },
  {
    id: 'mock-code-2',
    content: `const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });`,
    content_type: 'code',
    title: 'JavaScript/Three.js',
    description: 'Three.js 3D scene code — WebGL renderer setup with animated cube',
    tags: ['javascript', 'three.js', '3d', 'webgl', 'animation', 'frontend'],
    created_at: Date.now() - 45 * 24 * 60 * 60 * 1000,
    use_count: 1,
    is_favorite: true,
  },
  {
    id: 'mock-code-3',
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
}`,
    content_type: 'code',
    title: 'CSS',
    description: 'CSS animation — smooth slide-up with blur reveal keyframe',
    tags: ['css', 'animation', 'keyframes', 'frontend', 'smooth'],
    created_at: Date.now() - 14 * 24 * 60 * 60 * 1000,
    use_count: 8,
    is_favorite: false,
  },
  {
    id: 'mock-url-1',
    content: 'https://ui.aceternity.com/components',
    content_type: 'url',
    title: 'Aceternity UI Components',
    description: 'Animated React UI component library — trending modern web components',
    tags: ['design', 'react', 'ui', 'animation', 'components', 'frontend', 'inspiration'],
    source_domain: 'ui.aceternity.com',
    favicon_url: 'https://www.google.com/s2/favicons?domain=ui.aceternity.com&sz=32',
    created_at: Date.now() - 31 * 24 * 60 * 60 * 1000,
    use_count: 5,
    is_favorite: false,
  },
  {
    id: 'mock-url-2',
    content: 'https://lighthouseconstruction.com',
    content_type: 'url',
    title: 'Lighthouse Construction Co.',
    description: 'Lighthouse Construction Company — commercial and residential contractor website',
    tags: ['lighthouse', 'construction', 'website', 'client', 'contractor'],
    source_domain: 'lighthouseconstruction.com',
    favicon_url: 'https://www.google.com/s2/favicons?domain=lighthouseconstruction.com&sz=32',
    created_at: Date.now() - 12 * 24 * 60 * 60 * 1000,
    use_count: 2,
    is_favorite: true,
  },
  {
    id: 'mock-color-1',
    content: '#67C7B5',
    content_type: 'color',
    title: 'Seafoam — #67C7B5',
    description: 'Seafoam color — rgb(103, 199, 181) · HSL(172°, 44%, 59%)',
    tags: ['color', 'design', 'seafoam', 'green', 'teal', 'palette'],
    color_hex: '#67C7B5',
    color_name: 'Seafoam',
    created_at: Date.now() - 58 * 24 * 60 * 60 * 1000,
    use_count: 14,
    is_favorite: true,
  },
  {
    id: 'mock-color-2',
    content: '#1A1A2E',
    content_type: 'color',
    title: 'Deep Space — #1A1A2E',
    description: 'Deep space dark blue — rgb(26, 26, 46) · Perfect for dark UI backgrounds',
    tags: ['color', 'design', 'dark', 'navy', 'ui', 'background', 'dark-mode'],
    color_hex: '#1A1A2E',
    color_name: 'Deep Space',
    created_at: Date.now() - 15 * 24 * 60 * 60 * 1000,
    use_count: 4,
    is_favorite: false,
  },
  {
    id: 'mock-text-1',
    content: 'Mike Thompson\nSenior Project Manager\nLighthouse Construction Co.\nOffice: (503) 847-2291\nMobile: (503) 612-7834\nmike.thompson@lighthouseconstruction.com',
    content_type: 'text',
    title: 'Mike Thompson — Contact Card',
    description: 'Contact information for Mike Thompson at Lighthouse Construction',
    tags: ['contact', 'lighthouse', 'construction', 'person', 'project-manager'],
    created_at: Date.now() - 11 * 24 * 60 * 60 * 1000,
    use_count: 2,
    is_favorite: false,
  },
  {
    id: 'mock-text-2',
    content: 'Explore the open water from a new perspective. The 2024 Nautique G23 delivers world-class wake performance with unmatched luxury.',
    content_type: 'text',
    title: 'Nautique G23 — Marketing Copy',
    description: 'Product marketing copy for Nautique G23 wake boat — used for boat project',
    tags: ['boat', 'marine', 'wake', 'nautique', 'copy', 'marketing'],
    created_at: Date.now() - 48 * 24 * 60 * 60 * 1000,
    use_count: 1,
    is_favorite: false,
  },
  {
    id: 'mock-prompt-1',
    content: 'Create a cinematic video of a green wake boat speeding across a pristine blue lake at golden hour. Low angle shot from the water, spray catching the warm sunlight, dramatic wake behind the vessel. 4K, photorealistic, film grain.',
    content_type: 'prompt',
    title: 'AI Prompt — Wake Boat Video Generation',
    description: 'Video generation prompt for cinematic wake boat footage at golden hour',
    tags: ['prompt', 'ai', 'video-generation', 'boat', 'marine', 'cinematic'],
    created_at: Date.now() - 40 * 24 * 60 * 60 * 1000,
    use_count: 6,
    is_favorite: false,
  },
  {
    id: 'mock-file-1',
    content: 'nautique-g23-specs-2024.pdf',
    content_type: 'text',
    title: '📄  nautique-g23-specs-2024.pdf',
    description: 'Nautique G23 technical specifications PDF — downloaded from manufacturer',
    tags: ['file', 'pdf', 'boat', 'nautique', 'specs', 'marine'],
    created_at: Date.now() - 55 * 24 * 60 * 60 * 1000,
    use_count: 1,
    is_favorite: false,
  }
];

export const mockCollections = [
  {
    id: 'c1',
    name: 'Lighthouse Construction',
    icon: '🏗️',
    color: '#F59E0B',
    is_auto: true,
    description: 'All clipboard memories related to the Lighthouse Construction website project',
    count: 14,
    items: mockItems.filter(i => i.tags.includes('lighthouse')),
  },
  {
    id: 'c2',
    name: 'Boat Website',
    icon: '⛵',
    color: '#67C7B5',
    is_auto: true,
    description: 'Wake boat brand website — design, code, assets, and inspiration',
    count: 18,
    items: mockItems.filter(i => i.tags.includes('boat')),
  },
  {
    id: 'c3',
    name: 'Animation & Scroll',
    icon: '✨',
    color: '#6366F1',
    is_auto: true,
    description: 'Scroll animation libraries, GSAP code, and motion design resources',
    count: 8,
    items: mockItems.filter(i => i.tags.includes('animation')),
  },
  {
    id: 'c4',
    name: 'AI Prompts',
    icon: '🤖',
    color: '#0EA5E9',
    is_auto: true,
    description: 'Saved prompts for ChatGPT, Claude, Midjourney, and other AI tools',
    count: 5,
    items: mockItems.filter(i => i.tags.includes('prompt')),
  },
];
