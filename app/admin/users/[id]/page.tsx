import { Metadata } from "next";
import { getUserById } from "@/actions/user.actions";
import UserDetailPage from "../../_components/UserDetailPage";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;

  const result = await getUserById(id);

  if (!result.success || !result.data) {
    return {
      title: "User Not Found",
      description: "The requested user could not be found.",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const user = result.data;

  return {
    title: `${user.name} | User Details`,
    description: `View and manage ${user.name}'s account, role, status, and activity from the admin dashboard.`,
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function AdminUserDetailsPage({ params }: PageProps) {
  return <UserDetailPage />;
}
