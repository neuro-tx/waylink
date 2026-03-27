import { getAuthSession } from "@/lib/auth-server";
import { Lock, User2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileMetadata } from "@/components/profile/ProfileMetadata";
import { ProfileActivity } from "@/components/profile/ProfileActivity";
import { ProfileDangerZone } from "@/components/profile/ProfileDangerZone";
import { ProfileSessions } from "@/components/profile/ProfileSession";
import { ProfileIdentityCard } from "@/components/profile/ProfileIdentityCard";
import { redirect } from "next/navigation";

const Page = async () => {
  const session = await getAuthSession();
  const user = session?.user;

  if (!user) {
    redirect("/unauthorized");
  }

  return (
    <div className="min-h-screen w-full overflow-x-hidden">
      <div className="space-y-6 px-4 py-8 md:px-6">
        <ProfileIdentityCard user={user} />

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="h-auto gap-1 rounded-xl border border-border/50 bg-muted/50 p-1">
            {[
              { value: "profile", icon: User2, label: "Profile" },
              { value: "sessions", icon: Lock, label: "Sessions" },
            ].map(({ value, icon: Icon, label }) => (
              <TabsTrigger
                key={value}
                value={value}
                className="gap-2 rounded-lg px-4 py-2 text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                <Icon className="h-4 w-4" />
                {label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 items-baseline">
              <ProfileActivity
                user={user}
                lastSessionCreatedAt={session?.session?.createdAt}
              />

              <ProfileMetadata user={user} />
            </div>

            <ProfileDangerZone />
          </TabsContent>

          <TabsContent value="sessions" className="space-y-6">
            <ProfileSessions />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Page;
