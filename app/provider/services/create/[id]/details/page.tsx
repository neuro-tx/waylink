"use client";

import { ExperienceDetailsPage } from "@/app/provider/_components/ExpDetails";
import { TransportDetailsPage } from "@/app/provider/_components/TransportDetails";
import { useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useProviderContext } from "@/components/providers/ProviderContext";
import { SchedulePanel } from "@/app/provider/_components/SchedulePanel";

export default function ServiceDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { type } = useProviderContext();

  const serviceId = params.id as string;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const currentTab = searchParams.get("tab") || "meta-info";

  async function handleExperienceSubmit(data: any) {
    setIsSubmitting(true);
    try {
      await new Promise((r) => setTimeout(r, 800));
      console.log(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleTransportSubmit(data: any) {
    setIsSubmitting(true);
    try {
      await new Promise((r) => setTimeout(r, 800));
      console.log(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!serviceId) router.back();

  if (type === "transport") {
    return (
      <>
        {currentTab === "meta-info" && (
          <TransportDetailsPage
            productId={serviceId}
            onFinish={handleTransportSubmit}
            isSubmitting={isSubmitting}
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
      isSubmitting={isSubmitting}
    />
  );
}
