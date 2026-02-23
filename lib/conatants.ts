import {
  UserRound,
  Sparkles,
  CalendarDays,
  Send,
  Star,
  LucideIcon,
  ShieldCheck,
  BadgeCheck,
  HeartHandshake,
  Headphones,
  Globe,
  Lock,
} from "lucide-react";

export const triptypes = [
  "tour",
  "adventure",
  "cultural",
  "entertainment",
  "sports",
  "wildlife",
  "photography",
  "nature",
  "shopping",
];

export const transportType = [
  "bus",
  "flight",
  "train",
  "ferry",
  "cruise",
  "car rental",
  "shuttle",
  "taxi",
];

export interface Step {
  number: string;
  icon: LucideIcon;
  label: string;
  title: string;
  description: string;
  accent: string;
  tag: string;
}

export interface TrustCard {
  icon: LucideIcon;
  title: string;
  description: string;
  accent: string;
  tag: string;
}

export interface Review {
  name: string;
  location: string;
  avatar: string;
  rating: number;
  text: string;
  accent: string;
  experience: string;
}

export const steps: Step[] = [
  {
    number: "01",
    icon: UserRound,
    label: "Sign Up",
    title: "Create Your Account",
    description:
      "Join WayLink in seconds. Tell us who you are, set your preferences, and you're ready to explore a world of curated experiences and seamless transport.",
    accent: "#FF6B35",
    tag: "30 seconds",
  },
  {
    number: "02",
    icon: Sparkles,
    label: "Discover",
    title: "Find What You Love",
    description:
      "Our smart engine learns your taste. Browse handpicked experiences — from mountain hikes to city rooftop dinners — and transport options tailored just for you.",
    accent: "#00C9A7",
    tag: "Personalized",
  },
  {
    number: "03",
    icon: CalendarDays,
    label: "Book",
    title: "Reserve Instantly",
    description:
      "Pick your date, select your seats or spots, and book in one tap. Real-time availability means no surprises — just a confirmed experience waiting for you.",
    accent: "#845EF7",
    tag: "Instant confirm",
  },
  {
    number: "04",
    icon: Send,
    label: "Submit",
    title: "Confirm & Go",
    description:
      "Review your booking summary, apply any promo codes, and submit with confidence. You'll get an instant confirmation with all the details you need.",
    accent: "#FF6B35",
    tag: "Seamless",
  },
  {
    number: "05",
    icon: Star,
    label: "Rate & Review",
    title: "Share Your Story",
    description:
      "After your adventure, leave a review that helps thousands of others. Rate your experience, and inspire the next WayLink explorer.",
    accent: "#00C9A7",
    tag: "Community",
  },
];

export const trustCards: TrustCard[] = [
  {
    icon: ShieldCheck,
    title: "Verified Providers",
    description:
      "Every experience and transport partner is rigorously vetted. We verify licenses, insurance, and track records before they ever appear on WayLink.",
    accent: "#FF6B35",
    tag: "100% Vetted",
  },
  {
    icon: Lock,
    title: "Secure Payments",
    description:
      "Your payment data never touches our servers. We use bank-grade encryption and trusted payment processors so every transaction is completely safe.",
    accent: "#845EF7",
    tag: "256-bit SSL",
  },
  {
    icon: BadgeCheck,
    title: "Authentic Reviews",
    description:
      "Only verified bookers can leave reviews. No fake ratings, no pay-to-rank. What you read is what real travelers genuinely experienced.",
    accent: "#00C9A7",
    tag: "Verified only",
  },
  {
    icon: HeartHandshake,
    title: "Satisfaction Promise",
    description:
      "Something didn't go as planned? We'll make it right — with a full refund or a free rebooking. No questions asked, no hoops to jump through.",
    accent: "#FF6B35",
    tag: "Money-back",
  },
  {
    icon: Headphones,
    title: "24/7 Live Support",
    description:
      "Real humans, real help — any time of day or night. Whether you're planning or mid-journey, our support team is always a tap away.",
    accent: "#845EF7",
    tag: "Always on",
  },
  {
    icon: Globe,
    title: "Global Coverage",
    description:
      "Operating across 50+ countries, WayLink connects you with trusted local providers wherever your journey takes you — near or far.",
    accent: "#00C9A7",
    tag: "50+ countries",
  },
];
