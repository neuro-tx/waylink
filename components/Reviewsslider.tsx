"use client";

import { useRef, useState } from "react";
import { useInView, motion, Variants } from "framer-motion";
import { Star } from "lucide-react";
import { Review } from "@/lib/conatants";

const rowOne: Review[] = [
  {
    name: "Sara M.",
    location: "Dubai, UAE",
    avatar: "SM",
    rating: 5,
    text: "WayLink made our trip seamless. Booked a desert safari and private transfer — both flawless. I felt safe every step of the way.",
    accent: "#FF6B35",
    experience: "Desert Safari",
  },
  {
    name: "James T.",
    location: "London, UK",
    avatar: "JT",
    rating: 5,
    text: "The verified reviews saved me from a bad choice and led me to the most incredible boat tour. Completely trustworthy platform.",
    accent: "#845EF7",
    experience: "Boat Tour",
  },
  {
    name: "Aiko N.",
    location: "Tokyo, Japan",
    avatar: "AN",
    rating: 5,
    text: "24/7 support is no joke — they helped me rebook after a cancellation at midnight. Absolute legends. Won't use anything else.",
    accent: "#00C9A7",
    experience: "City Tour",
  },
  {
    name: "Lucas B.",
    location: "São Paulo, Brazil",
    avatar: "LB",
    rating: 5,
    text: "Found an amazing cooking class through WayLink and the transport was already included. Everything just worked. No stress at all.",
    accent: "#FF6B35",
    experience: "Cooking Class",
  },
  {
    name: "Priya K.",
    location: "Mumbai, India",
    avatar: "PK",
    rating: 5,
    text: "I booked a private heritage walk and a cab through WayLink on the same app. The seamless experience blew my mind.",
    accent: "#845EF7",
    experience: "Heritage Walk",
  },
];

const rowTwo: Review[] = [
  {
    name: "Elena V.",
    location: "Rome, Italy",
    avatar: "EV",
    rating: 5,
    text: "After a bad experience with another platform, a friend recommended WayLink. Night and day difference. The providers are genuinely vetted.",
    accent: "#00C9A7",
    experience: "Wine Tasting",
  },
  {
    name: "Omar S.",
    location: "Cairo, Egypt",
    avatar: "OS",
    rating: 5,
    text: "Booked a Nile cruise through WayLink last minute and it was perfect. The real-time availability feature is a game changer.",
    accent: "#FF6B35",
    experience: "Nile Cruise",
  },
  {
    name: "Mei L.",
    location: "Singapore",
    avatar: "ML",
    rating: 5,
    text: "WayLink's suggestion engine knew exactly what I'd love. Every single recommendation was spot-on. Like having a personal travel concierge.",
    accent: "#845EF7",
    experience: "Food Tour",
  },
  {
    name: "Noah W.",
    location: "New York, USA",
    avatar: "NW",
    rating: 5,
    text: "The satisfaction guarantee actually works — I got a full refund when a provider cancelled on short notice. No questions asked, just done.",
    accent: "#00C9A7",
    experience: "Skyline Tour",
  },
  {
    name: "Fatima H.",
    location: "Casablanca, Morocco",
    avatar: "FH",
    rating: 5,
    text: "The mountain trek booking was so easy and the guide was incredible. WayLink found me an experience I never would have discovered alone.",
    accent: "#FF6B35",
    experience: "Mountain Trek",
  },
];

const headerVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="relative shrink-0 w-80 rounded-2xl border p-5 flex flex-col gap-3 overflow-hidden bg-white/60 dark:bg-[#16161e]/60 border-[#e8e4de] dark:border-[#2a2930] backdrop-blur-sm select-none">
      <div
        className="absolute -top-5 -right-5 w-20 h-20 rounded-full opacity-20 pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${review.accent} 0%, transparent 70%)`,
          filter: "blur(14px)",
        }}
      />

      <div className="flex items-center justify-between">
        <div className="flex gap-0.5">
          {Array.from({ length: review.rating }).map((_, i) => (
            <span
              key={i}
              style={{ color: review.accent }}
              className="text-sm leading-none"
            >
              <Star size={15} />
            </span>
          ))}
        </div>
        <span
          className="text-xs px-2.5 py-0.5 rounded-full font-semibold"
          style={{ background: `${review.accent}15`, color: review.accent }}
        >
          {review.experience}
        </span>
      </div>

      <p className="text-sm leading-relaxed text-[#4a4744] dark:text-[#c0bdb8] flex-1 relative z-10">
        &ldquo;{review.text}&rdquo;
      </p>

      <div className="flex items-center gap-3 relative z-10">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
          style={{
            background: `linear-gradient(135deg, ${review.accent}, ${review.accent}88)`,
          }}
        >
          {review.avatar}
        </div>
        <div>
          <p className="text-sm font-semibold leading-none text-[#1a1814] dark:text-[#f0eee8]">
            {review.name}
          </p>
          <p className="text-xs text-[#9b9690] mt-0.5">{review.location}</p>
        </div>
      </div>

      <div
        className="absolute bottom-0 left-0 h-0.5 w-1/2 rounded-full"
        style={{
          background: `linear-gradient(to right, ${review.accent}, ${review.accent}00)`,
        }}
      />
    </div>
  );
}

interface MarqueeRowProps {
  reviews: Review[];
  direction: "left" | "right";
}

function MarqueeRow({ reviews, direction }: MarqueeRowProps) {
  const [paused, setPaused] = useState<boolean>(false);
  const pointerStartX = useRef<number>(0);
  const pointerStartScroll = useRef<number>(0);
  const dragging = useRef<boolean>(false);
  const trackRef = useRef<HTMLDivElement>(null);

  const items = [...reviews, ...reviews, ...reviews];
  const duration = reviews.length * 9;

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    dragging.current = true;
    pointerStartX.current = e.clientX;
    pointerStartScroll.current = trackRef.current?.scrollLeft ?? 0;
    setPaused(true);
    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging.current || !trackRef.current) return;
    const delta = pointerStartX.current - e.clientX;
    trackRef.current.scrollLeft = pointerStartScroll.current + delta;
  };

  const onPointerUp = () => {
    dragging.current = false;
    setTimeout(() => setPaused(false), 700);
  };

  const animClass =
    direction === "left" ? "waylink-marquee-left" : "waylink-marquee-right";

  return (
    <div className="relative w-full overflow-hidden">
      <div
        className="absolute left-0 top-0 h-full w-20 z-10 pointer-events-none"
        style={{
          background:
            "linear-gradient(to right, var(--waylink-fade, #f8f6f1) 0%, transparent 100%)",
        }}
      />
      <div
        className="absolute right-0 top-0 h-full w-20 z-10 pointer-events-none"
        style={{
          background:
            "linear-gradient(to left, var(--waylink-fade, #f8f6f1) 0%, transparent 100%)",
        }}
      />

      <div
        ref={trackRef}
        className={`flex gap-4 w-max cursor-grab active:cursor-grabbing ${animClass} ${
          paused ? "waylink-paused" : ""
        }`}
        style={{ "--dur": `${duration}s` } as React.CSSProperties}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      >
        {items.map((review, i) => (
          <ReviewCard key={`${review.name}-${i}`} review={review} />
        ))}
      </div>
    </div>
  );
}

export default function ReviewsSlider() {
  const headerRef = useRef<HTMLDivElement>(null);
  const headerInView = useInView(headerRef, { once: true, margin: "-60px" });

  const sliderRef = useRef<HTMLDivElement>(null);
  const sliderInView = useInView(sliderRef, { once: true, margin: "-60px" });

  const totalReviews = rowOne.length + rowTwo.length;

  return (
    <div className="w-full">
      <motion.div
        ref={headerRef}
        variants={headerVariants}
        initial="hidden"
        animate={headerInView ? "visible" : "hidden"}
        className="mb-10 text-center"
      >
        <p
          className="text-xs font-bold tracking-[0.2em] uppercase mb-2"
          style={{ color: "#FF6B35" }}
        >
          Real Voices
        </p>
        <h3
          className="text-2xl md:text-3xl font-extrabold text-[#1a1814] dark:text-[#f0eee8]"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          Trusted by Travelers Worldwide
        </h3>
        <p className="text-sm mt-2 text-[#6b6560] dark:text-[#6a6870]">
          {totalReviews} verified reviews — drag to explore
        </p>
      </motion.div>

      <motion.div
        ref={sliderRef}
        initial={{ opacity: 0, y: 20 }}
        animate={sliderInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col gap-5"
      >
        <MarqueeRow reviews={rowOne} direction="left" />
        <MarqueeRow reviews={rowTwo} direction="right" />
      </motion.div>
    </div>
  );
}
