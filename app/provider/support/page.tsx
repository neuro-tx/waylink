import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import {
  CreditCard,
  Layers,
  LayoutList,
  Calendar,
  User,
  Settings,
  LifeBuoy,
  CheckCircle2,
  Clock,
  AlertCircle,
  BarChart3,
  TrendingUp,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Help Center | Waylink",
  description:
    "Access the Waylink Help Center to manage your subscription, understand plans, and resolve issues بسرعة. Contact support anytime.",
};

const categories = [
  {
    title: "Plans & Billing",
    icon: CreditCard,
    desc: "Pricing, billing, and invoices",
  },
  {
    title: "Subscriptions",
    icon: Layers,
    desc: "Renewals, trials, and upgrades",
  },
  {
    title: "Listings & Limits",
    icon: LayoutList,
    desc: "Manage services and quotas",
  },
  {
    title: "Bookings",
    icon: Calendar,
    desc: "Schedules and user appointments",
  },
  {
    title: "Account & Roles",
    icon: User,
    desc: "Staff access and permissions",
  },
  { title: "Settings", icon: Settings, desc: "Personalize your experience" },
];

export default function HelpPage() {
  return (
    <div className="w-full p-4 md:p-6 space-y-10 animate-in fade-in duration-500">
      <div className="text-center space-y-4">
        <Badge variant="secondary" className="rounded-full px-4 py-1">
          Waylink Provider Support
        </Badge>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          How can we help you today?
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
          Master the Waylink ecosystem, from your first application to scaling
          your service business.
        </p>
      </div>

      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <ShieldCheck className="text-primary size-5" /> The Onboarding
            Journey
          </h2>
          <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
            Step-by-Step
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-blue-500 bg-blue-50/10 dark:bg-blue-950/10">
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <User className="size-5 text-blue-500" />
                <Badge className="bg-blue-500">Step 1</Badge>
              </div>
              <p className="font-bold">Sign In & Apply</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Create your account and request provider status.
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-amber-500 bg-amber-50/10 dark:bg-amber-950/10">
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <Clock className="size-5 text-amber-500" />
                <Badge className="bg-amber-500">Step 2</Badge>
              </div>
              <p className="font-bold">Admin Review</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Your request is{" "}
                <span className="text-amber-600 font-medium italic">
                  Pending
                </span>
                . We verify your data quality.
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-rose-500 bg-rose-50/10 dark:bg-rose-950/10">
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <AlertCircle className="size-5 text-rose-500" />
                <Badge className="bg-rose-500">Step 3</Badge>
              </div>
              <p className="font-bold text-rose-600 dark:text-rose-400">
                If Not Approved
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Usually due to invalid data. Edit your profile and resubmit for
                a second review.
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-emerald-500 bg-emerald-50/10 dark:bg-emerald-950/10">
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <CheckCircle2 className="size-5 text-emerald-500" />
                <Badge className="bg-emerald-500">Step 4</Badge>
              </div>
              <p className="font-bold text-emerald-600 dark:text-emerald-400">
                Approved & Go Live
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Choose your plan, create listings, and start receiving bookings!
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="rounded-2xl bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white p-8 overflow-hidden relative border border-slate-200 dark:border-slate-800">
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-primary font-bold tracking-widest text-xs uppercase">
              <BarChart3 className="size-4" /> Professional Analytics
            </div>

            <h2 className="text-3xl font-bold italic">
              How Waylink grows your business.
            </h2>

            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Our dashboard tracks conversion rates, product performance, and
              booking patterns. We use this data to suggest optimizations for
              your listings, helping you stay ahead.
            </p>

            <div className="flex gap-4 pt-4">
              <div className="flex flex-col">
                <span className="text-2xl font-bold">85%</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold">
                  Conversion Rate
                </span>
              </div>

              <div className="w-px bg-slate-300 dark:bg-slate-800 h-10" />

              <div className="flex flex-col">
                <span className="text-2xl font-bold">24/7</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold">
                  System Monitoring
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white/70 dark:bg-slate-900/50 rounded-lg p-6 border border-slate-200 dark:border-slate-700 backdrop-blur-sm space-y-4 shadow-sm dark:shadow-none">
            <div className="h-2 w-2/3 bg-slate-200 dark:bg-slate-700 rounded" />
            <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded" />

            <div className="h-20 w-full bg-primary/10 dark:bg-primary/20 border border-primary/20 dark:border-primary/30 rounded flex items-center justify-center">
              <TrendingUp className="text-primary size-8" />
            </div>

            <p className="text-xs text-center text-slate-500 dark:text-slate-400">
              Real-time booking data processed by Waylink Core.
            </p>
          </div>
        </div>

        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 dark:bg-primary/20 blur-3xl z-0" />
      </section>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {categories.map((c) => {
          const Icon = c.icon;
          return (
            <Card
              key={c.title}
              className="transition-all duration-300 group border-border"
            >
              <CardContent className="p-4 space-y-3">
                <div className="p-2 rounded-lg bg-primary/10 w-fit group-hover:bg-primary transition-all duration-300">
                  <Icon className="size-5 text-primary group-hover:text-primary-foreground" />
                </div>
                <p className="font-bold">{c.title}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {c.desc}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <Button variant="outline" asChild size="lg">
          <Link href="/provider/subscription">Manage Subscription</Link>
        </Button>
        <Button variant="outline" asChild size="lg">
          <Link href="/provider/plans">View Plans</Link>
        </Button>
        <Button variant="outline" asChild size="lg">
          <Link href="/provider/settings">Account Settings</Link>
        </Button>
        <Button size="lg">
          <LifeBuoy className="mr-2 size-4" /> Contact Human Support
        </Button>
      </div>

      <div className="max-w-3xl mx-auto space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Expert-Led FAQ</h2>
          <p className="text-muted-foreground text-sm">
            Quick answers for power users.
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="1" className="border-b">
            <AccordionTrigger className="hover:no-underline font-medium">
              What happens after my trial ends?
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground leading-relaxed">
              If your plan includes a trial, billing will begin automatically
              after it ends. To avoid charges, ensure you pause or cancel your
              subscription 24 hours before the period expires.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="2" className="border-b">
            <AccordionTrigger className="hover:no-underline font-medium">
              Can I change my plan later?
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground leading-relaxed">
              Absolutely. Upgrading takes effect immediately (prorated), while
              downgrades typically apply at the end of the current billing
              cycle.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="3" className="border-b">
            <AccordionTrigger className="hover:no-underline font-medium">
              How does the listing limit work?
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground leading-relaxed">
              Each plan defines a maximum number of{" "}
              <span className="font-bold italic">Active</span> listings. You can
              keep draft or archived services without them counting toward your
              limit.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="4" className="border-b">
            <AccordionTrigger className="hover:no-underline font-medium">
              What can staff members access?
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground leading-relaxed">
              Staff roles are optimized for booking management and customer
              service. Access to billing, plan upgrades, and high-level business
              settings is strictly reserved for Owners and Managers.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      <Card className="rounded-2xl bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white overflow-hidden relative border border-slate-200 dark:border-slate-800">
        <CardContent className="p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 relative">
          <div className="z-10 space-y-2">
            <p className="text-2xl font-bold tracking-tight">Still curious?</p>
            <p className="opacity-90 max-w-md">
              Our dedicated account managers are ready to help you optimize your
              Waylink store.
            </p>
          </div>
          <Button size="lg" variant="outline">
            Speak to an Expert{" "}
            <ArrowRight className="ml-2 size-4 group-hover:translate-x-1 transition-transform" />
          </Button>
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
        </CardContent>
      </Card>

      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        Waylink Status:{" "}
        <span className="text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-tighter">
          Operational
        </span>
      </div>
    </div>
  );
}
