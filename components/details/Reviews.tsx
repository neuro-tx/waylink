import { ProductReview } from "@/lib/all-types";
import { cn, fmtDate } from "@/lib/utils";
import { MessageSquareOff, Star } from "lucide-react";

type StarDisplayProps = {
  rating: number;
  palette?: {
    star: string;
    starEmpty: string;
  };
  max?: number;
  className?: string;
};

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

const defaultPalette = {
  star: "fill-amber-400 text-amber-400",
  starEmpty: "text-muted-foreground/30",
};

export function StarDisplay({
  rating,
  palette = defaultPalette,
  max = 5,
  className,
}: StarDisplayProps) {
  const roundedRating = Math.round(rating);

  return (
    <span className={cn("flex items-center gap-0.5", className)}>
      {Array.from({ length: max }, (_, i) => {
        const starNumber = i + 1;
        const filled = starNumber <= roundedRating;

        return (
          <Star
            key={starNumber}
            className={cn(
              "size-3.5 shrink-0",
              filled ? palette.star : palette.starEmpty,
            )}
          />
        );
      })}
    </span>
  );
}

function Avatar({ user }: { user: ProductReview["user"] }) {
  if (user.image) {
    return (
      <img
        src={user.image}
        alt={user.name}
        className="w-10 h-10 rounded-full object-cover"
      />
    );
  }
  return (
    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-medium">
      {initials(user.name)}
    </div>
  );
}

function ReviewCard({ review }: { review: ProductReview }) {
  const date = new Date(review.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="bg-card/50 border rounded-xl p-5">
      <div className="flex items-start gap-3 mb-3">
        <Avatar user={review.user} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold">{review.user.name}</p>
          <p className="text-xs text-gray-400">{date}</p>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <StarDisplay rating={review.rating} />
          {review.isVerified && (
            <span className="text-xs text-emerald-600 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900 px-2 py-0.5 rounded-full">
              ✓ Verified
            </span>
          )}
        </div>
      </div>

      {review.comment && (
        <p className="text-sm leading-relaxed">{review.comment}</p>
      )}

      {review.providerResponse && (
        <div className="mt-3 pl-3 bg-muted/50 rounded-md border py-2 pr-3">
          <p className="text-xs font-medium tracking-wide text-muted-foreground mb-1">
            <span className="capitalize text-emerald-600 dark:text-emerald-400">
              Provider response
            </span>
            {review.respondedAt && ` · ${fmtDate(review.respondedAt)}`}
          </p>
          <p className="text-sm leading-relaxed">{review.providerResponse}</p>
        </div>
      )}
    </div>
  );
}

export function ReviewsList({ reviews }: { reviews: ProductReview[] }) {
if (!reviews.length) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed bg-muted/50 px-4 py-6 text-center">
      <div className="mb-2 flex size-10 items-center justify-center rounded-full bg-muted">
        <MessageSquareOff className="size-5 text-muted-foreground" />
      </div>

      <p className="text-sm font-medium">No reviews yet</p>
      <p className="mt-1 text-xs text-muted-foreground">
        Be the first to share your experience.
      </p>
    </div>
  );
}

  return (
    <div>
      <div className="space-y-3">
        {reviews.map((r) => (
          <ReviewCard key={r.id} review={r} />
        ))}
      </div>
    </div>
  );
}
