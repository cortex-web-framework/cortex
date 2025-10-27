# Modern Web Framework Landing Page Analysis

Comprehensive research of landing page design patterns from Next.js, SvelteKit, Remix, Astro, and htmx.

## Table of Contents
1. [Next.js](#nextjs)
2. [SvelteKit/Svelte](#sveltekit)
3. [Remix](#remix)
4. [Astro](#astro)
5. [htmx](#htmx)
6. [Comparative Analysis](#comparative-analysis)

---

## Next.js

### 1. Hero Section Structure
- **Headline:** "The React Framework for the Web"
- **Subheadline:** "Used by some of the world's largest companies, Next.js enables you to create high-quality web applications with the power of React components."
- **CTA Layout:**
  - Primary: "Get Started" → `/docs`
  - Secondary: "Learn Next.js" → `/learn`
  - Both buttons placed horizontally below subheadline
- **Code Display:** Terminal command `▲ ~ npx create-next-app@latest` with dark background
- **Visuals:**
  - Announcement badge ("New") linking to Next.js Conf 25
  - YouTube recap video embed with dark/light mode poster images
  - Gradient text treatment on headline

### 2. Navigation Design
- **Type:** Sticky header that persists on scroll
- **Desktop Structure:**
  - Logo (Next.js with uwu logo variant available)
  - Menu items: Showcase, Docs, Blog, Templates, Enterprise
  - Search bar with "Search documentation..." placeholder and ⌘K shortcut indicator
  - Deploy button (links to Vercel)
  - Learn link
- **Secondary Banner:** Conf 25 announcement with "Find out more" and "Watch the recap" CTAs
- **Mobile:** Not explicitly detailed but responsive classes present

### 3. Color Schemes and Typography
**Colors:**
- Theme System: Light/dark modes via `zeit-theme` localStorage key
- Background: White (#fff) in light mode, Black (#000) in dark mode
- Text: Inverted based on theme
- Accent: Blue tones for buttons and interactive elements
- Links: Styled with underline and offset decoration
- CSS Variables: `--geist-foreground`, `--geist-page-width-with-margin`, `--geist-page-margin`

**Typography:**
- Monospace: `geist_mono_98cac566-module__bcNCwW__variable`
- Default: `geist_1620151b-module__2VSEvG__variable` (Geist sans-serif)
- Main heading: "gradient-text" class for hero
- Section headings: h2 tags
- Labels: "text-label-14 font-medium" for badges

### 4. Feature Showcase Methodology
**Section Title:** "What's in Next.js?"
**Subtitle:** "Everything you need to build great products on the web."

**Layout:** Responsive grid system with `data-columns` attribute:
- 3 columns (desktop)
- 2 columns (tablet)
- 1 column (mobile)

**Features as Interactive Cards:**
- Data Fetching (Async/await React components)
- Server Actions (Server code execution without API layer)
- Advanced Routing (File-system based with nested layouts)
- CSS Support (Modules, Tailwind, community libraries)
- Route Handlers (API endpoint creation)
- Middleware (Request control and access rules)
- React Server Components (Zero additional client-side JS) - **Featured callout card with 3D connected spheres illustration**
- Client/Server Rendering (ISR and flexible caching)

**Visual Treatment:**
- Minimal cards for standard features
- Larger callout cards for emphasized features
- All cards are clickable links to documentation
- Light/dark variants of illustrations

### 5. Social Proof Elements
**Testimonials Format:**
1. **Notion:**
   - Metric: "0.09 or lower for Cumulative Layout Shift"
   - Attribution: Senior Software Engineer, Frontend
   - Format: Quote with company name and role

2. **Adobe/Frame.io:**
   - Metric: "UI responds to user input within 100ms and all animations run at a consistent 60fps"
   - Attribution: Charlton Roberts, Product Engineering

3. **Agency Testimonial:**
   - Quote: "Next.js has been a game-changer for our agency work and team collaboration..."
   - Attribution: Daniel Lopes, Frontend Developer

**Company Logos:**
- Placement: Carousel with mobile/desktop variants
- Companies: Audible, Sonos, Dice, Notion, Today, ProductHunt, Nike, Washington Post
- Style: Grayscale/monochrome treatment

### 6. Code Example Showcase
- **Hero Display:** Command-line snippet in dark terminal style
- **Format:** Simple text with command prompt indicator
- **Syntax Highlighting:** Not extensively used on landing page
- **Copy Button:** Not explicitly visible
- **Context:** SWC-based compilation referenced

### 7. Community/Contribution Section Structure
**Resources Section:**
- Docs, Support Policy, Learn, Showcase, Blog, Team
- Analytics, Next.js Conf, Previews, Evals

**More Section:**
- Next.js Commerce, Contact Sales, Community, GitHub, Releases, Telemetry, Governance

**Social Links:** GitHub, X (Twitter), Bluesky (footer placement)

### 8. Call-to-Action Placement and Design Patterns
1. **Hero:** Dual CTA buttons (primary/secondary styling)
2. **Announcement Banner:** Two CTAs for conference content
3. **Feature Cards:** All cards are interactive links
4. **Templates Section:** "Deploy a Template on Vercel"
5. **Footer:** Newsletter subscription
6. **Throughout:** Multiple internal/external documentation links

**Design Pattern:** Progressive engagement - from quick start to detailed documentation

### 9. Performance Metrics Displayed
- **Notion Case Study:** "0.09 or lower for Cumulative Layout Shift" (Core Web Vitals)
- **Frame.io Case Study:** "100ms user input response, 60fps animations"
- **Infrastructure:** Turbopack (Rust-based, incremental bundler), SWC (Speedy Web Compiler)

### 10. Interactive Elements and Animations
**Animations:**
- Theme toggle with class-based switching (`.uwu-hidden`, `.uwu-flex`)
- Loading UI with React Suspense integration
- Performance tracking via `requestAnimationFrame`
- Bot detection script for analytics

**Interactive Features:**
- Command palette (Cmdk component) with ⌘K shortcut
- Prefetch cross-zone links
- Cookie preference modal
- Newsletter form submission
- Theme switcher component

**Hover Effects:**
- Links: Opacity transitions (200ms duration, 70% opacity on hover)
- Smooth transitions throughout

### 11. Accessibility Features Visible
- Skip navigation link: "Skip to content" (#geist-skip-nav)
- `aria-label` attributes on social links and semantic elements
- `role="img"` for SVG logos
- `tabIndex=-1` for skip nav
- ARIA labels on buttons and interactive components
- Semantic HTML (nav, main, footer, h1-h4 hierarchy)
- Keyboard shortcut support (⌘K for search)

### 12. Mobile Responsiveness Approach
- Utility classes: `max-md:px-8` for mobile padding
- Grid layouts adapt: 3 columns → 2 columns → 1 column
- Mobile-specific carousel for company logos
- Touch-friendly spacing and button sizes
- Newsletter form optimized for smaller screens

### 13. Footer and Secondary Navigation
**Layout:** Responsive footer grid with sections:

**Resources:**
- Docs, Support, Learn, Showcase, Blog, Team
- Analytics, Conf, Previews, Evals

**More:**
- Commerce, Sales Contact, Community, GitHub, Releases, Telemetry, Governance

**About Vercel:**
- Next.js + Vercel, OSS, GitHub, Bluesky, X

**Legal:**
- Privacy Policy, Cookie Preferences

**Newsletter:**
- Subscription form with email input

**Copyright:** "© 2025 Vercel, Inc."

**Vercel Logo:** SVG logotype included

### 14. SEO Elements
- Semantic HTML structure
- Proper heading hierarchy (h1-h4)
- Meta information integrated
- Performance optimization for Core Web Vitals
- Dynamic HTML streaming
- Automatic optimizations for images/fonts/scripts

---

## SvelteKit/Svelte

### 1. Hero Section Structure
- **Headline:** "Svelte" (large display text)
- **Subheadline:** "web development for the rest of us"
- **CTA:** "get started" → `/docs`
- **Visuals:**
  - Machine illustration showing compiler packaging component code
  - SVG graphic: pronunciation guide "attractively thin, graceful and stylish"
- **Design:** Minimal, illustration-focused approach

### 2. Navigation Design
- **Type:** Static positioning with skip-to-content link
- **Desktop Items:**
  - Docs (dropdown: Svelte/SvelteKit/CLI/MCP)
  - Tutorial
  - Packages
  - Playground
  - Blog
- **Right-aligned:** Social icons (Chat, Bluesky, GitHub)
- **Font System:** Class-based via localStorage (elegant or default variant)

### 3. Color Schemes and Typography
**Colors:**
- Theme: Light/dark mode via `prefers-color-scheme` media query
- Storage: `localStorage.get('sv:theme')`
- Text: `currentColor` inheritance for SVG strokes
- Responsive: System scrollbar visibility detection for styling

**Typography:**
- Font system: CSS class-based `font-${variant}` applied to documentElement
- SVG styling: Stroke-based, 2px width, rounded caps/joins
- Languages emphasized: HTML/CSS/JavaScript

### 4. Feature Showcase Methodology
**Title:** "used by companies you've heard of"

**Format:** Logo grid display
- **Companies:** Spotify, Stack Overflow, New York Times, IKEA, Square, Apple, Mullvad, Yelp, Decathlon, 1Password
- **Style:** Grayscale SVG logos
- **Layout:** Grid or inline display
- **Treatment:** Simple, clean presentation without feature cards

### 5. Social Proof Elements
**Developer Surveys:**
- Stack Overflow 2024
- State of JS 2024
- Links to survey results

**Testimonials:**
- Tweet from Flavio Copes (light/dark variants)

**Company Logos:**
- Nine major tech/media brands
- Prominent placement emphasizing adoption

### 6. Code Example Showcase
- **Approach:** Concept-focused rather than code-heavy on landing page
- **Tutorial Link:** Separate section for hands-on learning
- **Playground:** Dedicated environment for code experimentation

### 7. Community/Contribution Section Structure
**Title:** "join our friendly community"

**Content:**
- Svelte Society sister organization (global events)
- Discord server link (`/chat`)
- Photo attribution: Marcel Cutts (2022 Summit Stockholm)

**Support:**
- Backed by Vercel
- Community donors
- Full-time/part-time maintainers (50+ GitHub contributors)
- 40+ sponsor organizations via OpenCollective

### 8. Call-to-Action Placement and Design Patterns
1. Hero: "get started" → `/docs`
2. Survey links (external engagement)
3. Tweet engagement link
4. Discord link (`/chat`)
5. Documentary CTA: "Watch the full Svelte Origins documentary"

**Pattern:** Community-focused, story-driven engagement

### 9. Performance Metrics Displayed
- **Focus:** Developer satisfaction over benchmarks
- **Survey Results:** Referenced but not quantified on page
- **Philosophy:** Emphasis on developer experience

### 10. Interactive Elements and Animations
- Theme toggle: System preference detection with localStorage override
- Scrollbar detection: Dynamic class application (`scrollbars-visible`/`scrollbars-invisible`)
- Video controls: Play/pause, mute/unmute, subtitles (SVG icons)
- Tooltip accessibility: Subtitle toggle functionality

### 11. Accessibility Features Visible
- Skip-to-main-content link
- ARIA-compliant video player controls
- Semantic HTML structure
- High contrast SVG elements
- Dark/light mode preference support
- Keyboard navigation support

### 12. Mobile Responsiveness Approach
- SvelteKit routing system
- Class-based responsive styling
- Adaptive navigation (implied through structure)
- Touch-friendly interactions

### 13. Footer and Secondary Navigation
**Copyright:** "© 2025 Svelte contributors"
**License:** MIT (open source software)

**Maintainers:**
- 50+ GitHub contributors with profile links

**Sponsors:**
- 40+ organizations via OpenCollective
- Prominent: Vercel, Sanity, Frontend Masters

### 14. SEO Elements
- Built with SvelteKit (self-hosting)
- Dynamic imports for app initialization
- LocalStorage-based preferences (font, theme, legacy features)
- Responsive video player with accessibility controls

---

## Remix

### 1. Hero Section Structure
- **Headline:** "Welcome to Remix"
- **Subheadline:** "Focused on web standards and modern web app UX, you're simply going to build better websites"
- **CTAs:**
  - Primary: "Get Started" → `/docs/start/quickstart`
  - Secondary: "Read the Docs" → `/docs`
- **Visuals:** Code snippet showing loader/action pattern with React component example
- **Layout:** Code-forward presentation

### 2. Navigation Design
- **Type:** Static header
- **Items:** Docs, Blog, Jam (/jam/2025), Store (shop.remix.run)
- **Style:** Minimal and clean
- **Responsive:** Navigation duplicated in markup for mobile/desktop

### 3. Color Schemes and Typography
**Colors:**
- Base colors: CSS variable-based (`--base05` through `--base0E`)
- Syntax highlighting: Base16 color scheme
- Primary accent: Blue/cyan tones
- Keywords: Purple
- Strings: Orange
- Text: Dark base colors

**Typography:**
- Code blocks: Monospace with line numbers
- Headings: Sans-serif (specific family not disclosed)
- Body text: Standard sans-serif

### 4. Feature Showcase Methodology
**Nested Routes:**
- Interactive diagram showing hierarchy (Root > Sales > Invoices > Invoice)
- Hover/tap interaction reveals related UI components
- Dashboard mockup with invoice list and monetary values

**Loading States:**
- Side-by-side comparison: "Without Remix" vs "With Remix"
- Waterfall diagram showing request patterns
- Demonstrates parallel data loading advantage

**Prefetching:**
- Visual showing prefetch tags
- Parallel asset loading example
- Modules and CSS prefetch demonstration

### 5. Social Proof Elements
**Testimonials (Twitter-style):**
- Jenna Smith (Radix UI)
- @jkup (Cloudflare)
- @aweary (Discord, prev React Core)
- @TAbrodi (Software Developer)
- @sergiodxa (Daffy, prev Vercel)
- @elrickvm (Fullstack Dev, Frontside)
- @theflyingcoder1 (Fullstack Developer)
- @wisecobbler (Software Engineer, Box)
- @meindertsmajens (Web Developer)
- @cammchenry (Web Developer)
- @airuyi (App Developer)

**Format:**
- Profile images included
- Twitter links
- Company/project affiliations
- Example: "I love what @mjackson and @ryanflorence are doing with Remix! Deploying to AWS Lambda in under 30 seconds 🤯"

### 6. Code Example Showcase
**Display Format:**
- Boxed code blocks with syntax highlighting
- Line numbers enabled
- Language identifier (tsx)
- Base16-derived theme with semantic colors

**Examples Shown:**
- Loader/action patterns
- Form handling
- Error boundaries
- Optimistic UI

**Copy Button:** Not explicitly mentioned

### 7. Community/Contribution Section Structure
- Not prominently featured on landing page
- Footer contains social links: GitHub, Twitter, YouTube, Discord

### 8. Call-to-Action Placement and Design Patterns
1. Hero: "Get Started" and "Read the Docs"
2. Bottom of page: "Go Play!" button
3. Inline documentation links throughout
4. Social media engagement links

### 9. Performance Metrics Displayed
- **Approach:** Conceptual advantages over quantified metrics
- **Focus:** Architecture benefits vs SPA approaches
- No specific benchmarks (speed scores, load times)
- Emphasis on parallel loading and optimistic UI

### 10. Interactive Elements and Animations
- Hover/tap-activated nested route diagrams
- Navigation state transitions with pending UI examples
- Optimistic UI demonstrations
- Prefetch visualization
- Interactive code examples showing state changes

### 11. Accessibility Features Visible
- Semantic HTML (forms, buttons, headings)
- "Progressive Enhancement" explicitly mentioned
- Proper heading hierarchy for screen readers
- Form accessibility patterns shown in examples

### 12. Mobile Responsiveness Approach
- Markup suggests responsive behavior (duplicated navigation)
- Storage key references for scroll position restoration
- Mobile-optimized layouts implied

### 13. Footer and Secondary Navigation
**Social Media:**
- GitHub Logo
- Twitter Logo
- YouTube logo
- Discord

**Assets:** Icons served from `/assets/icons-C6i9sZvw.svg`

### 14. SEO Elements
- Semantic HTML structure
- Proper meta information
- Web standards focus
- Progressive enhancement approach

---

## Astro

### 1. Hero Section Structure
- **Headline:** "The web framework for content-driven websites"
- **Subheadline:** "Astro powers the world's fastest marketing sites, blogs, e-commerce websites, and more."
- **CTA:** "Get Started" button + `npm create astro@latest` command with copy functionality
- **Visuals:** HeroBackground.webp image asset
- **Social Proof:** "Used by the largest companies around the world" with company logos

### 2. Navigation Design
- **Type:** Sticky header
- **Desktop Items:**
  - Documentation
  - Blog
  - Resources (Themes, Integrations, Site showcase, Tutorials)
  - Community (Discord, Sponsors, Merch)
  - Enterprise (Agencies, Case studies)
  - GitHub link

**Styling:**
- Primary buttons: White background with transparent borders
- Secondary buttons: Semi-transparent dark backgrounds
- Border color: `#858b984d`

**Mobile:** Hamburger menu with disclosure-open state

### 3. Color Schemes and Typography
**Primary Colors:**
- Background: `#0d0f14` (very dark blue-black)
- White: `rgb(255 255 255)` for primary buttons
- Light hover: `rgb(242 246 250)`
- Secondary text: `rgb(191 193 201)`

**Accent/Gradient Colors:**
- Purple-blue gradient: `#3245ff` to `#bc52ee`
- Secondary backgrounds: `#2c2c2c4d` (semi-transparent dark)
- Border accent: `#858b9899`
- Teal accent: `#40debf4d`

**Typography:**
- h2 headings: Font variation "wght" 290, "wdth" 490 (custom variable font, lighter weight, condensed width)
- Strong text in headings: "wght" 475, "wdth" 490 (bolder condensed)
- Body text: System fonts (no specific family declared)

### 4. Feature Showcase Methodology
**Section Title:** "Everything you need - Fully Featured"

**Layout:** Responsive grid

**Features:**
- Content Collections (TypeScript validation)
- Zero JavaScript by Default
- View Transitions (browser-native APIs)
- Optimized Images (comparison: 3600px PNG vs 800px WEBP)
- UI Integrations (React, Vue, Preact, Svelte, Solid icons)
- File-Based Routing (visual file tree with nested structure)
- Middleware and Actions
- Deployment Adapters (Node.js, Cloudflare, Vercel, Netlify, SST, Deno, AWS)
- Simple Templating (component examples: `<Logo>`, `<NavLinks>`, `<Hero>`, `<Article>`, `<Video>`)
- Instant Page Loads
- AI-Ready
- Environment Variables
- Dev Toolbar

**Visual Treatment:**
- Brief descriptions
- Icons/framework logos
- File tree visualizations
- Before/after comparisons

### 5. Social Proof Elements
**Core Web Vitals Comparison:**
- Astro: **63%** of real-world sites with good Core Web Vitals
- WordPress: 44%
- Gatsby: 42%
- Next.js: 27%
- Nuxt: 24%

**Data Source:** HTTP Archive and Chrome UX Report
**Link:** "View the full dataset"

**Framework Logos:** React, Vue, Preact, Svelte, Solid displayed prominently

### 6. Code Example Showcase
**Format:** Framework variations shown side-by-side
- React JSX
- Vue
- Svelte implementations

**Example Content:**
- `getProductDetails()` function
- `BuyButton` components
- Astro Cap merchandise display ($15.50 product with "Add to cart" CTA)

**Styling:**
- Pre-styled containers
- Border-radius: 1rem
- Border color: `#858b9833`
- Syntax highlighting with language-specific imports

### 7. Community/Contribution Section Structure
**Navigation Links:**
- Discord
- Sponsors (OpenCollective)
- Merch shop
- Enterprise agencies and case studies

**Social Media:**
- Bluesky
- LinkedIn
- Mastodon
- Reddit
- X (formerly Twitter)
- YouTube

### 8. Call-to-Action Placement and Design Patterns
1. Hero: "Get Started" + npm command
2. Framework integration: "Integrate your favorite framework" link
3. Framework tabs: React, Vue, Svelte, Solid, Preact (interactive switching)
4. Themes showcase:
   - "Browse more themes"
   - "View Theme" buttons (individual)
   - "Browse more e-commerce themes"
   - "Browse more blog themes"
   - "Browse more documentation themes"
   - "Browse more portfolio themes"
   - "Browse more landing page themes"
5. Agencies: "Explore partner agencies"
6. Footer: "Get Started" + npm command (repeated), email signup form

**Pattern:** Multiple themed entry points, category-specific CTAs

### 9. Performance Metrics Displayed
**Section:** "Best-In-Class Performance"

**Core Web Vitals Comparison:**
- Astro leads at **63%** passing rate
- Competitors: WordPress (44%), Gatsby (42%), Next.js (27%), Nuxt (24%)
- Dataset: Real-world HTTP Archive data
- Prominent visual chart/comparison

### 10. Interactive Elements and Animations
**Visibility Tracking:**
- IntersectionObserver manages `.in-viewport` class toggling

**3D Transforms:**
- Perspective: 500px
- Rotation: `rotateX(40deg) rotateY(20deg)` on hover/focus

**Marquee Animation:**
- 50-second linear loop on docs containers
- Paused by default, running on hover/focus
- Respects motion preferences

**Tab Switching:**
- Arrow keys (Right/Left) for keyboard navigation
- `aria-selected="true"` for selected tabs

**Stardust Gradients:**
- Background gradients at 270deg
- Purple-to-blue color stops

**Favicon Switching:**
- Changes based on visibility state

**Disclosure Menu:**
- Dark overlay with opacity transition

**Hover Effects:**
- Primary buttons: `rgb(242 246 250)` background
- Secondary buttons: Brighten text on hover

### 11. Accessibility Features Visible
**ARIA Attributes:**
- `aria-selected`
- `tabindex` for tab components
- ARIA labels throughout

**Keyboard Navigation:**
- Arrow keys control tab selection (ArrowRight/ArrowLeft)
- ⌘K shortcuts

**Focus Management:**
- `:focus-visible` states
- Focus-within detection

**Motion Preferences:**
- `prefers-reduced-motion: no-preference` media query gates animations

**Semantic HTML:**
- Proper heading hierarchy (h2 elements)
- Link elements
- Form controls

**Color Contrast:**
- Light text on dark backgrounds

**Screen Reader Support:**
- Disclosure elements manage focus appropriately

### 12. Mobile Responsiveness Approach
**Hamburger Menu:**
- "Show Menu" button trigger
- Same navigation structure as desktop

**Mobile States:**
- `.disclosure-open` applies `overflow-y: hidden` to root
- Dark overlay during open state (opacity animation)
- Menu content `#nav` becomes scrollable: `overflow-y: auto`
- Closes on blur after 200ms delay

### 13. Footer and Secondary Navigation
**Resource Links:**
- Docs, Themes, Integrations, Site showcase, Starter templates

**About:**
- Blog, Case studies, Partnership info, Press, Agencies

**Community:**
- Contributing guide, Sponsors, Wallpapers, Swag Shop

**Legal:**
- Telemetry, Privacy Policy, Terms of Service

**Copyright:** "MIT License © 2025" with contributor attribution

**Social Icons:**
- Bluesky, Discord, GitHub, LinkedIn, Mastodon, Reddit, X, YouTube

**Email Signup:**
- "Enter your email to stay up to date with the latest updates from Astro"

### 14. SEO Elements
- Semantic HTML structure
- Meta tags and structured data
- Performance optimization (Core Web Vitals focus)
- Open source license visibility
- Content-driven architecture emphasis

---

## htmx

### 1. Hero Section Structure
- **Headline:** "</> htmx _high power tools for HTML_"
- **Subheadline:** "htmx gives you access to AJAX, CSS Transitions, WebSockets and Server Sent Events directly in HTML, using attributes"
- **CTA:** Code example in quick start section:
  ```html
  <script src="https://cdn.jsdelivr.net/npm/htmx.org@2.0.8/dist/htmx.min.js"></script>
  <button hx-post="/clicked" hx-swap="outerHTML">Click Me</button>
  ```
- **Visuals:** Two Easter egg images (wuw.png, kawaii.png) via URL parameters

### 2. Navigation Design
- **Type:** Static (no sticky behavior evident)
- **Items:**
  - Logo: "</> htmx"
  - Links: docs, reference, examples, talk, essays
  - Search
  - Star (GitHub)
- **Style:** Minimal, top-aligned horizontal layout

### 3. Color Schemes and Typography
**Colors:**
- Background: Light mode default
- Dark mode: Supported via CSS class switching
- Text: Dark on light (default)
- Links: Standard blue
- Easter egg modes: Via `?ads=true`, `?wuw=true`, `?uwu=true` parameters

**Typography:**
- Headings: System fonts (no specific font-family declared)
- Body: Default sans-serif stack
- Code: Monospace for syntax examples

### 4. Feature Showcase Methodology
**Format:** Bullet-point list under "motivation"

**Philosophy Questions:**
- "Why should only `<a>` & `<form>` be able to make HTTP requests?"
- "Why should only `click` & `submit` events trigger them?"
- "Why should only `GET` & `POST` methods be available?"
- "Why should you only be able to replace the entire screen?"

**Presentation:** Straightforward text, no card-based layout

### 5. Social Proof Elements
**Sponsor Hierarchy:**
- **Platinum:** Commspace
- **Silver Sponsors:** 20+ logos
  - JetBrains
  - GitHub
  - Craft CMS
  - ButterCMS
  - Others

**Link:** GitHub Sponsors
**No testimonials or statistics visible**

### 6. Code Example Showcase
**Quick Start Section:**
```html
<script src="https://cdn.jsdelivr.net/npm/htmx.org@2.0.8/dist/htmx.min.js"></script>
<button hx-post="/clicked" hx-swap="outerHTML">Click Me</button>
```

**Display:**
- Plain text (no syntax highlighting)
- No copy button visible
- Explanation follows code block

**Approach:** Minimal, focused on simplicity

### 7. Community/Contribution Section Structure
- Minimal presence
- Sponsor-focused rather than community-driven
- No dedicated community section

### 8. Call-to-Action Placement and Design Patterns
1. Code example in quick start
2. Book cover link (Hypermedia Systems book)
3. GitHub Sponsors link
4. Footer navigation: docs, reference, examples, talk, essays

**Pattern:** Education and documentation focused

### 9. Performance Metrics Displayed
**Single Benchmark:**
- "htmx is small (~16k min.gz'd), dependency-free, extendable & has reduced code base sizes by 67% when compared with react"

**Focus:** Bundle size and code reduction

### 10. Interactive Elements and Animations
**Conditional Rendering:**
- Easter egg classes via URL parameters

**Hover Effects:**
- Ad links show opacity changes

**Ad System:**
- Toggleable via `?ads=true` parameter
- Retro 90s-style design

### 11. Accessibility Features Visible
- Semantic HTML (`<a>`, `<button>`, `<h2>` tags)
- Not explicitly documented beyond standard HTML semantics

### 12. Mobile Responsiveness Approach
- Responsive CSS exists (max-width: 760px) for sponsor table
- No hamburger menu markup shown
- Minimal mobile-specific adaptations

### 13. Footer and Secondary Navigation
**Links:**
- docs, reference, examples, talk, essays

**Social:**
- @htmx_org Twitter handle

**Attribution:**
- "ʕ •ᴥ•ʔ made in montana"

**Image:**
- bss_bars.png logo

### 14. SEO Elements
- Semantic HTML structure
- Minimal meta approach
- Focus on content and simplicity

**Special Note:** Page includes playful Easter eggs and retro advertisement styling, suggesting personality-driven design beneath professional positioning

---

## Comparative Analysis

### Hero Section Patterns

| Framework | Headline Style | Code Example | Visual Approach |
|-----------|---------------|--------------|-----------------|
| **Next.js** | Framework positioning | Terminal command | Modern, gradient text, video embed |
| **SvelteKit** | Philosophy-driven | No code on hero | Illustration (compiler machine) |
| **Remix** | Welcome message | Full component code | Code-forward |
| **Astro** | Use case focused | npm command with copy | Background image, company logos |
| **htmx** | Technical description | Minimal HTML example | Minimalist, Easter eggs |

### Navigation Approaches

| Framework | Sticky | Search | Dropdown Menus |
|-----------|--------|--------|----------------|
| **Next.js** | Yes | Yes (⌘K) | No |
| **SvelteKit** | No | No | Yes (Docs) |
| **Remix** | No | No | No |
| **Astro** | Yes | No | No |
| **htmx** | No | Yes | No |

### Color Scheme Analysis

**Dark Backgrounds:**
- Next.js: Pure black (#000)
- Astro: Blue-black (#0d0f14)

**Light Themes:**
- All frameworks support light/dark mode switching
- htmx: Light mode default

**Accent Colors:**
- Next.js: Blue tones
- SvelteKit: Brand-specific (not disclosed in detail)
- Remix: Blue/cyan (Base16 scheme)
- Astro: Purple-blue gradient (#3245ff to #bc52ee)
- htmx: Standard blue links

### Feature Showcase Comparison

| Framework | Format | Interactive Elements | Visual Style |
|-----------|--------|---------------------|--------------|
| **Next.js** | Cards in responsive grid | All clickable | 3D illustrations |
| **SvelteKit** | Company logos | None on features | Minimal |
| **Remix** | Interactive diagrams | Hover/tap reveals | Side-by-side comparisons |
| **Astro** | Grid with descriptions | Framework tabs | Icons, file trees |
| **htmx** | Bullet list | None | Text-only |

### Social Proof Strategies

**Quantified Metrics:**
- Next.js: Core Web Vitals from customer quotes
- Astro: 63% Core Web Vitals pass rate (comparative chart)
- htmx: 67% code reduction claim

**Testimonial Format:**
- Next.js: Full quotes with attribution
- Remix: Twitter-style with profile images
- SvelteKit: Developer surveys + single tweet

**Company Logos:**
- All frameworks use grayscale/monochrome treatment
- Placement varies: hero (Astro), carousel (Next.js), grid (SvelteKit)

### Code Example Patterns

| Framework | Syntax Highlighting | Copy Button | Line Numbers | Explanations |
|-----------|-------------------|-------------|--------------|--------------|
| **Next.js** | Minimal on landing | No | No | Contextual |
| **SvelteKit** | Not on landing | N/A | N/A | Separate tutorial |
| **Remix** | Base16 theme | Not visible | Yes | Inline |
| **Astro** | Yes, framework-specific | Yes | No | Inline |
| **htmx** | No | No | No | Following code |

### Community Section Approaches

**Robust Community Sections:**
- SvelteKit: Dedicated section with photo, Discord, Svelte Society
- Astro: Multiple social platforms listed

**Minimal Community Presence:**
- Next.js: Footer links only
- Remix: Footer social icons
- htmx: Sponsor-focused

### CTA Strategies

**Multiple Entry Points:**
- Astro: Theme-specific CTAs (e-commerce, blog, docs, portfolio, landing page)
- Next.js: Get Started, Learn, Deploy, Templates

**Focused CTAs:**
- htmx: Documentation-focused
- Remix: Get Started, Read Docs, Go Play

### Performance Messaging

**Quantified:**
- Astro: 63% Core Web Vitals (with competitor comparison)
- Next.js: Customer-specific metrics (0.09 CLS, 100ms input, 60fps)
- htmx: Bundle size (16k min.gz'd), code reduction (67% vs React)

**Conceptual:**
- Remix: Parallel loading, optimistic UI advantages
- SvelteKit: Developer satisfaction over benchmarks

### Interactive Elements

**Sophisticated Animations:**
- Astro: 3D transforms, marquee animations, visibility tracking
- Next.js: Theme toggles, command palette, prefetch

**Minimal Interactions:**
- htmx: Easter eggs, basic hover effects
- SvelteKit: Theme toggle, video controls

**Educational Interactions:**
- Remix: Hover-activated diagrams, nested route visualizations

### Accessibility Approaches

**Explicit Features:**
- Next.js: Skip nav, keyboard shortcuts, ARIA labels
- Astro: Motion preferences, arrow key navigation, focus management
- SvelteKit: Video player controls, skip-to-content

**Basic Semantic HTML:**
- Remix: Progressive enhancement emphasis
- htmx: Standard HTML semantics

### Mobile Responsiveness

**Hamburger Menus:**
- Astro: Disclosure-based with overlay
- Next.js: Responsive classes (implied)

**Adaptive Layouts:**
- All frameworks use responsive grids
- Column counts adapt: 3 → 2 → 1

**Mobile-Specific:**
- Next.js: Carousel for company logos
- Astro: Menu closes on blur (200ms delay)

### Footer Patterns

**Comprehensive:**
- Next.js: Multiple sections (Resources, More, About, Legal, Newsletter)
- Astro: Resource links, About, Community, Legal, Email signup

**Minimal:**
- htmx: Links, social handle, attribution
- Remix: Social icons only

**Community-Focused:**
- SvelteKit: 50+ maintainers, 40+ sponsors listed

### SEO and Technical Optimization

**Performance-First:**
- Next.js: Built with itself, Turbopack, SWC
- Astro: Core Web Vitals emphasis

**Standards-Based:**
- Remix: Web standards focus
- htmx: HTML-first approach

**Content-Driven:**
- Astro: Content-driven architecture
- SvelteKit: Compiler approach

---

## Key Takeaways

### Design Philosophy Spectrum

**Modern/Complex** (Next.js, Astro)
- Rich interactions
- Multiple CTAs
- Performance metrics
- Comprehensive features

**Balanced** (SvelteKit, Remix)
- Community focus
- Educational approach
- Conceptual over metrics

**Minimal/Focused** (htmx)
- Simplicity emphasis
- Philosophy-driven
- Minimal interactions

### Color and Typography Trends

1. **Dark mode is standard** across all frameworks
2. **System fonts** or custom variable fonts (Geist for Next.js, custom for Astro)
3. **Dark backgrounds** prefer blue-black over pure black (except Next.js)
4. **Gradient accents** used sparingly (Astro, Next.js)
5. **Monochrome logos** for company showcases

### CTA Patterns

**Primary Hero CTAs:**
- "Get Started" (universal)
- "Read/Learn the Docs" (common secondary)

**Progressive Engagement:**
- Quick start → Documentation → Community → Enterprise

**Category-Specific:**
- Astro's theme-based CTAs
- Next.js's template deployment

### Social Proof Hierarchy

1. **Quantified metrics** (most persuasive)
2. **Customer testimonials** with attribution
3. **Company logos** (validation)
4. **Developer surveys** (community endorsement)
5. **Sponsor lists** (financial backing)

### Code Example Philosophy

**Show Don't Tell:**
- Remix: Full component examples
- Astro: Framework comparisons

**Quick Start:**
- Next.js, Astro, htmx: Installation commands

**Separate Learning:**
- SvelteKit: Dedicated tutorial section

### Interactive Element Strategy

**Educational:**
- Remix: Diagrams showing concepts
- Astro: Framework tabs

**Practical:**
- Next.js: Command palette, copy buttons
- Astro: npm command copy

**Playful:**
- htmx: Easter eggs
- Next.js: uwu logo variant

### Mobile-First Considerations

1. **Hamburger menus** are standard
2. **Column grid adaptation** (3 → 2 → 1)
3. **Touch-friendly sizing** throughout
4. **Scroll position restoration** (Remix)
5. **Carousels for horizontal content** (Next.js)

### Footer Strategy

**Comprehensive Navigation:**
- Multiple link categories
- Newsletter signups
- Social media presence

**Community Recognition:**
- Contributor lists
- Sponsor acknowledgment
- Open source licensing

**Legal Compliance:**
- Privacy policies
- Cookie preferences
- Terms of service

### Performance Messaging

**Competitive Benchmarking:**
- Astro: Direct framework comparison

**Customer Proof:**
- Next.js: Real-world case studies

**Technical Metrics:**
- htmx: Bundle size emphasis

**Conceptual Advantages:**
- Remix: Architecture benefits

---

## Recommendations for Cortex Landing Page

Based on this analysis, here are specific recommendations:

### 1. Hero Section
- **Headline:** Position Cortex clearly (e.g., "The reactive state management framework for X")
- **Subheadline:** Use case driven (who uses it, what it enables)
- **Dual CTAs:** "Get Started" + "View Examples" or "Read Docs"
- **Code Example:** Show before/after or single compelling example
- **Visual:** Consider illustration showing architecture/flow (like SvelteKit's compiler)

### 2. Navigation
- **Sticky header** (Next.js, Astro approach)
- **Search functionality** with keyboard shortcut (⌘K pattern)
- **Items:** Docs, Examples, Blog, Community, GitHub
- **Mobile:** Hamburger with overlay

### 3. Color Scheme
- **Dark theme primary:** Blue-black (#0d0f14) like Astro
- **Light mode:** Available but dark mode default
- **Accent:** Single color gradient (purple-blue or custom brand)
- **Text:** High contrast (light on dark)

### 4. Features Section
- **Grid layout:** 3 → 2 → 1 columns (responsive)
- **Card style:** Similar to Next.js with hover effects
- **Visual emphasis:** Icon or illustration for key features
- **Clickable:** All cards link to detailed documentation

### 5. Social Proof
- **Performance metrics:** If available, show benchmarks
- **Testimonials:** Developer quotes with attribution
- **Company logos:** If adoptions exist, show them (monochrome)
- **GitHub stars:** Display prominently

### 6. Code Examples
- **Syntax highlighting:** Use consistent theme (Base16 or custom)
- **Copy buttons:** Essential for developer tools
- **Multiple examples:** Show different use cases
- **Framework tabs:** Like Astro if multi-framework support

### 7. Community Section
- **Discord/GitHub:** Primary community links
- **Contributors:** Acknowledge if open source
- **Sponsors:** If applicable
- **Photo/visual:** Humanize the community

### 8. CTAs Throughout
- **Hero:** Get Started + secondary
- **Features:** Links to docs
- **Examples:** "Try it yourself" / "View in playground"
- **Footer:** Repeated Get Started + newsletter

### 9. Performance
- **Show metrics:** If Cortex has performance advantages
- **Comparison:** Consider competitor comparison (if ethical)
- **Bundle size:** Emphasize if small (htmx approach)

### 10. Interactivity
- **Code copy:** Essential
- **Theme toggle:** Light/dark mode
- **Keyboard navigation:** ⌘K for search
- **Subtle animations:** Hover effects, fade-ins (respect motion preferences)

### 11. Accessibility
- **Skip navigation:** First element
- **ARIA labels:** Throughout
- **Keyboard support:** All interactive elements
- **Semantic HTML:** Proper heading hierarchy
- **Focus states:** Clear and visible

### 12. Mobile
- **Hamburger menu:** With smooth animation
- **Touch targets:** Minimum 44px
- **Responsive grids:** Adapt column counts
- **No horizontal scroll:** Ensure content fits

### 13. Footer
- **Resources:** Docs, Examples, Blog, API Reference
- **Community:** Discord, GitHub, Contributing guide
- **Legal:** Privacy, Terms
- **Social:** All relevant platforms
- **Newsletter:** Optional but valuable for engagement

### 14. SEO
- **Semantic HTML:** Proper structure
- **Meta tags:** Title, description, OG tags
- **Performance:** Optimize Core Web Vitals
- **Structured data:** If applicable
- **Clear value prop:** In meta description

### Technical Recommendations

**Framework Choice:**
- Next.js or Astro (for performance and SEO)
- SvelteKit (if Svelte is relevant to Cortex)

**Typography:**
- System fonts or Geist (Next.js approach)
- Variable fonts for headings (Astro approach)

**Animations:**
- IntersectionObserver for scroll animations
- CSS transitions (200-300ms)
- Respect `prefers-reduced-motion`

**Color Variables:**
- CSS custom properties for theming
- Base16 or similar for code highlighting

**Build Tools:**
- Fast bundler (Turbopack, Vite)
- Image optimization
- Font optimization

This research provides a comprehensive foundation for designing a modern, effective landing page for Cortex that incorporates best practices from leading web frameworks.
