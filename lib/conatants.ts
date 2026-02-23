import {
  UserRound,
  Sparkles,
  CalendarDays,
  Send,
  Star,
  LucideIcon,
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
