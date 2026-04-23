import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import ReviewsPage from "../_components/Reviewspage";
import { getCurrentProvider } from "@/lib/provider-auth";

interface PageProps {
  params: { providerId: string };
  searchParams: Record<string, string | string[] | undefined>;
}

export default async function Page({ params }: PageProps) {
  const {provider} = await getCurrentProvider();
  return (
    <Suspense
      fallback={
        <div className="w-full px-4 md:px-6 py-6 space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      }
    >
      <ReviewsPage providerId={provider?.id} />
    </Suspense>
  );
}

export function generateMetadata({ params }: PageProps) {
  return {
    title: `Reviews — Provider ${params.providerId}`,
  };
}
