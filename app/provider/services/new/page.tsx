"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Plane,
  Compass,
  ArrowRight,
  Sparkles,
  DollarSign,
  Tag,
  FileText,
  ChevronDown,
  ImagePlus,
  Eye,
  Lock,
  Star,
  Users,
  CheckCircle2,
} from "lucide-react";
import { StepIndicator } from "../../_components/StepIndicator";
import { MediaUpload } from "@/components/MediaUpload";
import { cn } from "@/lib/utils";
import { ProductForm, productSchema } from "@/validations";
import { useProviderContext } from "@/components/providers/ProviderContext";
import Image from "next/image";

const CURRENCIES = ["USD", "EUR", "GBP", "AED", "EGP", "SAR"];
const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  AED: "د.إ",
  EGP: "E£",
  SAR: "﷼",
};

function FormSection({
  icon: Icon,
  label,
  children,
  defaultOpen = true,
}: {
  icon: React.ElementType;
  label: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div
      className={cn(
        "rounded-xl border-2 transition-all duration-200 overflow-hidden",
        open ? "border-primary/20 bg-card" : "border-border bg-card/60",
      )}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "w-full flex items-center gap-3 p-4 text-left hover:bg-accent/10 transition-colors",
          open && "border-b border-border/50",
        )}
      >
        <div
          className={cn(
            "rounded-lg p-2 transition-colors",
            open ? "bg-primary/10" : "bg-muted",
          )}
        >
          <Icon
            className={cn(
              "h-4 w-4 transition-colors",
              open ? "text-primary" : "text-muted-foreground",
            )}
          />
        </div>
        <span
          className={cn(
            "flex-1 text-base font-semibold font-georgia",
            open ? "text-foreground" : "text-muted-foreground",
          )}
        >
          {label}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-muted-foreground transition-transform duration-200",
            open && "rotate-180",
          )}
        />
      </button>

      {open && <div className="p-5 space-y-4">{children}</div>}
    </div>
  );
}

function PreviewCard({
  values,
  serviceId,
}: {
  values: Partial<ProductForm>;
  serviceId: string | null;
}) {
  const symbol = CURRENCY_SYMBOLS[values.currency || "USD"] || "$";
  const [cover, setCover] = useState<string | null>(null);

  const typeConfig = {
    experience: {
      label: "Experience",
      Icon: Compass,
      className: "bg-orange-500/15 text-orange-600 dark:text-orange-400",
    },
    transport: {
      label: "Transport",
      Icon: Plane,
      className: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
    },
  };

  return (
    <div className="sticky top-18 space-y-4">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1">
        <Eye className="h-3.5 w-3.5" />
        Live Preview
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
        <div className="relative h-44 bg-muted overflow-hidden">
          {cover ? (
            <Image
              src={cover}
              alt="service-cover"
              width={200}
              height={200}
              className="size-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
              <div className="h-10 w-10 rounded-full bg-muted-foreground/10 flex items-center justify-center">
                <ImagePlus className="h-5 w-5 text-muted-foreground/30" />
              </div>
              <p className="text-xs text-muted-foreground/40">Cover photo</p>
            </div>
          )}

          <div className="absolute top-3 right-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-black/40 backdrop-blur-sm px-2.5 py-1 text-xs font-medium text-white">
              <div className="h-1.5 w-1.5 rounded-full bg-yellow-500" />
              Draft
            </span>
          </div>
        </div>

        <div className="p-4 space-y-3">
          <div>
            <h3
              className={cn(
                "font-bold text-base leading-snug line-clamp-2",
                !values.title &&
                  "text-muted-foreground/30 italic font-normal text-sm",
              )}
            >
              {values.title || "Your product title will appear here…"}
            </h3>
            {values.shortDescription && (
              <p className="mt-1 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                {values.shortDescription}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              New listing
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />0 bookings
            </span>
          </div>

          <Separator className="opacity-40" />

          <div className="flex items-end justify-between">
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">
                Starting from
              </p>
              <p
                className={cn(
                  "text-xl font-bold tracking-tight",
                  !values.basePrice && "text-muted-foreground/30",
                )}
              >
                {values.basePrice ? (
                  <>
                    {symbol}
                    {Number(values.basePrice).toLocaleString()}{" "}
                    <span className="text-xs font-normal text-muted-foreground">
                      {values.currency}
                    </span>
                  </>
                ) : (
                  "—"
                )}
              </p>
            </div>
            <div className="rounded-lg bg-primary/10 text-primary text-xs font-semibold px-3 py-2 pointer-events-none">
              Book now
            </div>
          </div>
        </div>
      </div>

      <div
        className={cn(
          "rounded-xl border-2 overflow-hidden transition-all duration-300",
          serviceId
            ? "border-primary/30 bg-card"
            : "border-dashed border-border bg-card/40",
        )}
      >
        <div
          className={cn(
            "flex items-center gap-3 px-4 py-3",
            serviceId ? "border-b border-border/50" : "",
          )}
        >
          <div
            className={cn(
              "rounded-lg p-2",
              serviceId ? "bg-primary/10" : "bg-muted",
            )}
          >
            <ImagePlus
              className={cn(
                "h-4 w-4",
                serviceId ? "text-primary" : "text-muted-foreground",
              )}
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground">
              Product Media
            </p>
            <p className="text-xs text-muted-foreground">
              {serviceId
                ? "Upload cover & gallery images"
                : "Available after saving"}
            </p>
          </div>
          {!serviceId ? (
            <Lock className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0" />
          ) : (
            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
          )}
        </div>

        {serviceId ? (
          <div className="p-4 space-y-4">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Cover Photo
              </p>
              <MediaUpload
                variant="cover"
                multiple={false}
                mode="manual"
                maxSizeMB={3}
                label="Upload cover photo"
                hint="Recommended: 1200×675px"
                keyPrefix="products"
                onComplete={(file) => setCover(file.url)}
              />
            </div>
            <Separator className="opacity-40" />
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Gallery
              </p>
              <MediaUpload
                variant="gallery"
                multiple={true}
                maxFiles={10}
                mode="auto"
                maxSizeMB={5}
                label="Add gallery photos"
                hint="Up to 10 images"
                keyPrefix="products"
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 gap-2.5 text-center px-4">
            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
              <Lock className="h-4 w-4 text-muted-foreground/40" />
            </div>
            <p className="text-xs text-muted-foreground max-w-50 leading-relaxed">
              Save your product details first to unlock media uploads
            </p>
          </div>
        )}
      </div>

      {serviceId && (
        <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-3 py-2.5">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
          <div className="min-w-0">
            <p className="text-[10px] text-muted-foreground font-medium">
              Service saved
            </p>
            <p className="text-xs font-mono text-foreground truncate">
              {serviceId}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CreateProductPage() {
  const { type } = useProviderContext();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serviceId, setServiceId] = useState<string | null>(null);

  const form = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: { currency: "USD" },
  });

  const watchedValues = form.watch();

  const handleTitleChange = (value: string) => {
    form.setValue("title", value);
  };

  async function onSubmit(data: ProductForm) {
    console.log(data);
    setIsSubmitting(true);
    try {
      const mockId = "550e8400-e29b-41d4-a716-446655440000";
      setServiceId(mockId);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  }

  const serviceType = () => {
    if (type === "experience") {
      return {
        value: "experience",
        label: "Experience",
        desc: "Tours, activities, events",
        Icon: Compass,
        color: "text-orange-500",
        activeBg: "bg-orange-500/15 border-orange-500",
        iconBg: "bg-orange-500/10",
      };
    }

    if (type === "transport") {
      return {
        value: "transport",
        label: "Transport",
        desc: "Transfers, rides, charters",
        Icon: Plane,
        color: "text-blue-500",
        activeBg: "bg-blue-500/15 border-blue-500",
        iconBg: "bg-blue-500/10",
      };
    }

    return null;
  };
  const service = serviceType();

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border/50 bg-card/30 backdrop-blur-sm sticky top-0 z-10">
        <div className="px-4 md:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-7 rounded-lg bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                New Product
              </p>
              <h1 className="text-sm font-semibold text-foreground leading-none">
                Product Details
              </h1>
            </div>
          </div>
          <StepIndicator currentStep={1} totalSteps={2} />
        </div>
      </div>

      <div className="w-full relative px-4 md:px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-10 items-start">
          <div>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-foreground tracking-tight">
                What are you offering?
              </h2>
              <p className="mt-2 text-muted-foreground">
                Fill in the details — the preview on the right updates as you
                type.
              </p>
            </div>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-3"
              >
                {service && (
                  <FormSection icon={service.Icon} label="Product Type">
                    <div className="grid xl:grid-cols-2">
                      <div
                        className={cn(
                          "relative flex items-start gap-4 rounded-xl border-2 p-5",
                          service.activeBg,
                        )}
                      >
                        <div className={cn("rounded-lg p-2.5", service.iconBg)}>
                          <service.Icon
                            className={cn("h-5 w-5", service.color)}
                          />
                        </div>
                        <div>
                          <p className="font-semibold text-sm">
                            {service.label}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {service.desc}
                          </p>
                        </div>
                        <div
                          className={cn(
                            "absolute top-3 right-3 h-2 w-2 rounded-full",
                            service.color.replace("text-", "bg-"),
                          )}
                        />
                      </div>
                    </div>
                  </FormSection>
                )}

                {/* Section: Basic Info */}
                <FormSection icon={FileText} label="Basic Info">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Title <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g. Sunrise Desert Safari with Camel Ride"
                            className="h-11 text-base"
                            {...field}
                            onChange={(e) => handleTitleChange(e.target.value)}
                          />
                        </FormControl>
                        <div className="flex justify-end">
                          <span className="text-xs text-muted-foreground">
                            {(field.value || "").length}/120
                          </span>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="shortDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center justify-between">
                          Short Description
                          <Badge
                            variant="outline"
                            className="text-xs font-normal"
                          >
                            SEO / Cards
                          </Badge>
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="A compelling one-liner shown on listing cards and search results…"
                            className="resize-none h-20 text-sm"
                            {...field}
                          />
                        </FormControl>
                        <div className="flex justify-end">
                          <span className="text-xs text-muted-foreground">
                            {(field.value || "").length}/160
                          </span>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center justify-between">
                          Full Description
                          <Badge
                            variant="outline"
                            className="text-xs font-normal"
                          >
                            Optional
                          </Badge>
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe the experience in detail — what to expect, what's included, highlights…"
                            className="resize-none h-32 text-sm"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </FormSection>

                {/* Section: Pricing */}
                <FormSection icon={DollarSign} label="Base Pricing">
                  <div className="grid grid-cols-3 gap-3 items-start">
                    <div className="col-span-2">
                      <FormField
                        control={form.control}
                        name="basePrice"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Starting Price{" "}
                              <span className="text-destructive">*</span>
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                  {...field}
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  placeholder="0.00"
                                  className="pl-9 text-base"
                                />
                              </div>
                            </FormControl>
                            <p className="text-xs text-muted-foreground">
                              The lowest price shown on listings
                            </p>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="currency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Currency</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="h-11">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {CURRENCIES.map((c) => (
                                <SelectItem key={c} value={c}>
                                  {c}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </FormSection>

                {/* Section: Status */}
                <FormSection
                  icon={Tag}
                  label="Publication Status"
                  defaultOpen={false}
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    {[
                      {
                        value: "draft",
                        label: "Draft",
                        desc: "Not visible to customers",
                        dot: "bg-yellow-500",
                      },
                      {
                        value: "published",
                        label: "Published",
                        desc: "Live and bookable",
                        dot: "bg-emerald-500",
                      },
                      {
                        value: "archived",
                        label: "Archived",
                        desc: "Hidden from listings",
                        dot: "bg-zinc-400",
                      },
                    ].map(({ value, label, desc, dot }) => {
                      const isActive = value === "draft";
                      return (
                        <div
                          key={value}
                          className={cn(
                            "flex flex-col items-start gap-1.5 rounded-lg border-2 p-4 text-left transition-all",
                            isActive
                              ? "border-yellow-500 bg-yellow-500/5 hover:bg-yellow-500/10"
                              : "border-border bg-background hover:bg-accent/30",
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <div className={cn("h-2 w-2 rounded-full", dot)} />
                            <span className="text-sm font-semibold">
                              {label}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {desc}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </FormSection>

                {/* ── Footer actions ── */}
                <div className="pt-4 flex items-center justify-between">
                  {serviceId ? (
                    <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                      <CheckCircle2 className="h-4 w-4" />
                      Saved! Upload media or continue
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">Step 1 of 4</p>
                  )}

                  <div className="flex items-center gap-3">
                    {serviceId && (
                      <Button
                        type="button"
                        size="lg"
                        className="gap-2"
                        onClick={() =>
                          router.push(
                            `/provider/services/create/variants?serviceId${serviceId}`,
                          )
                        }
                      >
                        Continue to Variants
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    )}

                    {!serviceId && (
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        size="lg"
                        className="gap-2 min-w-44"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                            Saving…
                          </>
                        ) : (
                          <>
                            Save & Unlock Media
                            <ArrowRight className="h-4 w-4" />
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </form>
            </Form>
          </div>

          <PreviewCard values={watchedValues} serviceId={serviceId} />
        </div>
      </div>
    </div>
  );
}
