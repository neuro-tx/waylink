import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Star,
  Package,
  Calendar,
  TrendingUp,
  Building2,
  User,
  Briefcase,
  Users,
} from "lucide-react";
import { TopProvider } from "@/lib/admin-types";
import { fmtCurrency } from "@/lib/helpers";
import ThumbnailImage from "@/components/ThumbnailImage";
import { cn } from "@/lib/utils";
import Link from "next/link";

const fmtCompact = (val: number) =>
  new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(val);

export function TopProviders({ providers }: { providers: TopProvider[] }) {
  const isEmpty = providers.length === 0;

  return (
    <Card className="border bg-background h-full p-0 flex flex-col">
      <CardHeader className="p-0">
        <div className="flex items-center justify-between px-5 pt-5">
          <div>
            <CardTitle className="font-bold tracking-tight text-foreground">
              Top Providers
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground mt-1">
              Highest earning partners in the platform
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-emerald-500/10 text-emerald-500 text-xs font-medium">
            <TrendingUp className="h-4 w-4" />
            <span>Revenue</span>
          </div>
        </div>
      </CardHeader>

      <CardContent
        className={cn("flex-1 overflow-auto", isEmpty ? "p-5" : "p-0")}
      >
        {isEmpty ? (
          <div className="flex min-h-55 flex-col items-center justify-center rounded-md bg-linear-to-br from-muted/30 via-transparent to-muted/10 px-6">
            <div className="relative mb-6 flex items-center justify-center">
              <div className="absolute -left-12 rounded-full border border-blue-500/15 bg-blue-500/5 p-2">
                <Users className="size-5 text-blue-500/40" />
              </div>

              <div className="absolute -right-12 rounded-full border border-emerald-500/15 bg-emerald-500/5 p-2">
                <TrendingUp className="size-5 text-emerald-500/40" />
              </div>

              <div className="absolute -top-5 left-1 h-2 w-2 rounded-full bg-blue-500/30" />
              <div className="absolute -bottom-4 -left-5 h-1.5 w-1.5 rounded-full bg-emerald-500/30" />
              <div className="absolute top-2 -right-5 h-2 w-2 rounded-full bg-violet-500/30" />

              <div className="relative flex size-12 items-center justify-center rounded-full bg-transparent">
                <Users className="size-6 text-emerald-500" />
              </div>
            </div>

            <h3 className="mt-3 text-base font-semibold">No providers yet</h3>

            <p className="mt-2 max-w-xs text-center text-sm text-muted-foreground">
              Provider rankings will appear once businesses join your platform
              and begin receiving bookings.
            </p>
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-border">
            {providers.map((provider, index) => (
              <ProviderRow
                key={provider.id}
                provider={provider}
                rank={index + 1}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ProviderRow({
  provider,
  rank,
}: {
  provider: TopProvider;
  rank: number;
}) {
  const typeConfig = {
    individual: {
      color: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
      icon: User,
    },
    company: {
      color: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
      icon: Building2,
    },
    agency: {
      color: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
      icon: Briefcase,
    },
  };
  const TypeIcon = typeConfig[provider.businessType].icon;

  const rankColors: Record<number, string> = {
    1: "text-yellow-500",
    2: "text-slate-500",
    3: "text-orange-500",
  };
  const rankStyle = rankColors[rank] || "text-muted-foreground";

  return (
    <div className="group flex flex-col sm:flex-row sm:items-center justify-between px-4 py-3 gap-4 transition-colors hover:bg-muted/30">
      <div className="flex items-center gap-3">
        <div className={cn("text-base font-bold", rankStyle)}>#{rank}</div>

        <ThumbnailImage
          src={provider.logo}
          alternative={provider.name}
          className="size-10 rounded-full"
        />

        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h4 className="text-base font-semibold text-foreground">
              <Link
                href={`/admin/provider_management/${provider.id}?slug=${provider.slug}`}
              >
                {provider.name}
              </Link>
            </h4>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="capitalize">{provider.serviceType}</span>
            <span className="h-1 w-1 rounded-full bg-muted-foreground" />
            <div
              className={`flex items-center gap-1 px-1.5 py-0.5 rounded-sm text-[10px] font-medium uppercase tracking-wider ${
                typeConfig[provider.businessType].color
              }`}
            >
              <TypeIcon className="h-3 w-3" />
              {provider.businessType}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-start gap-5 ml-11 sm:ml-0">
        <div className="flex items-center gap-4 text-muted-foreground text-sm">
          <div className="flex items-center gap-1.5" title="Average Rating">
            <Star className="h-4 w-4 text-amber-400" fill="currentColor" />
            <span className="font-medium text-foreground">
              {provider.avgRating}
            </span>
            <span className="text-xs">
              ({fmtCompact(provider.totalReviews)})
            </span>
          </div>

          <div
            className="hidden md:flex items-center gap-1.5"
            title="Total Bookings"
          >
            <Calendar className="h-4 w-4" />
            <span className="font-medium text-foreground">
              {fmtCompact(provider.totalBookings)}
            </span>
          </div>

          <div
            className="hidden lg:flex items-center gap-1.5"
            title="Active Products"
          >
            <Package className="h-4 w-4" />
            <span className="font-medium text-foreground">
              {provider.totalProducts}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-end min-w-22">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Revenue
          </span>
          <span className="text-sm font-semibold text-foreground">
            {fmtCurrency(provider.totalRevenue)}
          </span>
        </div>
      </div>
    </div>
  );
}
