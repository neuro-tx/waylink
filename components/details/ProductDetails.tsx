"use client";

import useProduct from "@/hooks/useProduct";
import { MediaGallery } from "./MediaGallery";
import {
  Compass,
  Shield,
  Users,
  CalendarDays,
  Star,
  AlertCircle,
} from "lucide-react";
import { ExperienceSections, Section, TransportSections } from "./ProductInfo";
import { Alert, AlertDescription } from "../ui/alert";
import { ReviewsList } from "./Reviews";
import { VariantList } from "./Variants";
import { MainInfo } from "./MainInfo";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

function fmtPrice(amount: string, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(
    Number(amount),
  );
}

function GallerySkeleton() {
  return (
    <div className="grid grid-cols-4 grid-rows-2 gap-2 h-105">
      <Skeleton className="col-span-2 row-span-2 rounded-xl" />
      <Skeleton className="rounded-xl" />
      <Skeleton className="rounded-xl" />
      <Skeleton className="rounded-xl" />
      <Skeleton className="rounded-xl" />
    </div>
  );
}

function MainInfoSkeleton() {
  return (
    <div className="space-y-3">
      <div className="flex gap-2 pt-1">
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-24 rounded-full" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <Skeleton className="h-8 w-2/3 rounded-lg" />
      <Skeleton className="h-4 w-1/3 rounded-lg" />
      <Skeleton className="h-4 w-1/4 rounded-lg" />
    </div>
  );
}

function SectionSkeleton() {
  return (
    <div className="space-y-2 py-3 px-5 bg-card/50 border border-border rounded-lg">
      <Skeleton className="h-4 w-24 rounded" />
      <Skeleton className="h-3 w-full rounded" />
      <Skeleton className="h-3 w-5/6 rounded" />
      <Skeleton className="h-3 w-4/6 rounded" />
    </div>
  );
}

function PriceBannerSkeleton() {
  return (
    <div className="flex items-center justify-between gap-3 py-3 px-5 bg-card/50 border border-border rounded-lg">
      <div className="space-y-1.5">
        <Skeleton className="h-3 w-20 rounded" />
        <Skeleton className="h-6 w-28 rounded" />
      </div>
      <Skeleton className="h-4 w-32 rounded" />
    </div>
  );
}

function TabsSkeleton() {
  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Skeleton className="h-10 w-32 rounded-lg" />
        <Skeleton className="h-10 w-32 rounded-lg" />
      </div>
      <div className="space-y-3 pt-2">
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-24 w-full rounded-xl" />
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="w-full overflow-x-hidden pt-28 pb-20">
      <div className="mian-container space-y-6">
        <GallerySkeleton />
        <MainInfoSkeleton />
        <div className="space-y-3">
          <SectionSkeleton />
          <PriceBannerSkeleton />
        </div>
        <TabsSkeleton />
      </div>
    </div>
  );
}

function ErrorState() {
  return (
    <div className="w-full overflow-x-hidden pt-28 pb-20">
      <div className="mian-container">
        <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950 flex items-center justify-center">
            <AlertCircle className="size-6 text-red-500" />
          </div>
          <div className="space-y-1">
            <p className="text-base font-medium">Failed to load product</p>
            <p className="text-sm text-muted-foreground max-w-xs">
              Something went wrong while fetching this listing. Please try
              again.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductContent({
  product,
  exeperinceDetails,
  reviews,
  transportDetails,
  variants,
}: Omit<ReturnType<typeof useProduct>, "state">) {
  if (!product) return null;

  return (
    <div className="w-full overflow-x-hidden pt-28 pb-20">
      <div className="mian-container space-y-6">
        <MediaGallery media={product.media} />

        <MainInfo product={product} exeperinceDetails={exeperinceDetails} />

        <div className="space-y-3">
          <Section title="About" icon={Compass}>
            <p className="text-base text-muted-foreground leading-relaxed">
              {product.description}
            </p>
          </Section>

          {variants.length > 0 && (
            <div className="flex items-center justify-between gap-3 py-3 px-5 bg-card/50 border border-border rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">Starting from</p>
                <p className="text-lg font-bold">
                  {fmtPrice(product.basePrice, product.currency)}
                </p>
              </div>
              <div className="flex text-sm items-center gap-2 text-muted-foreground">
                <Users className="size-3.5" />
                {variants.length} date{variants.length !== 1 ? "s" : ""}{" "}
                available
              </div>
            </div>
          )}
        </div>

        {product.type === "experience" && exeperinceDetails && (
          <ExperienceSections exp={exeperinceDetails} />
        )}
        {product.type === "transport" && transportDetails && (
          <TransportSections tr={transportDetails} />
        )}

        <Tabs defaultValue="variants" className="w-full">
          <TabsList>
            <TabsTrigger value="variants" className="gap-2 py-4 px-6">
              <CalendarDays className="size-4" />
              Variants
            </TabsTrigger>
            <TabsTrigger value="reviews" className="gap-2 py-4 px-6">
              <Star className="size-4" />
              Reviews
            </TabsTrigger>
          </TabsList>

          <TabsContent value="variants" className="mt-4">
            <VariantList variants={variants} />
          </TabsContent>
          <TabsContent value="reviews" className="mt-4">
            <ReviewsList reviews={reviews} />
          </TabsContent>
        </Tabs>

        <Alert>
          <Shield className="size-6 text-emerald-500 shrink-0" />
          <AlertDescription className="text-sm">
            Offered by{" "}
            <span className="font-medium text-foreground">
              {product.provider.name}
            </span>
            . All bookings are protected and managed securely through the
            platform.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}

const ProductDetails = ({ productId }: { productId: string }) => {
  const {
    product,
    exeperinceDetails,
    reviews,
    transportDetails,
    variants,
    state,
  } = useProduct(productId);

  if (state === "loading" || state === "idle") return <LoadingSkeleton />;
  if (state === "error") return <ErrorState />;

  return (
    <ProductContent
      product={product}
      exeperinceDetails={exeperinceDetails}
      reviews={reviews}
      transportDetails={transportDetails}
      variants={variants}
    />
  );
};

export default ProductDetails;
