export interface Startup {
  title: string;
  link: string;
  thumbnail: string;
  initialX?: number;
  initialY?: number;
  initialRotate?: number;
  speed?: number; // Parallax speed multiplier (0.1 to 1.0)
}

export const startups: Startup[] = [
  {
    title: "Stripe",
    link: "https://stripe.com",
    thumbnail: "/startups/stripe.png",
    initialX: -100,
    initialY: 50,
    initialRotate: -15,
    speed: 0.3
  },
  {
    title: "Notion",
    link: "https://notion.so",
    thumbnail: "/startups/notion.png",
    initialX: 200,
    initialY: -80,
    initialRotate: 12,
    speed: 0.5
  },
  {
    title: "Linear",
    link: "https://linear.app",
    thumbnail: "/startups/linear.png",
    initialX: -150,
    initialY: 150,
    initialRotate: -18,
    speed: 0.4
  },
  {
    title: "Vercel",
    link: "https://vercel.com",
    thumbnail: "/startups/vercel.png",
    initialX: 250,
    initialY: 100,
    initialRotate: 20,
    speed: 0.6
  },
  {
    title: "Figma",
    link: "https://figma.com",
    thumbnail: "/startups/figma.png",
    initialX: -200,
    initialY: -50,
    initialRotate: -12,
    speed: 0.35
  },
  {
    title: "Anthropic",
    link: "https://anthropic.com",
    thumbnail: "/startups/anthropic.png",
    initialX: 150,
    initialY: 200,
    initialRotate: 10,
    speed: 0.45
  },
  {
    title: "V0",
    link: "https://v0.dev",
    thumbnail: "/startups/v0.png",
    initialX: 100,
    initialY: -120,
    initialRotate: 15,
    speed: 0.4
  }
];

