import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { User } from "@/lib/all-types";
import { fmtDate } from "@/lib/utils";

interface ProfileMetadataProps {
  user: User;
}

export function ProfileMetadata({ user }: ProfileMetadataProps) {
  const rows: { label: string; value: string; mono?: boolean }[] = [
    { label: "User ID", value: user.id, mono: true },
    { label: "Role", value: user.role ?? "user" },
    { label: "Email verified", value: user.emailVerified ? "Yes" : "No" },
    {
      label: "Status",
      value: user.banned
        ? `Banned${user.banReason ? ` — ${user.banReason}` : ""}`
        : "Active",
    },
    { label: "Created", value: fmtDate(user.createdAt) },
    { label: "Updated", value: fmtDate(user.updatedAt) },
  ];

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-base">Account Metadata</CardTitle>
        <CardDescription>Read-only fields that display the profile metadata</CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        {rows.map(({ label, value, mono }) => (
          <div
            key={label}
            className="flex items-start justify-between gap-3 rounded-lg border border-border/40 bg-muted/30 px-3 py-2.5"
          >
            <span className="shrink-0 text-xs text-muted-foreground">
              {label}
            </span>
            <span
              className={`text-right text-xs font-medium leading-relaxed ${
                mono ? "break-all font-mono" : ""
              }`}
            >
              {value}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
