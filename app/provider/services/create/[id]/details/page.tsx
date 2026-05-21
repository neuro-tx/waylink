"use client";

import { ExperienceDetailsPage } from "@/app/provider/_components/ExpDetails";
import { TransportDetailsPage } from "@/app/provider/_components/TransportDetails";
import { useTransition } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useProviderContext } from "@/components/providers/ProviderContext";
import { SchedulePanel } from "@/app/provider/_components/SchedulePanel";
import {
  createTransportDetails,
  creatExperienceDetails,
} from "@/actions/service.action";
import { toast } from "sonner";

export default function ServiceDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { type } = useProviderContext();
  const [isPending, startTransition] = useTransition();

  const serviceId = params.id as string;

  const currentTab = searchParams.get("tab") || "meta-info";

  async function handleExperienceSubmit(data: any) {
    startTransition(async () => {
      try {
        const res = await creatExperienceDetails(serviceId, data);
        if (!res.success) {
          toast.error(res.error);
          return;
        }

        toast.success(
          "Experience details saved. You can now review your service in the creation preview.",
        );
        router.push(`/provider/services/create/${serviceId}/review`);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Something went wrong",
        );
      }
    });
  }

  async function handleTransportSubmit(data: any) {
    startTransition(async () => {
      try {
        const res = await createTransportDetails(serviceId, data);
        if (!res.success) {
          toast.error(res.error);
          return;
        }

        toast.success(
          "Transport details saved successfully. Redirecting to schedules setup...",
        );
        router.push(
          `/provider/services/create/${serviceId}/details?tab=schedule`,
        );
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Something went wrong",
        );
      }
    });
  }

  if (!serviceId) router.back();

  if (type === "transport") {
    return (
      <>
        {currentTab === "meta-info" && (
          <TransportDetailsPage
            productId={serviceId}
            onFinish={handleTransportSubmit}
            isSubmitting={isPending}
          />
        )}

        {currentTab === "schedule" && <SchedulePanel serviceId={serviceId} />}
      </>
    );
  }

  return (
    <ExperienceDetailsPage
      productId={serviceId}
      onFinish={handleExperienceSubmit}
      isSubmitting={isPending}
    />
  );
}
