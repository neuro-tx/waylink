import { CircleFadingArrowUp, Sparkles, Star } from "lucide-react";
import { Button } from "./ui/button";
import Link from "next/link";

const Land = () => {
  return (
    <section className="py-20 px-4 w-full">
      <div
        aria-hidden
        className="absolute inset-0 isolate hidden opacity-65 contain-strict lg:block"
      >
        <div className="w-140 h-320 -translate-y-87.5 absolute left-0 top-0 -rotate-45 rounded-full bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,hsla(0,0%,85%,.08)_0,hsla(0,0%,55%,.02)_50%,hsla(0,0%,45%,0)_80%)]" />
        <div className="h-320 absolute left-0 top-0 w-60 -rotate-45 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,hsla(0,0%,85%,.06)_0,hsla(0,0%,45%,.02)_80%,transparent_100%)] [translate:5%_-50%]" />
        <div className="h-320 -translate-y-87.5 absolute left-0 top-0 w-60 -rotate-45 bg-[radial-gradient(50%_50%_at_50%_50%,hsla(0,0%,85%,.04)_0,hsla(0,0%,45%,.02)_80%,transparent_100%)]" />
        <div
          className="absolute bottom-28 right-20 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute inset-0 opacity-50"
          style={{
            backgroundImage: `
              linear-gradient(rgba(59, 130, 246, 0.15) 1px, transparent 1px),
              linear-gradient(90deg, rgba(59, 130, 246, 0.15) 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div className="container mx-auto h-full flex items-center justify-center flex-col space-y-8 relative z-10">
        <div className="relative">
          <div className="absolute -inset-1 bg-linear-to-r from-purple-500 to-cyan-500 rounded-full blur opacity-30 " />
          <span className="relative flex items-center gap-2 px-5 py-2 bg-white dark:bg-slate-900 border border-blue-200/50 dark:border-blue-800/50 rounded-full text-sm font-medium shadow-md backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-blue-10 dark:text-blue-20" />
            <span className="text-blue-10 dark:text-blue-20 font-semibold">
              Next-Gen Transport Platform
            </span>
          </span>
        </div>

        <h1 className="mx-auto max-w-4xl text-balance font-bold text-6xl md:text-[5.25rem] md:leading-24 text-center">
          <span className="block">Your Journey,</span>
          <span className="bg-linear-to-r from-purple-400 via-lime-400 to-purple-500 bg-clip-text text-transparent">
            Reimagined
          </span>
        </h1>
        <p className="mx-auto text-center max-w-2xl text-balance text-lg">
          Experience seamless travel with WayLink. Book trips, track transport
          in real-time, and connect with verified drivers worldwide.
        </p>

        <div className="flex flex-wrap justify-center gap-4 mt-5 items-center">
          <Button asChild size="lg">
            <Link href="/most-rating">
              <Star className="w-4 h-4" />
              <span>Browse Top rated</span>
            </Link>
          </Button>

          <Button asChild size="lg" variant="outline">
            <Link href="/become-provider">
              <CircleFadingArrowUp className="w-4 h-4" />
              <span>Become a Provider</span>
            </Link>
          </Button>
        </div>

        <div className="mt-7 grid gap-12 divide-y *:text-center md:grid-cols-3 md:gap-2 md:divide-x md:divide-y-0 w-3xl">
          <div className="space-y-4">
            <p className="text-5xl font-bold text-slate-900 dark:text-white">
              10K+
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Active Drivers
            </p>
          </div>
          <div className="space-y-4">
            <p className="text-5xl font-bold text-slate-900 dark:text-white">
              50K+
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Happy Customers
            </p>
          </div>
          <div className="space-y-4">
            <p className="text-5xl font-bold text-slate-900 dark:text-white">
              4.9★
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Average Rating
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Land;
