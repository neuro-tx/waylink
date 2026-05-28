"use client";

import { useEffect, useState, useTransition } from "react";
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
  ArrowRight,
  DollarSign,
  FileText,
  ChevronDown,
  ImagePlus,
  Lock,
  Star,
  Users,
  CheckCircle2,
  XCircle,
  Sparkles,
  Loader,
  AlertCircle,
} from "lucide-react";
import { MediaUpload } from "@/components/MediaUpload";
import { cn } from "@/lib/utils";
import { MediaForm, ProductForm, productSchema } from "@/validations";
import Image from "next/image";
import { addServiceMedia, createService } from "@/actions/service.action";
import { useSetupProgress } from "@/components/providers/SetupProgressProvider";

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
  onSaveSuccess,
}: {
  values: Partial<ProductForm>;
  serviceId: string | null;
  onSaveSuccess: () => void;
}) {
  const symbol = CURRENCY_SYMBOLS[values.currency || "USD"] || "$";
  const [cover, setCover] = useState<string | null>(null);
  const [media, setMedia] = useState<MediaForm[] | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const { updateProgress } = useSetupProgress();

  useEffect(() => {
    if (!cover) return;

    setMedia((prev) => {
      const current = prev ?? [];

      return [
        {
          url: cover,
          type: "image",
          isCover: true,
          displayOrder: 0,
        },
        ...current.filter((m) => !m.isCover),
      ];
    });
  }, [cover]);

  const saveMedia = () => {
    if (!serviceId || !media?.length || isPending) return;
    setError(null);

    startTransition(async () => {
      try {
        const res = await addServiceMedia(serviceId, media);
        if (!res.success) {
          setError(res.error ?? "Failed to save media");
          return;
        }
        updateProgress({
          hasMedia: true,
        });
        onSaveSuccess();
      } catch {
        setError("Something went wrong");
      }
    });
  };

  return (
    <div className="space-y-4">
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
            <Button
              disabled={!media?.length || isPending}
              variant="outline"
              size="lg"
              onClick={saveMedia}
              aria-invalid={error !== null}
              className="w-1/2"
            >
              {isPending ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Media"
              )}
            </Button>
            {error && (
              <div className="flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2">
                <AlertCircle className="h-4 w-4 text-red-500 mt-0.5" />
                <p className="text-xs font-medium text-red-600">{error}</p>
              </div>
            )}
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
                mode="manual"
                maxSizeMB={5}
                label="Add gallery photos"
                hint="Up to 10 images"
                keyPrefix="products"
                onAllComplete={(files) =>
                  setMedia((prev) => {
                    const current = prev ?? [];
                    const existingUrls = new Set(current.map((m) => m.url));

                    const mapped = files
                      .filter((f) => !existingUrls.has(f.url))
                      .map((f) => ({
                        url: f.url,
                        type: "image" as const,
                        isCover: false,
                        displayOrder: f.order,
                      }));

                    return [...current, ...mapped];
                  })
                }
                onRemove={(file) =>
                  setMedia((prev) =>
                    (prev ?? []).filter((m) => m.url !== file.url),
                  )
                }
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
    </div>
  );
}

export default function CreateProductPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serviceId, setServiceId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const form = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: { currency: "USD" },
  });

  const watchedValues = form.watch();

  const handleTitleChange = (value: string) => {
    form.setValue("title", value);
  };

  async function onSubmit(data: ProductForm) {
    setIsSubmitting(true);
    try {
      const res = await createService(data);
      if (!res.success) {
        setError(res.error);
        return;
      }
      setServiceId(res?.result as string);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="w-full relative px-4 md:px-6 py-10">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground tracking-tight">
            What are you offering?
          </h2>
          <p className="mt-2 text-muted-foreground">
            Fill in the details — the preview on the right updates as you type.
          </p>
        </div>
        <div className="grid grid-cols-1  xl:grid-cols-[1fr_480px] gap-7">
          <div>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-3"
              >
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

                {/* ── Footer actions ── */}
                <div className="pt-4 flex items-center justify-between">
                  {error ? (
                    <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 font-medium">
                      <XCircle className="h-4 w-4" />
                      {error}
                    </div>
                  ) : serviceId ? (
                    <div className="flex items-center gap-2 rounded-lg text-sm bg-emerald-500/10 border border-emerald-500/20 px-3 py-2.5 text-emerald-600 dark:text-emerald-400 font-medium">
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
                            `/provider/services/create/${serviceId}/variants`,
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

          <PreviewCard
            values={watchedValues}
            serviceId={serviceId}
            onSaveSuccess={() =>
              router.push(`/provider/services/create/${serviceId}/variants`)
            }
          />
        </div>

        <div className="mt-10 rounded-3xl border border-border bg-linear-to-br from-muted/40 via-background to-muted/20 p-5 overflow-hidden relative">
          <div className="absolute -top-20 right-0 h-40 w-40 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                Service publishing workflow
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-sans font-semibold tracking-tight text-foreground">
                  Your service starts as a draft
                </h3>

                <p className="text-sm leading-relaxed text-muted-foreground">
                  Once your service is created, it will be saved as a{" "}
                  <span className="font-medium text-foreground">draft</span>.
                  Continue completing the remaining setup steps like variants,
                  locations, media, and service details.
                </p>

                <p className="text-sm leading-relaxed text-muted-foreground">
                  After everything is completed, our system will prepare your
                  service for review, calculate its quality score, and send it
                  to the admin team for approval before it gets published
                  publicly.
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-background/80 backdrop-blur-sm p-3 min-w-65">
              <div className="space-y-2">
                {[
                  "Created as draft",
                  "Complete setup details",
                  "Admin review & score calculation",
                  "Published publicly",
                ].map((step, index) => (
                  <div key={step} className="flex items-start gap-3">
                    <div
                      className={cn(
                        "flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold shrink-0",
                        index === 3
                          ? "bg-emerald-500/10 text-emerald-600"
                          : "bg-primary/10 text-primary",
                      )}
                    >
                      {index + 1}
                    </div>

                    <p className="text-sm text-foreground">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
