import { ClientPage } from "@/app/provider/_components/AnalysisClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Service Analysis",
  description: "Detailed analytics for a specific service performance.",
};

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

const page = async ({ params }: PageProps) => {
  const { id } = await params;

  return (
    <div className="px-4 md:px-6 py-8 w-full overflow-x-hidden min-h-screen">
      {id && <ClientPage id={id} />}
    </div>
  );
};

export default page;
