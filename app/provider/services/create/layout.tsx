"use client";

import { useParams } from "next/navigation";
import { SetupProgressProvider } from "@/components/providers/SetupProgressProvider";
import { ServiceLayoutContent } from "../../_components/ServiceLayoutContent";

export default function CreateServiceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const serviceId = typeof params.id === "string" ? params.id : undefined;

  return (
    <SetupProgressProvider serviceId={serviceId}>
      <ServiceLayoutContent>{children}</ServiceLayoutContent>
    </SetupProgressProvider>
  );
}
