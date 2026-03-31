"use client";

import { useState } from "react";
import { motion, AnimatePresence, Transition } from "motion/react";
import {
  Building2,
  User,
  Briefcase,
  Phone,
  Mail,
  MapPin,
  Image as ImageIcon,
  ChevronRight,
  ChevronLeft,
  Check,
  Sparkles,
  Utensils,
  Car,
  LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { BusinessType, ServiceType } from "@/lib/all-types";
import { useForm } from "react-hook-form";
import { providerFormType } from "@/validations";

const SERVICE_TYPES: { value: ServiceType; label: string; icon: LucideIcon }[] =
  [
    { value: "experience", label: "Experience", icon: Utensils },
    { value: "transport", label: "Transport", icon: Car },
  ];

const BUSINESS_TYPES: { value: BusinessType; label: string; desc: string }[] = [
  {
    value: "individual",
    label: "Individual",
    desc: "Solo freelancer or self-employed",
  },
  {
    value: "company",
    label: "Company",
    desc: "Registered business or corporation",
  },
  {
    value: "agency",
    label: "Agency",
    desc: "Team offering multiple services",
  },
];

const STEPS = [
  "Business Type",
  "Service & Identity",
  "Contact & Location",
  "Review",
] as const;

const spring: Transition = { type: "spring", stiffness: 340, damping: 28 };

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="flex items-center gap-2">
          <motion.div
            animate={{
              width: i === current ? 28 : 8,
              backgroundColor:
                i <= current ? "hsl(var(--primary))" : "hsl(var(--muted))",
              opacity: i > current ? 0.4 : 1,
            }}
            transition={spring}
            className="h-2 rounded-full"
          />
        </div>
      ))}
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium">{label}</Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export default function BecomeProviderPage() {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [submitted, setSubmitted] = useState(false);

  const { register, watch, setValue, trigger, handleSubmit } =
    useForm<providerFormType>({
      mode: "onChange",
      defaultValues: {
        name: "",
        description: "",
        logo: "",
        cover: "",
        serviceType: "" as ServiceType,
        businessType: "" as BusinessType,
        address: "",
        businessPhone: "",
        businessEmail: "",
      },
    });

  const formValues = watch();

  const summaryItems = [
    { label: "Business Type", value: formValues.businessType || "—" },
    { label: "Service Type", value: formValues.serviceType || "—" },
    { label: "Provider Name", value: formValues.name || "—" },
    { label: "Description", value: formValues.description || "—" },
    { label: "Email", value: formValues.businessEmail || "—" },
    { label: "Phone", value: formValues.businessPhone || "—" },
    { label: "Address", value: formValues.address || "—" },
  ];

  const stepFields: (keyof providerFormType)[][] = [
    ["businessType"],
    ["serviceType", "name"],
    ["businessEmail"],
    [],
  ];

  const go = (nextStep: number) => {
    setDirection(nextStep > step ? 1 : -1);
    setStep(nextStep);
  };

  const canNext =
    step === 0
      ? !!formValues.businessType
      : step === 1
        ? !!formValues.serviceType && !!formValues.name?.trim()
        : step === 2
          ? !!formValues.businessEmail?.trim()
          : true;

  const handleContinue = async () => {
    const fields = stepFields[step];

    if (!fields.length) {
      if (step < STEPS.length - 1) {
        go(step + 1);
      }
      return;
    }

    const isValid = await trigger(fields);
    if (isValid) {
      go(step + 1);
    }
  };

  const onSubmit = (data: providerFormType) => {
    console.log("Form submitted:", data);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={spring}
          className="max-w-sm space-y-4 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ ...spring, delay: 0.1 }}
            className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary"
          >
            <Check className="h-8 w-8" />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18 }}
            className="text-2xl font-semibold"
          >
            Application submitted!
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.24 }}
            className="text-sm text-muted-foreground"
          >
            We’ll review your provider application and get back to you. Keep an
            eye on your email or notifications.
          </motion.p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="mx-auto w-full max-w-2xl px-4 py-12 md:px-6 sm:py-16">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={spring}
          className="my-10 space-y-3"
        >
          <div className="flex items-center gap-2 text-sm font-medium text-primary">
            <Sparkles className="h-4 w-4" />
            <span>Provider Application</span>
          </div>

          <h1 className="text-3xl font-bold tracking-tight">
            Become a Provider
          </h1>

          <p className="text-sm leading-relaxed text-muted-foreground">
            Join our network and offer your services to thousands of customers.
          </p>

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-muted-foreground">
              Step {step + 1} of {STEPS.length} —{" "}
              <span className="font-medium text-foreground">{STEPS[step]}</span>
            </span>
            <StepIndicator current={step} total={STEPS.length} />
          </div>

          <div className="h-px overflow-hidden rounded-full bg-muted">
            <motion.div
              className="h-full rounded-full bg-primary"
              animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
            />
          </div>
        </motion.div>

        {/* FORM ONLY */}
        <form
          onSubmit={(e) => e.preventDefault()}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              const target = e.target as HTMLElement;
              const isTextarea = target.tagName === "TEXTAREA";

              if (!isTextarea) {
                e.preventDefault();
              }
            }
          }}
        >
          <div className="relative">
            <AnimatePresence custom={direction} mode="wait">
              <motion.div
                key={step}
                custom={direction}
                variants={{
                  enter: (d: number) => ({ opacity: 0, x: d * 32 }),
                  center: { opacity: 1, x: 0 },
                  exit: (d: number) => ({ opacity: 0, x: d * -32 }),
                }}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ ...spring, duration: 0.28 }}
              >
                {step === 0 && (
                  <div className="space-y-4">
                    <p className="mb-6 text-sm text-muted-foreground">
                      How would you describe your business structure?
                    </p>

                    <div className="grid gap-3">
                      {BUSINESS_TYPES.map(({ value, label, desc }, i) => (
                        <motion.button
                          key={value}
                          type="button"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ ...spring, delay: i * 0.06 }}
                          onClick={() =>
                            setValue("businessType", value, {
                              shouldDirty: true,
                              shouldTouch: true,
                              shouldValidate: true,
                            })
                          }
                          className={cn(
                            "flex items-center gap-4 rounded-xl border p-4 text-left transition-all duration-200 hover:border-primary/50 hover:bg-primary/5",
                            formValues.businessType === value
                              ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                              : "border-border bg-background",
                          )}
                        >
                          <div
                            className={cn(
                              "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors",
                              formValues.businessType === value
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-muted-foreground",
                            )}
                          >
                            {value === "individual" && (
                              <User className="h-5 w-5" />
                            )}
                            {value === "company" && (
                              <Building2 className="h-5 w-5" />
                            )}
                            {value === "agency" && (
                              <Briefcase className="h-5 w-5" />
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium">{label}</p>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              {desc}
                            </p>
                          </div>

                          <AnimatePresence>
                            {formValues.businessType === value && (
                              <motion.div
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0, opacity: 0 }}
                                transition={spring}
                                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground"
                              >
                                <Check className="h-3 w-3" />
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}

                {step === 1 && (
                  <div className="space-y-5">
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground">
                        What type of service do you offer?
                      </p>

                      <div className="grid grid-cols-2 gap-2">
                        {SERVICE_TYPES.map(
                          ({ value, label, icon: Icon }, i) => (
                            <motion.button
                              key={value}
                              type="button"
                              initial={{ opacity: 0, scale: 0.92 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ ...spring, delay: i * 0.05 }}
                              onClick={() =>
                                setValue("serviceType", value, {
                                  shouldDirty: true,
                                  shouldTouch: true,
                                  shouldValidate: true,
                                })
                              }
                              className={cn(
                                "flex flex-col items-center gap-2 rounded-xl border p-4 text-center transition-all duration-200 hover:border-primary/50 hover:bg-primary/5",
                                formValues.serviceType === value
                                  ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                                  : "border-border",
                              )}
                            >
                              <div
                                className={cn(
                                  "flex h-9 w-9 items-center justify-center rounded-lg transition-colors",
                                  formValues.serviceType === value
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted text-muted-foreground",
                                )}
                              >
                                <Icon className="h-4 w-4" />
                              </div>

                              <span className="text-xs font-medium leading-tight">
                                {label}
                              </span>
                            </motion.button>
                          ),
                        )}
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <Field
                        label="Provider Name"
                        hint="This will be your public display name."
                      >
                        <Input
                          {...register("name", { required: true })}
                          placeholder="e.g. Sunrise Maintenance Co."
                        />
                      </Field>

                      <Field
                        label="Description"
                        hint="Tell customers what makes you unique. (optional)"
                      >
                        <Textarea
                          {...register("description")}
                          placeholder="We specialize in…"
                          rows={3}
                          className="resize-none"
                        />
                      </Field>

                      <div className="grid grid-cols-2 gap-3">
                        <Field label="Logo URL" hint="optional">
                          <div className="relative">
                            <ImageIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              {...register("logo")}
                              className="pl-9"
                              placeholder="https://…"
                            />
                          </div>
                        </Field>

                        <Field label="Cover URL" hint="optional">
                          <div className="relative">
                            <ImageIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              {...register("cover")}
                              className="pl-9"
                              placeholder="https://…"
                            />
                          </div>
                        </Field>
                      </div>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-4">
                    <p className="mb-2 text-sm text-muted-foreground">
                      How can customers and our team reach you?
                    </p>

                    <Field label="Business Email">
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          {...register("businessEmail", { required: true })}
                          className="pl-9"
                          type="email"
                          placeholder="hello@yourbusiness.com"
                        />
                      </div>
                    </Field>

                    <Field label="Business Phone" hint="optional">
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          {...register("businessPhone")}
                          className="pl-9"
                          type="tel"
                          placeholder="+1 (555) 000-0000"
                        />
                      </div>
                    </Field>

                    <Field
                      label="Address"
                      hint="optional — helps customers find you locally."
                    >
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Textarea
                          {...register("address")}
                          className="resize-none pl-9"
                          rows={3}
                          placeholder="123 Main St, City, Country"
                        />
                      </div>
                    </Field>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-4">
                    <p className="mb-2 text-sm text-muted-foreground">
                      Review your details before submitting.
                    </p>

                    {summaryItems.map(({ label, value }, i) => (
                      <motion.div
                        key={label}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ ...spring, delay: i * 0.04 }}
                        className="flex items-start justify-between gap-4 border-b border-border/60 py-3 last:border-0"
                      >
                        <span className="w-32 shrink-0 text-xs text-muted-foreground">
                          {label}
                        </span>
                        <span className="break-all text-right text-sm font-medium capitalize">
                          {value}
                        </span>
                      </motion.div>
                    ))}

                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.35 }}
                      className="rounded-xl border border-border/60 bg-muted/30 p-4 text-xs text-muted-foreground"
                    >
                      By submitting, your application will be reviewed by our
                      team. You’ll receive a confirmation notification once
                      approved. Status starts as{" "}
                      <span className="font-medium text-foreground">
                        pending
                      </span>
                      .
                    </motion.div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </form>

        {/* NAVIGATION OUTSIDE FORM */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-16 flex items-center justify-between gap-3"
        >
          <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
            <Button
              variant="outline"
              type="button"
              onClick={() => {
                if (step > 0) go(step - 1);
              }}
              disabled={step === 0}
              className="gap-1.5"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </Button>
          </motion.div>

          <motion.div
            whileHover={{ scale: canNext ? 1.01 : 1 }}
            whileTap={{ scale: canNext ? 0.98 : 1 }}
          >
            {step < STEPS.length - 1 ? (
              <Button
                type="button"
                onClick={handleContinue}
                disabled={!canNext}
                className="gap-1.5"
              >
                Continue
                <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit(onSubmit)}
                className="gap-1.5 px-6"
              >
                <Sparkles className="h-4 w-4" />
                Submit Application
              </Button>
            )}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
