import { Metadata } from "next";
import { UsersTable } from "../_components/users-table";

export const metadata: Metadata = {
  title: "Users Management",
  description:
    "Manage platform users, roles, account status, and moderation actions from the admin dashboard.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminUsersPage() {
  return (
    <div className="space-y-6 px-4 md:px-6 py-6 w-full">
      <UsersTable />
    </div>
  );
}
