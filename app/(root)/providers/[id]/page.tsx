import { ProviderPublicView } from "@/components/provider/ProviderPublicView";
import { Provider, ProviderStats } from "@/lib/all-types";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { AlertTriangle, RefreshCcw, Home } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface PageProps {
  params: Promise<{ id: string }>;
}

type FetchResult =
  | { ok: true; data: ProviderData }
  | { ok: false; reason: "not_found" }
  | { ok: false; reason: "error"; message: string };

interface ProviderData {
  provider: Provider;
  status: {
    reviews: any[];
    stats: ProviderStats
  };
}

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

async function getProviderData(id: string): Promise<FetchResult> {
  try {
    const res = await fetch(`${BASE_URL}/api/provider/${id}`, {
      cache: "no-store",
    });

    if (res.status === 404) {
      return { ok: false, reason: "not_found" };
    }

    if (!res.ok) {
      return {
        ok: false,
        reason: "error",
        message: `Server responded with ${res.status}`,
      };
    }

    let json: { data?: ProviderData };
    try {
      json = await res.json();
    } catch {
      return { ok: false, reason: "error", message: "Invalid JSON response" };
    }

    if (!json?.data?.provider) {
      return { ok: false, reason: "not_found" };
    }

    return { ok: true, data: json.data as ProviderData };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected network error";
    return { ok: false, reason: "error", message };
  }
}

function ProviderErrorView({ message }: { message: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-waylink-fade px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="mx-auto size-16 rounded-2xl bg-destructive/10 flex items-center justify-center">
          <AlertTriangle className="size-8 text-destructive" />
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-semibold text-foreground tracking-tight">
            Something went wrong
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            We couldn&apos;t load this provider page. This is likely a temporary
            issue — please try again in a moment.
          </p>
          {process.env.NODE_ENV === "development" && (
            <p className="mt-3 text-xs font-mono bg-muted text-muted-foreground px-3 py-2 rounded-lg text-left break-all">
              {message}
            </p>
          )}
        </div>

        <div className="flex items-center justify-center gap-3">
          <ReloadButton />
          <Button variant="outline" size="sm" asChild>
            <Link href="/">
              <Home className="size-3.5 mr-1.5" />
              Go home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

function ReloadButton() {
  return (
    <form action="" onSubmit={undefined} method="get">
      <Button size="sm" type="submit" className="gap-1.5">
        <RefreshCcw className="size-3.5" />
        Try again
      </Button>
    </form>
  );
}

export default async function ProviderPage({ params }: PageProps) {
  const { id } = await params;

  if (!id?.trim()) {
    notFound();
  }

  const result = await getProviderData(id);

  if (!result.ok && result.reason === "not_found") {
    notFound();
  }

  if (!result.ok) {
    return <ProviderErrorView message={result.message} />;
  }

  const { data } = result;
  const reviews = data.status?.reviews ?? [];
  const stats = data.status?.stats ?? {
    avgRating: "0" ,
    fiveStar: 0,
    fourStar: 0,
    oneStar: 0,
    threeStar: 0,
    totalReviews: 0 ,
    totalServices: 0 ,
    twoStar: 0
  };

  return (
    <ProviderPublicView
      provider={data.provider}
      stats={stats}
      reviews={reviews}
    />
  );
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const fallback: Metadata = {
    title: "Provider · BlueHorizon",
    description: "Discover trusted providers on BlueHorizon",
  };

  const { id } = await params;
  if (!id?.trim()) return fallback;

  const result = await getProviderData(id);

  if (!result.ok) {
    return result.reason === "not_found"
      ? {
          title: "Provider not found · BlueHorizon",
          description: "This provider could not be found.",
        }
      : fallback;
  }

  const { provider } = result.data;

  return {
    title: `${provider.name} · BlueHorizon`,
    description: provider.description ?? `Book services with ${provider.name}`,
    openGraph: {
      images: provider.logo ? [provider.logo] : [],
    },
  };
}
