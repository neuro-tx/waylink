import FeaturedGrid from "./FeaturedGrid";
import { PackageSearch, AlertTriangle } from "lucide-react";

export function FeaturedExp() {
  return (
    <section className="w-full my-14">
      <div className="py-24 mian-container space-y-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <h2 className="text-5xl md:text-7xl font-bold leading-none text-stone-900 dark:text-white">
            Featured
            <br />
            <span className="italic text-transparent bg-clip-text bg-linear-to-r from-rose-500 via-amber-400 to-violet-500 dark:from-rose-400 dark:via-amber-300 dark:to-violet-400">
              Experiences
            </span>
          </h2>
          <p
            style={{ fontFamily: "'Georgia', serif", fontStyle: "italic" }}
            className="text-lg max-w-xs leading-relaxed text-muted-foreground"
          >
            Extraordinary moments curated from every corner of the world.
          </p>
        </div>

        <FeaturedExpContent />
      </div>
    </section>
  );
}

async function FeaturedExpContent() {
  try {
    const url = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const res = await fetch(`${url}/api/product?loc=true`, {
      next: { revalidate: 100 },
    });

    if (!res.ok) {
      throw new Error("Failed to fetch products");
    }

    const data = await res.json();

    if (!data?.data?.length) {
      return <EmptyState />;
    }

    return <FeaturedGrid products={data.data} />;
  } catch (error) {
    console.error("[FeaturedExp Error]:", error);

    return <ErrorState />;
  }
}

function EmptyState() {
  return (
    <div className="text-center border border-lime-500 border-dashed bg-linear-to-br from-lime-500/10 to-emerald-500/5 rounded-3xl p-10 backdrop-blur-sm shadow-sm">
      <div className="flex justify-center mb-5">
        <div className="p-4 rounded-full bg-lime-500/15">
          <PackageSearch className="w-8 h-8 text-lime-500" />
        </div>
      </div>
      <h3 className="text-2xl font-semibold text-lime-600 mb-3">
        No Experiences Found
      </h3>
      <p className="text-sm text-muted-foreground leading-relaxed">
        We couldn&apos;t find any available experiences at the moment. Try
        adjusting your filters or check back later — new routes are added
        frequently.
      </p>
    </div>
  );
}

function ErrorState() {
  return (
    <div className="text-center border border-dashed border-red-500 bg-linear-to-br from-red-500/10 to-rose-500/5 rounded-3xl p-10 backdrop-blur-sm shadow-sm">
      <div className="flex justify-center mb-5">
        <div className="p-4 rounded-full bg-red-500/15">
          <AlertTriangle className="w-8 h-8 text-red-500" />
        </div>
      </div>
      <h3 className="text-2xl font-semibold text-red-600 mb-3">
        Unable to Load Experiences
      </h3>
      <p className="text-sm text-muted-foreground leading-relaxed">
        Something unexpected happened while loading experiences. This could be a
        temporary issue with the server or your connection.
      </p>
    </div>
  );
}
