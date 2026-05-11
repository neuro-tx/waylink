"use client";

import { ExperienceDetailsPage } from "@/app/provider/_components/ExpDetails";
import { TransportDetailsPage } from "@/app/provider/_components/TransportDetails";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useProviderContext } from "@/components/providers/ProviderContext";

export default function ServiceDetailsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { type } = useProviderContext();

  const serviceId = searchParams.get("serviceId") as string;

  const [isSubmitting, setIsSubmitting] = useState(false);

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
      <TransportDetailsPage
        productId={serviceId}
        onFinish={handleTransportSubmit}
        isSubmitting={isSubmitting}
      />
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
