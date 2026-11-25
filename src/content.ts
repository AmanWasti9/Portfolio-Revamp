// ─────────────────────────────────────────────────────────────
//  All site copy lives here. Edit this file to make it yours.
//  Anything marked TODO is a placeholder that needs real info.
// ─────────────────────────────────────────────────────────────

export const site = {
  firstName: "Amanullah",
  role: "Full-stack developer & designer",
  email: "amanwasti5@gmail.com",
  location: "Available worldwide, remote",
  intro:
    "From the first idea to the final product, I bring design and development together to create digital experiences that work as beautifully as they look.",
  socials: [
    { label: "LinkedIn", href: "https://www.linkedin.com/in/aman-wasti/" },
    { label: "GitHub", href: "https://github.com/AmanWasti9" },
    { label: "Behance", href: "https://www.behance.net/amanwasti1" },
    { label: "Upwork", href: "https://www.upwork.com/freelancers/~014eb067bd28136b5c" },
  ],
};

export type Project = {
  slug: string;
  title: string;
  kind: string;
  year: string;
  role: string;
  stack: string[];
  image: string; // base name in /public/work (without size suffix)
  colors: { name: string; hex: string }[];
  summary: string;
  problem: string;
  approach: { title: string; body: string }[];
  outcome: string;
  // Focal points (object-position) used for the zoomed "detail" crops on the case study
  details: [string, string];
  // false hides the original laptop photo on the case study (e.g. it shows outdated branding)
  showPhoto?: boolean;
};

export const projects: Project[] = [
  {
    // a self-initiated concept, not client work: no clients, results or testimonials
    slug: "dealboard",
    title: "Dealboard",
    kind: "AI sales platform (concept)",
    year: "2026",
    role: "Design & development",
    stack: ["React 19", "TypeScript", "Vite", "Tailwind CSS", "Radix UI", "Recharts", "Framer Motion", "dnd-kit"],
    image: "dealboard",
    colors: [
      { name: "Signal orange", hex: "#F0481C" },
      { name: "Lime", hex: "#D4EF78" },
      { name: "Graphite", hex: "#141210" },
    ],
    summary:
      "Dealboard is a self-initiated concept: one workspace where sales teams see their pipeline, their best leads and their revenue forecast together.",
    problem:
      "Sales teams track deals in one tool, leads in another and forecasts in spreadsheets, so they can't tell which deals will close or why.",
    approach: [
      {
        title: "One board for every deal",
        body: "Drag deals between stages, undo a wrong move, filter, sort, search with Ctrl K and export to CSV.",
      },
      {
        title: "Scores you can trust",
        body: "Each lead gets an AI score, with the buying signals behind it shown right next to the number.",
      },
      {
        title: "A forecast with honest ranges",
        body: "The revenue chart shows a confidence range instead of one guess, plus simple automations for follow-ups.",
      },
    ],
    outcome:
      "I designed the brand and the interface, and built the full frontend, responsive down to mobile.",
    details: ["70% 40%", "30% 55%"],
  },
  {
    slug: "cogni",
    title: "Cogni",
    kind: "AI study tool",
    year: "2024",
    role: "Design & development",
    stack: ["Figma", "React", "TypeScript", "Tailwind"],
    image: "cogni",
    colors: [
      { name: "Violet", hex: "#5A2BE6" },
      { name: "Lilac", hex: "#EEEBFD" },
      { name: "Ink", hex: "#14121F" },
    ],
    summary:
      "Cogni turns any PDF or link into a study kit: a short summary, answers to your questions and flashcards to help you remember.",
    problem:
      "Studying from a long document usually means reading, taking notes and making flashcards by hand, often in separate apps.",
    approach: [
      {
        title: "One upload, three tools",
        body: "Upload once and get a summary, a chat for questions and flashcards, all in one place.",
      },
      {
        title: "A calm palette for long sessions",
        body: "Soft lilac with one strong violet for buttons keeps the screen easy on the eyes during long study sessions.",
      },
      {
        title: "Copy that names the result",
        body: "\"Upload. Learn. Ask. Remember.\" The headline explains the whole product in four words.",
      },
    ],
    outcome: "A study tool that explains itself on the first screen and keeps everything for one document together.",
    details: ["78% 40%", "30% 55%"],
  },
  {
    slug: "the-pacer",
    title: "The Pacer",
    kind: "Sneaker online store",
    year: "2025",
    role: "Design & development",
    stack: ["Figma", "Next.js", "GSAP"],
    image: "pacer",
    colors: [
      { name: "Signal red", hex: "#E3141B" },
      { name: "Asphalt", hex: "#141414" },
      { name: "Concrete", hex: "#BDB8B1" },
    ],
    summary: "An online store for a performance sneaker brand, designed to feel as fast as the shoes.",
    problem: "Most sneaker stores look the same: white product shots in a plain grid, with nothing that says speed.",
    approach: [
      {
        title: "Movement as the hero",
        body: "A runner mid-stride and angled concrete give the first screen energy and lead the eye straight to the collection.",
      },
      {
        title: "Outlined and solid type",
        body: "\"Power that you run\" mixes outlined and solid letters, like a slogan printed on a shoebox.",
      },
      {
        title: "Proof up front",
        body: "Key numbers sit right under the headline, so visitors see the brand's range before they scroll.",
      },
    ],
    outcome: "A store with attitude that feels like the product: bold, quick and made for movement.",
    details: ["70% 35%", "22% 60%"],
  },
  {
    slug: "beacon",
    title: "Beacon",
    kind: "AI-powered blogging platform",
    year: "2024",
    role: "Design & development",
    stack: ["Figma", "React", "CSS"],
    image: "beacon",
    colors: [
      { name: "Beacon red", hex: "#E3262C" },
      { name: "Paper", hex: "#F7F7F5" },
      { name: "Graphite", hex: "#1A1A1A" },
    ],
    summary: "Beacon is an AI-powered blogging platform for reading and writing ideas, essays and stories.",
    problem:
      "Many blogs bury good writing under ads and clutter, and make it hard for readers to start writing themselves.",
    approach: [
      {
        title: "Black, white and one red",
        body: "A quiet black-and-white look keeps the focus on the writing. Red is saved for the things you can click.",
      },
      {
        title: "A short promise",
        body: "\"Read. Learn. Be inspired.\" says what Beacon is for in three words.",
      },
      {
        title: "Writing is one click away",
        body: "The Write button is on every page, so anyone can turn an idea into a post straight away.",
      },
    ],
    outcome: "A calm place to read and write, where the words come first.",
    details: ["66% 40%", "34% 38%"],
  },
  {
    slug: "pantry-tracker",
    title: "Pantry Tracker",
    kind: "Pantry tracking app",
    year: "2025",
    role: "Design & development",
    stack: ["Figma", "React", "Framer Motion"],
    image: "pantry",
    colors: [
      { name: "Basil", hex: "#1D6B33" },
      { name: "Sage", hex: "#A8CFA6" },
      { name: "Oat", hex: "#F1F1EC" },
    ],
    summary:
      "Pantry Tracker keeps track of the food you have at home, reminds you before you run out and helps you waste less.",
    problem:
      "It's easy to forget what's already in the cupboard, so food gets thrown away and the same things get bought twice.",
    approach: [
      {
        title: "Show the phone, not a promise",
        body: "The first screen shows the real app, with a low-stock alert popping out to show what it does.",
      },
      {
        title: "Fresh, friendly greens",
        body: "Calm greens connect the app to fresh food without making it look like a supermarket ad.",
      },
      {
        title: "Three reasons, three icons",
        body: "Track your food, waste less, get reminders: three short benefits you can read at a glance.",
      },
    ],
    outcome: "A friendly launch page that explains the whole app in one screen.",
    details: ["62% 42%", "30% 45%"],
    showPhoto: false, // the laptop photo still shows the old "Traker" spelling
  },
];

// Starting prices: change the `price` text any time (e.g. "from $900", "$40 / hour").
export const services = [
  {
    title: "Web apps",
    price: "from $975",
    body: "Complete products with accounts, data and everything behind the scenes.",
  },
  {
    title: "Websites",
    price: "from $475",
    body: "Fast websites that look right on every screen and make your offer clear.",
  },
  {
    title: "AI features",
    price: "from $675",
    body: "Useful AI in your product, like summaries and answers from your own documents.",
  },
  {
    title: "UI & UX design",
    price: "from $375",
    body: "Screens and flows you see and approve before any code is written.",
  },
  {
    title: "AI PHOTOGRAPHY",
    price: "from $12 for a photo",
    body: "AI-generated images for your website, app or social media posts.",
  },
];

// ─────────────────────────────────────────────────────────────
//  Testimonials — REPLACE THESE WITH REAL CLIENT QUOTES.
//  While `sample: true` is set, the site shows a "Sample" tag on the quote.
//  Delete the `sample` line once a quote is real.
//  source: where the review lives (e.g. "Upwork", "LinkedIn", "Email").
//  rating: optional, 1–5 (shown as e.g. "★ 5.0 on Upwork").
// ─────────────────────────────────────────────────────────────
export type Testimonial = {
  quote: string;
  name: string;
  role: string;
  source?: string;
  rating?: number;
  sample?: boolean;
};

export const testimonials: Testimonial[] = [
  {
    // approved by the client
    quote:
      "Our website finally explains what we do. Visitors get it in seconds, and the whole thing feels fast and polished.",
    name: "Ahmed Bashaar",
    role: "Founder, Iframes",
    source: "LinkedIn",
  },
  {
    // approved by the client
    quote:
      "Amanullah took our idea from a rough sketch to a live product in a few weeks. Clear updates the whole way, and the design turned out better than we imagined.",
    name: "Mazin",
    role: "Founder, UIX Solutions",
    source: "LinkedIn",
  },
  {
    // approved by the client
    quote:
      "It's rare to find someone who cares about the design and the code equally. Everything was handed over clean and easy to update.",
    name: "Rameez Raza",
    role: "Founder, Cloud Axis Systems",
    source: "Email",
  },
];

export const process = [
  {
    title: "Discovery",
    body: "We talk about your idea, your customers and what success looks like. I ask questions until the goal is clear.",
  },
  {
    title: "Planning",
    body: "I map out the pages, features and timeline, so you know exactly what's coming.",
  },
  {
    title: "Design",
    body: "You see and approve every screen before anything is built.",
  },
  {
    title: "Development",
    body: "I build it, make it fast and keep everything tidy for later.",
  },
  {
    title: "Testing",
    body: "I test on real phones and computers and fix anything that breaks.",
  },
  {
    title: "Launch",
    body: "We go live, and you get everything you need to run it.",
  },
  {
    title: "Reflection",
    body: "We look at what's working and decide what to improve next.",
  },
];

export const journey = {
  title: "My current journey",
  intro: [
    "Lately I've been exploring creative design and video: visuals and storytelling that make simple ideas more engaging.",
    "I'm still learning every day, and I focus on work that feels meaningful to the people who use it.",
  ],
  entries: [
    {
      year: "Now",
      title: "Creative Design & Video",
      body: "Telling stories through motion and design, and turning simple ideas into something that feels alive.",
    },
    {
      year: "2025",
      title: "Building Real-World Products",
      body: "Took products from idea to launch, handling the design and the development myself. The Pacer and Pantry Tracker came out of this year.",
    },
    {
      year: "2024",
      title: "Building AI-first Products",
      body: "Built AI tools that solve everyday problems, including Beacon, Cogni and Rate My Professor.",
    },
    {
      year: "2023",
      title: "Backend & Cloud Systems",
      body: "Learned to build the parts users never see, with Node.js, NestJS, Docker and AWS, so my projects could run as complete products.",
    },
    {
      year: "2022",
      title: "Backend & Spring Boot",
      body: "Went deeper into backend development with Spring Boot and learned how real systems fit together.",
    },
    {
      year: "2021",
      title: "Getting into Frontend",
      body: "Built my first websites and fell for making things on the web.",
    },
  ],
};

export const about = {
  lead: "I'm Amanullah, a developer with an eye for design. I take products from the first idea all the way to launch.",
  paragraphs: [
    "I started building websites in 2021 and kept going until I could build whole products on my own. Lately that means AI tools like Beacon and Cogni.",
    "Because I design as well as code, nothing gets lost between the idea and what ships. You work with one person who cares how it works and how it feels.",
  ],
  principles: [
    { title: "Clarity first", body: "Visitors should understand what you offer in seconds. If they can't, nothing else matters." },
    { title: "Motion with a reason", body: "Animation should help people find their way, never just show off." },
    { title: "Built to last", body: "Clean, well-organised work that's easy to update, whoever picks it up next." },
  ],
  toolkit: ["Figma", "React", "Next.js", "TypeScript", "GSAP", "Tailwind CSS", "Node.js", "NestJS", "Docker", "AWS", "Spring Boot"],
};

export const imgSrc = (base: string, w: 560 | 1100 | 2000) => `/work/${base}-${w}.webp`;

// Which extra case-study images exist (written by `npm run images`).
import caseImages from "./generated/case-images.json";
export type CaseSlot = "hero" | "detail-1" | "detail-2" | "showcase";
export const hasCaseImage = (base: string, slot: CaseSlot) =>
  ((caseImages as Record<string, string[]>)[base] ?? []).includes(slot);

/** A project's main picture: the device showcase when it exists, otherwise the laptop shot. */
export const cover = (p: { image: string }) => (hasCaseImage(p.image, "showcase") ? `${p.image}-showcase` : p.image);
export const imgSrcSet = (base: string) =>
  `/work/${base}-560.webp 560w, /work/${base}-1100.webp 1100w, /work/${base}-2000.webp 1672w`;
