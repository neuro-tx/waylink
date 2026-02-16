"use client";

import React, { useState, useCallback, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Search, MapPin, Calendar } from "lucide-react";
import { transportType, triptypes } from "@/lib/conatants";

import { motion, AnimatePresence, Variants } from "framer-motion";
import { Label } from "./ui/label";

type ServiceType = "trip" | "transport";

interface FormData {
  startLocation: string;
  destination: string;
  startDate: string;
  endDate: string;
}

const QuickSearch = () => {
  const [service, setService] = useState<ServiceType>("trip");
  const [feature, setFeature] = useState<string>("");

  const [formData, setFormData] = useState<FormData>({
    startLocation: "",
    destination: "",
    startDate: "",
    endDate: "",
  });

  const featureList = useMemo(
    () => (service === "trip" ? triptypes : transportType),
    [service],
  );

  const selectFeature = useCallback((value: string) => {
    setFeature(value);
  }, []);

  const handleServiceChange = useCallback((newService: ServiceType) => {
    setService(newService);
    setFeature("");
  }, []);

  const handleInputChange = useCallback(
    (field: keyof FormData, value: string) => {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    },
    [],
  );

  const handleSearch = useCallback(() => {
    console.log("Search data:", {
      service,
      feature,
      ...formData,
    });
  }, [service, feature, formData]);

  return (
    <div className="container mx-auto px-3 md:px-6 lg:px-9 relative space-y-10">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0, y: -20 },
          visible: {
            opacity: 1,
            y: 0,
            transition: {
              duration: 0.6,
              ease: "easeOut",
              staggerChildren: 0.15,
            },
          },
        }}
        className="text-center mb-6"
      >
        <motion.h2
          variants={{
            hidden: { opacity: 0, y: -10 },
            visible: { opacity: 1, y: 0 },
          }}
          className="text-4xl font-bold text-neutral-800 dark:text-neutral-200"
        >
          Explore Without Limits
        </motion.h2>

        <motion.p
          variants={{
            hidden: { opacity: 0, y: 10 },
            visible: { opacity: 1, y: 0 },
          }}
          className="text-base font-medium text-muted-foreground mt-2"
        >
          Find tours, adventures, and transport services tailored to your needs
          ~ all in a few clicks.
        </motion.p>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="max-w-4xl mx-auto p-5 rounded-xl border shadow-xl space-y-5 overflow-hidden"
      >
        <div className="flex items-center gap-2 border-b pb-3">
          <ServiceButton
            active={service === "trip"}
            onClick={() => handleServiceChange("trip")}
            label="Experience"
          />

          <ServiceButton
            active={service === "transport"}
            onClick={() => handleServiceChange("transport")}
            label="Transport"
          />
        </div>

        <motion.div layout className="flex items-center gap-1 flex-wrap">
          <AnimatePresence key={service}>
            {featureList.map((type) => (
              <FeatureTag
                key={type}
                label={type}
                active={feature === type}
                onClick={() => selectFeature(type)}
              />
            ))}
          </AnimatePresence>
        </motion.div>

        <AnimatePresence key={service} mode="sync">
          <motion.div
            key={service}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <SearchForm
              service={service}
              formData={formData}
              onInputChange={handleInputChange}
              onSearch={handleSearch}
            />
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

const ServiceButton = React.memo<{
  active: boolean;
  onClick: () => void;
  label: string;
}>(({ active, onClick, label }) => (
  <button
    type="button"
    className={cn(
      "px-4 py-2 rounded-md border text-sm font-medium cursor-pointer bg-accent transition-colors",
      active && "bg-foreground text-background",
    )}
    onClick={onClick}
    aria-pressed={active}
  >
    {label}
  </button>
));

ServiceButton.displayName = "ServiceButton";

const FeatureTag = React.memo<{
  label: string;
  active: boolean;
  onClick: () => void;
}>(({ label, active, onClick }) => (
  <motion.button
    layout
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.8 }}
    type="button"
    className={cn(
      "text-xs px-2 py-1 bg-accent text-muted-foreground rounded-md capitalize cursor-pointer select-none hover:bg-foreground hover:text-background transition-colors",
      active && "bg-foreground text-background",
    )}
    onClick={onClick}
    aria-pressed={active}
  >
    {label}
  </motion.button>
));

FeatureTag.displayName = "FeatureTag";

const SearchForm = React.memo<{
  service: ServiceType;
  formData: FormData;
  onInputChange: (field: keyof FormData, value: string) => void;
  onSearch: () => void;
}>(({ service, formData, onInputChange, onSearch }) => {
  const labels = useMemo(
    () =>
      service === "trip"
        ? {
            startLocation: "Starting Point",
            destination: "Destination",
            startDate: "Check-in Date",
            endDate: "Check-out Date",
            startDatePlaceholder: "Check-in",
            endDatePlaceholder: "Check-out",
          }
        : {
            startLocation: "Pick-up Location",
            destination: "Drop-off Location",
            startDate: "Departure Date & Time",
            endDate: "Return Date & Time",
            startDatePlaceholder: "Departure",
            endDatePlaceholder: "Return (optional)",
          },
    [service],
  );

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: { staggerChildren: 0.07 },
        },
      }}
      className="space-y-4"
    >
      {/* Locations */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <AnimatedInput>
          <div className="relative">
            <Label
              htmlFor={labels.startLocation}
              className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-2"
            >
              <MapPin className="w-4 h-4" />
              {labels.startLocation}
            </Label>

            <Input
              id={labels.startLocation}
              type="text"
              placeholder={labels.startLocation}
              value={formData.startLocation}
              onChange={(e) => onInputChange("startLocation", e.target.value)}
              className="text-sm"
            />
          </div>
        </AnimatedInput>

        <AnimatedInput>
          <div className="relative">
            <Label
              htmlFor={labels.destination}
              className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-2"
            >
              <MapPin className="w-4 h-4" />
              {labels.destination}
            </Label>

            <Input
              id={labels.destination}
              type="text"
              placeholder={labels.destination}
              value={formData.destination}
              onChange={(e) => onInputChange("destination", e.target.value)}
              className="text-sm"
            />
          </div>
        </AnimatedInput>
      </div>

      {/* Dates + Button */}
      <div className="flex items-end justify-between gap-3 flex-col sm:flex-row">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full items-baseline">
          <AnimatedInput>
            <div className="relative">
              <Label
                htmlFor={labels.startDate}
                className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                {labels.startDate}
              </Label>

              <Input
                id="startDate"
                type={service === "trip" ? "date" : "datetime-local"}
                placeholder={labels.startDatePlaceholder}
                value={formData.startDate}
                onChange={(e) => onInputChange("startDate", e.target.value)}
                className="text-sm"
              />
            </div>
          </AnimatedInput>

          <AnimatedInput>
            <div className="relative">
              <Label
                htmlFor={labels.endDate}
                className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                {labels.endDate}
              </Label>

              <Input
                id="endDate"
                type={service === "trip" ? "date" : "datetime-local"}
                placeholder={labels.endDatePlaceholder}
                value={formData.endDate}
                onChange={(e) => onInputChange("endDate", e.target.value)}
                className="text-sm"
              />
            </div>
          </AnimatedInput>
        </div>

        <motion.div whileTap={{ scale: 0.97 }} className="w-full sm:w-fit">
          <Button
            size="sm"
            className="w-full shrink-0 cursor-pointer"
            type="button"
            onClick={onSearch}
          >
            <Search className="h-4 w-4" />
            <span>Search</span>
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
});

SearchForm.displayName = "SearchForm";

const AnimatedInput = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    variants={{
      hidden: { opacity: 0, y: 10 },
      visible: { opacity: 1, y: 0 },
    }}
    className="relative"
  >
    {children}
  </motion.div>
);

export default QuickSearch;
