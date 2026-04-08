"use client";

import React, { useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Loader,
  MessageSquareText,
  ShieldCheck,
  Sparkles,
  Star,
} from "lucide-react";
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

const reviewSchema = z.object({
  rating: z.number().min(1, "Please select a rating").max(5),
  comment: z
    .string()
    .trim()
    .min(10, "Your review must be at least 10 characters long.")
    .max(500, "Your review must be less than 500 characters."),
});

type ReviewFormValues = z.infer<typeof reviewSchema>;

const RATING_LABELS: Record<number, string> = {
  1: "Poor",
  2: "Fair",
  3: "Good",
  4: "Very Good",
  5: "Excellent",
};

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

export default function ReviewPage() {
  const searchParams = useSearchParams();

  const productId = searchParams.get("productId") ?? "";
  const userId = searchParams.get("userId") ?? "";

  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 0,
      comment: "",
    },
    mode: "onChange",
  });

  const commentValue = form.watch("comment");
  const ratingValue = form.watch("rating");

  const canSubmit = productId && !isSubmitting;

  async function onSubmit(values: ReviewFormValues) {
    if (!productId) return;

    try {
      setIsSubmitting(true);
      console.log("Submitting review:", {
        productId,
        userId,
        ...values,
      });

      await new Promise((resolve) => setTimeout(resolve, 1200));

      form.reset({
        rating: 0,
        comment: "",
      });
      setHoveredRating(0);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <main className="max-w-4xl px-4 md:px-6 mx-auto">
        <section className="mb-8 rounded-3xl border bg-linear-to-b from-muted/40 to-background p-6 sm:p-8">
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
              <h2 className="text-base font-semibold">Write a review</h2>
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
                      disabled={!canSubmit}
                      className="cursor-pointer px-6"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader className="mr-2 size-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        "Submit review"
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
