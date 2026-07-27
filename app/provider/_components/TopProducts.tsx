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
          <div className="flex min-h-55 flex-col items-center justify-center rounded-md bg-linear-to-br from-muted/30 via-transparent to-muted/10 px-3">
            <div className="relative mb-6 flex items-center justify-center">
              <div className="absolute -left-12 -rotate-12 rounded-lg border border-primary/15 bg-primary/5 p-2">
                <PackageOpen className="size-5 text-primary/40" />
              </div>

              <div className="absolute -right-12 rotate-12 rounded-lg border border-amber-500/15 bg-amber-500/5 p-2">
                <Star className="size-5 fill-amber-500/30 text-amber-500/40" />
              </div>

              <div className="absolute -top-5 left-1 h-2 w-2 rounded-full bg-primary/30" />
              <div className="absolute -bottom-4 -left-5 h-1.5 w-1.5 rounded-full bg-emerald-500/30" />
              <div className="absolute top-2 -right-5 h-2 w-2 rounded-full bg-amber-500/30" />

              <div className="relative flex size-12 items-center justify-center rounded-full bg-transparent">
                <PackageOpen className="size-6 text-primary" />
              </div>
            </div>

            <h3 className="mt-3 text-base font-semibold">No products yet</h3>

            <p className="mt-2 max-w-xs text-center text-sm text-muted-foreground">
              Your highest-performing products will appear here once customers
              begin making bookings.
            </p>
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
