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

const MOCK: TopProvider[] = [
  {
    id: "1",
    name: "Elevate Cleaning Solutions",
    slug: "elevate-cleaning",
    logo: "https://i.pravatar.cc/150?u=1",
    serviceType: "experience",
    businessType: "company",
    isVerified: true,
    totalRevenue: 145200,
    totalBookings: 1240,
    totalProducts: 12,
    totalReviews: 845,
    avgRating: 4.9,
    joinedAt: "2023-01-15",
  },
  {
    id: "2",
    name: "Sarah Jenkins Design",
    slug: "sarah-jenkins-design",
    logo: "https://i.pravatar.cc/150?u=2",
    serviceType: "transport",
    businessType: "individual",
    isVerified: true,
    totalRevenue: 98500,
    totalBookings: 320,
    totalProducts: 5,
    totalReviews: 156,
    avgRating: 4.7,
    joinedAt: "2023-06-22",
  },
  {
    id: "3",
    name: "Nexus Tech Repair",
    slug: "nexus-tech",
    logo: null, // Testing the fallback avatar
    serviceType: "transport",
    businessType: "agency",
    isVerified: false,
    totalRevenue: 76400,
    totalBookings: 890,
    totalProducts: 24,
    totalReviews: 432,
    avgRating: 4.5,
    joinedAt: "2024-02-10",
  },
  {
    id: "4",
    name: "GreenThumb Landscaping",
    slug: "greenthumb",
    logo: "https://i.pravatar.cc/150?u=4",
    serviceType: "experience",
    businessType: "company",
    isVerified: true,
    totalRevenue: 52100,
    totalBookings: 410,
    totalProducts: 8,
    totalReviews: 210,
    avgRating: 4.8,
    joinedAt: "2024-04-05",
  },
];

export function TopProviders({
  providers = MOCK,
}: {
  providers?: TopProvider[];
}) {
  return (
    <Card className="border bg-card/50 h-full p-0 flex flex-col">
      <CardHeader className="p-0">
        <div className="flex items-center justify-between px-4 pt-4">
          <div>
            <CardTitle className="text-xl font-bold tracking-tight text-foreground">
              Top Providers
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground mt-1">
              Highest earning partners in the platform
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-emerald-500/10 text-emerald-500 text-sm font-medium">
            <TrendingUp className="h-4 w-4" />
            <span>Revenue</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0 flex-1 overflow-auto">
        <div className="flex flex-col divide-y divide-border">
          {providers.map((provider, index) => (
            <ProviderRow
              key={provider.id}
              provider={provider}
              rank={index + 1}
            />
          ))}
        </div>
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
