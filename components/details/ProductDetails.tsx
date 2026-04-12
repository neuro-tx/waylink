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
  Plus,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { ExperienceSections, Section, TransportSections } from "./ProductInfo";
import { Alert, AlertDescription } from "../ui/alert";
import { ReviewsList } from "./Reviews";
import { VariantList } from "./Variants";
import { MainInfo } from "./MainInfo";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import React, { useEffect, useState, useTransition } from "react";
import { Loader, MessageSquareText, ShieldCheck, Sparkles } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { useReview } from "@/hooks/useReview";

type ReviewFormValues = z.infer<typeof reviewSchema>;

const RATING_LABELS: Record<number, string> = {
  1: "Poor",
  2: "Fair",
  3: "Good",
  4: "Very Good",
  5: "Excellent",
};

const reviewSchema = z.object({
  rating: z.number().min(1, "Please select a rating").max(5),
  comment: z
    .string()
    .trim()
    .min(10, "Your review must be at least 10 characters long.")
    .max(500, "Your review must be less than 500 characters."),
});

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
  experienceDetails,
  reviews,
  transportDetails,
  variants,
}: Omit<ReturnType<typeof useProduct>, "state" | "refetch">) {
  if (!product) return null;

  return (
    <div className="w-full overflow-x-hidden pt-28 pb-20">
      <div className="mian-container space-y-6">
        <MediaGallery media={product.media} />

        <MainInfo product={product} exeperinceDetails={experienceDetails} />

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

        {product.type === "experience" && experienceDetails && (
          <ExperienceSections exp={experienceDetails} />
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

export function ProductDetails({ productId }: { productId: string }) {
  const {
    product,
    experienceDetails,
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
      experienceDetails={experienceDetails}
      reviews={reviews}
      transportDetails={transportDetails}
      variants={variants}
    />
  );
}

function StarRating({
  value,
  hovered,
  onChange,
  onHover,
  onLeave,
}: {
  value: number;
  hovered: number;
  onChange: (rating: number) => void;
  onHover: (rating: number) => void;
  onLeave: () => void;
}) {
  const activeValue = hovered || value;

  return (
    <div className="space-y-3">
      <div className="flex justify-center gap-2">
        {[1, 2, 3, 4, 5].map((star) => {
          const active = activeValue >= star;
          return (
            <button
              key={star}
              type="button"
              onClick={() => onChange(star)}
              onMouseEnter={() => onHover(star)}
              onMouseLeave={onLeave}
              aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
              className="rounded-xl p-1 transition-transform duration-200 hover:scale-110 active:scale-95"
            >
              <Star
                className={cn(
                  "size-7 transition-all duration-200",
                  active
                    ? "fill-yellow-400 text-yellow-400"
                    : "fill-transparent text-muted-foreground/30",
                )}
              />
            </button>
          );
        })}
      </div>

      <p className="text-center text-sm font-medium text-muted-foreground transition-all">
        {activeValue ? RATING_LABELS[activeValue] : "Select a rating"}
      </p>
    </div>
  );
}

export function ReviewProduct({ productId }: { productId: string }) {
  const [hoveredRating, setHoveredRating] = useState(0);
  const [submitState, setSubmitState] = useState<"idle" | "success" | "error">(
    "idle",
  );
  const [submittedRating, setSubmittedRating] = useState(0);
  const [pending, startTransition] = useTransition();
  const { create, error: reviewError } = useReview();

  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { rating: 0, comment: "" },
    mode: "onChange",
  });

  const { comment: commentValue, rating: ratingValue } = form.watch();

  useEffect(() => {
    if (reviewError) setSubmitState("error");
  }, [reviewError]);

  function onSubmit(values: ReviewFormValues) {
    startTransition(async () => {
      try {
        await create(productId, values.comment, values.rating);
        setSubmittedRating(values.rating);
        form.reset({ rating: 0, comment: "" });
        setHoveredRating(0);
        setSubmitState("success");
      } catch {
        setSubmitState("error");
      }
    });
  }

  if (submitState === "success") {
    return (
      <div className="h-screen bg-background pt-24 pb-16 flex items-center justify-center">
        <main className="max-w-4xl px-4 md:px-6 mx-auto shrink-0 flex-1">
          <div className="rounded-3xl border bg-card shadow-sm flex flex-col items-center text-center px-6 py-16 gap-5">
            <div className="flex items-center justify-center size-16 rounded-full bg-emerald-50 dark:bg-emerald-950">
              <CheckCircle2 className="size-8 text-emerald-500" />
            </div>
            <div className="space-y-1.5 max-w-sm">
              <h2 className="text-xl font-semibold">Review submitted</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Thanks for your feedback — it helps other travellers make better
                decisions.
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={cn(
                    "size-5",
                    s <= submittedRating
                      ? "fill-yellow-400 text-yellow-400"
                      : "fill-transparent text-muted-foreground/20",
                  )}
                />
              ))}
              <span className="ml-1 font-medium text-foreground">
                {RATING_LABELS[submittedRating]}
              </span>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <main className="max-w-4xl px-4 md:px-6 mx-auto">
        {submitState === "error" && (
          <div className="flex items-start gap-2.5 mb-5 px-3 py-2.5 rounded-xl bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800">
            <AlertTriangle className="size-5 text-red-500 dark:text-red-400 mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-red-800 dark:text-red-300 mb-0.5">
                Submission failed
              </p>
              <p className="text-xs text-red-700 dark:text-red-400 leading-relaxed">
                {reviewError ?? "Something went wrong. Please try again."}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSubmitState("idle")}
              className="text-red-400 hover:text-red-600 dark:hover:text-red-300 shrink-0 text-xs"
            >
              ✕
            </button>
          </div>
        )}

        <section className="mb-8 rounded-3xl border bg-linear-to-b from-muted/40 to-background p-4 sm:p-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
                <Sparkles className="size-3 text-primary" />
                Verified purchase feedback
              </div>
              <h1 className="text-3xl font-bold tracking-tight">
                Share your experience
              </h1>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Your review helps other shoppers make better decisions and helps
                sellers improve their products.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border bg-card p-4">
                <div className="mb-2 flex items-center whitespace-nowrap gap-2 text-sm font-medium">
                  <MessageSquareText className="size-4 shrink-0 text-primary" />
                  Helpful reviews
                </div>
                <p className="text-xs leading-5 text-muted-foreground">
                  Be honest, specific, and useful.
                </p>
              </div>
              <div className="rounded-2xl border bg-card p-4">
                <div className="mb-2 flex items-center whitespace-nowrap gap-2 text-sm font-medium">
                  <ShieldCheck className="size-4 shrink-0 text-emerald-500" />
                  Trusted feedback
                </div>
                <p className="text-xs leading-5 text-muted-foreground">
                  Reviews are tied to the purchase context.
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-8">
          <section className="rounded-3xl border bg-card shadow-sm">
            <div className="border-b p-4 sm:p-6">
              <h2 className="text-lg font-semibold">Write a review</h2>
              <p className="text-sm text-muted-foreground">
                Rate the product and tell others what stood out.
              </p>
            </div>

            <div className="p-4 sm:p-6">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="rating"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">
                          Your rating
                        </FormLabel>
                        <FormControl>
                          <StarRating
                            value={field.value}
                            hovered={hoveredRating}
                            onChange={field.onChange}
                            onHover={setHoveredRating}
                            onLeave={() => setHoveredRating(0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Separator />

                  <FormField
                    control={form.control}
                    name="comment"
                    render={({ field }) => (
                      <FormItem>
                        <div className="mb-2 flex items-center justify-between gap-3">
                          <FormLabel className="text-sm font-medium">
                            Your review
                          </FormLabel>
                          <span className="text-xs text-muted-foreground">
                            {commentValue.length}/500
                          </span>
                        </div>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="What did you like? What could be better? Mention quality, delivery, packaging, or overall value."
                            className="min-h-20 resize-none rounded-xl bg-background"
                          />
                        </FormControl>
                        <p className="text-xs text-muted-foreground">
                          Tip: the most helpful reviews mention quality, fit,
                          delivery, or customer support.
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="text-xs text-muted-foreground">
                      {ratingValue > 0 ? (
                        <span>
                          You selected{" "}
                          <span className="font-medium text-foreground">
                            {ratingValue} star{ratingValue > 1 ? "s" : ""}
                          </span>
                          .
                        </span>
                      ) : (
                        <span>Select a star rating to continue.</span>
                      )}
                    </div>

                    <Button
                      type="submit"
                      disabled={pending}
                      className="cursor-pointer px-6"
                    >
                      {pending ? (
                        <>
                          <Loader className="size-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Plus className="w-4" />
                          Submit
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
