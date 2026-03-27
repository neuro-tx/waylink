import { BadgeCheck, CheckCircle2, Lock, User2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { User } from "@/lib/all-types";
import { fmtDate, timeAgo } from "@/lib/utils";

interface ProfileActivityProps {
  user: User;
  lastSessionCreatedAt?: string | Date;
}

export function ProfileActivity({
  user,
  lastSessionCreatedAt,
}: ProfileActivityProps) {
  const events = [
    {
      label: "Account created",
      date: user.createdAt,
      icon: CheckCircle2,
      color: "text-emerald-500",
    },
    ...(user.emailVerified
      ? [
          {
            label: "Email verified",
            date: user.createdAt,
            icon: BadgeCheck,
            color: "text-blue-500",
          },
        ]
      : []),
    {
      label: "Profile last updated",
      date: user.updatedAt,
      icon: User2,
      color: "text-primary",
    },
    ...(lastSessionCreatedAt
      ? [
          {
            label: "Last login",
            date: lastSessionCreatedAt,
            icon: Lock,
            color: "text-amber-500",
          },
        ]
      : []),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-base">Activity Timeline</CardTitle>
        <CardDescription>
          Your key account events
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="relative space-y-0 pl-6">
          <div className="absolute bottom-2 left-2 top-2 w-px bg-border/60" />

          {events.map(({ label, date, icon: Icon, color }) => (
            <div key={label} className="flex items-start gap-4 pb-5 last:pb-0">
              <div
                className={`relative z-10 mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-background ${color}`}
              >
                <Icon className="h-3.5 w-3.5" />
              </div>
              <div>
                <p className="text-sm font-medium">{label}</p>
                <p className="text-xs text-muted-foreground">
                  {fmtDate(date)} · {timeAgo(date)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
