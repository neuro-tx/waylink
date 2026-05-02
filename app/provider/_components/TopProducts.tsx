import { Star, PackageOpen } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TopProduct } from "@/lib/panel-types";
import { fmtCurrency } from "@/lib/helpers";

export function TopProducts({ products }: { products: TopProduct[] }) {
  const maxRevenue =
    products.length > 0 ? Math.max(...products.map((p) => p.revenue)) : 1;

  return (
    <Card className="border-border/60">
      <CardHeader>
        <CardTitle className="text-xl font-semibold tracking-tight">
          Top Assets
        </CardTitle>
        <CardDescription className="text-sm">
          Highest impact offerings by revenue.
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1">
        {products.length === 0 ? (
          <div className="flex h-full min-h-62.5 flex-col items-center justify-center space-y-3 rounded-xl border border-dashed border-border p-6 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-muted">
              <PackageOpen
                className="size-6 text-muted-foreground"
                aria-hidden="true"
              />
            </div>
            <div>
              <p className="text-sm font-semibold">No assets found</p>
              <p className="text-xs text-muted-foreground max-w-50 mt-1">
                Your top performing assets will appear here once you have
                bookings.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {products.map((product, index) => (
              <div
                key={product.id}
                className="group relative flex items-center justify-between gap-4 overflow-hidden rounded-xl border border-transparent p-3 transition-colors hover:border-border/50 hover:bg-muted/20"
              >
                <div
                  className="absolute inset-y-0 left-0 -z-10 rounded-xl bg-primary/5 transition-all duration-500 ease-out group-hover:bg-primary/10"
                  style={{
                    width: `${(product.revenue / maxRevenue) * 100}%`,
                  }}
                  aria-hidden="true"
                />

                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-md border border-border/50 bg-background/50 text-xs font-bold text-muted-foreground shadow-sm transition-colors group-hover:text-foreground">
                    {index + 1}
                  </div>

                  <div className="min-w-0 space-y-1.5">
                    <p className="truncate text-sm font-semibold leading-none text-foreground">
                      {product.name}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-0.5 rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-amber-600 dark:text-amber-500">
                        <Star className="size-2.5 fill-amber-500" />
                        {product.avgRating.toFixed(1)}
                      </span>
                      <span>•</span>
                      <span className="truncate tracking-tight">
                        {product.bookings} bookings
                      </span>
                    </div>
                  </div>
                </div>

                <div className="shrink-0 pl-2 text-right">
                  <div className="text-sm font-bold tracking-tight text-foreground">
                    {fmtCurrency(product.revenue)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
