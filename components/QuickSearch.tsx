"use client";

import React, { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { Search, MapPin, Calendar, Compass, Car } from "lucide-react";

type ServiceType = "trip" | "transport";

interface FormData {
  startLocation: string;
  destination: string;
  startDate: string;
  endDate: string;
}

interface ServiceButtonProps {
  active: boolean;
  onClick: () => void;
  label: string;
  icon: React.ReactNode;
  accent: string;
}

interface FeatureTagProps {
  label: string;
  active: boolean;
  onClick: () => void;
  accent: string;
}

interface SearchFormProps {
  service: ServiceType;
  formData: FormData;
  onInputChange: (field: keyof FormData, value: string) => void;
  onSearch: () => void;
}

const triptypes = [
  "Adventure",
  "Cultural",
  "Beach",
  "Mountain",
  "City Break",
  "Wildlife",
  "Wellness",
  "Food & Wine",
];
const transportType = [
  "Private Car",
  "Bus",
  "Minivan",
  "Limousine",
  "Airport Transfer",
  "Boat",
  "Helicopter",
];

const containerVariants: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
      staggerChildren: 0.12,
    },
  },
};

const childVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

const inputVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  },
};

const ServiceButton = React.memo<ServiceButtonProps>(
  ({ active, onClick, label, icon, accent }) => (
    <motion.button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className="relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 overflow-hidden border"
      style={{
        background: active
          ? `linear-gradient(135deg, ${accent}22, ${accent}10)`
          : "transparent",
        borderColor: active ? `${accent}60` : "transparent",
        color: active ? accent : undefined,
      }}
    >
      <span className="relative z-10 flex items-center gap-2">
        {icon}
        {label}
      </span>
    </motion.button>
  ),
);
ServiceButton.displayName = "ServiceButton";

const FeatureTag = React.memo<FeatureTagProps>(
  ({ label, active, onClick, accent }) => (
    <motion.button
      layout
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.85 }}
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`text-xs px-3 py-1.5 rounded-full capitalize cursor-pointer select-none border transition-all duration-200 ${active && "font-semibold"}`}
      style={{
        background: active ? `${accent}18` : undefined,
        borderColor: active ? `${accent}50` : undefined,
        color: active ? accent : undefined,
      }}
    >
      {label}
    </motion.button>
  ),
);
FeatureTag.displayName = "FeatureTag";

function StyledInput({
  id,
  type = "text",
  placeholder,
  value,
  onChange,
  icon,
  label,
  accent,
}: {
  id: string;
  type?: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  icon: React.ReactNode;
  label: string;
  accent: string;
}) {
  const [focused, setFocused] = useState(false);

  return (
    <motion.div variants={inputVariants} className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="flex items-center gap-1.5 text-xs font-semibold tracking-wide uppercase"
        style={{ color: focused ? accent : undefined }}
      >
        <span
          className="transition-colors duration-200"
          style={{ color: focused ? accent : undefined }}
        >
          {icon}
        </span>
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="w-full px-4 py-2.5 rounded-xl text-sm font-medium outline-none transition-all duration-200 bg-white/80 dark:bg-[#0f0f14]/80 text-neutral-700 dark:text-neutral-300 placeholder:text-slate-500 border border-border"
          style={{
            borderColor: focused ? `${accent}60` : undefined,
          }}
        />
        <motion.div
          className="absolute bottom-0 left-3 right-3 h-px rounded-full"
          style={{ background: accent }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: focused ? 1 : 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        />
      </div>
    </motion.div>
  );
}

const SearchForm = React.memo<SearchFormProps>(
  ({ service, formData, onInputChange, onSearch }) => {
    const accent = service === "trip" ? "#FF6B35" : "#845EF7";

    const labels = useMemo(
      () =>
        service === "trip"
          ? {
              startLocation: "Starting Point",
              destination: "Destination",
              startDate: "Check-in Date",
              endDate: "Check-out Date",
            }
          : {
              startLocation: "Pick-up Location",
              destination: "Drop-off Location",
              startDate: "Departure",
              endDate: "Return (optional)",
            },
      [service],
    );

    return (
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
        }}
        className="space-y-4"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <StyledInput
            id="startLocation"
            placeholder={labels.startLocation}
            value={formData.startLocation}
            onChange={(v) => onInputChange("startLocation", v)}
            icon={<MapPin className="w-3.5 h-3.5" />}
            label={labels.startLocation}
            accent={accent}
          />
          <StyledInput
            id="destination"
            placeholder={labels.destination}
            value={formData.destination}
            onChange={(v) => onInputChange("destination", v)}
            icon={<MapPin className="w-3.5 h-3.5" />}
            label={labels.destination}
            accent={accent}
          />
        </div>

        <div className="flex items-end gap-3 flex-col sm:flex-row">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
            <StyledInput
              id="startDate"
              type={service === "trip" ? "date" : "datetime-local"}
              placeholder={labels.startDate}
              value={formData.startDate}
              onChange={(v) => onInputChange("startDate", v)}
              icon={<Calendar className="w-3.5 h-3.5" />}
              label={labels.startDate}
              accent={accent}
            />
            <StyledInput
              id="endDate"
              type={service === "trip" ? "date" : "datetime-local"}
              placeholder={labels.endDate}
              value={formData.endDate}
              onChange={(v) => onInputChange("endDate", v)}
              icon={<Calendar className="w-3.5 h-3.5" />}
              label={labels.endDate}
              accent={accent}
            />
          </div>

          <motion.button
            type="button"
            onClick={onSearch}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white shrink-0 w-full sm:w-auto cursor-pointer"
            style={{
              background: `linear-gradient(135deg, ${accent}, ${accent}cc)`,
            }}
          >
            <Search className="w-4 h-4" />
            Search
          </motion.button>
        </div>
      </motion.div>
    );
  },
);
SearchForm.displayName = "SearchForm";

export default function QuickSearch() {
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

  const activeAccent = service === "trip" ? "#FF6B35" : "#845EF7";

  const selectFeature = useCallback((value: string) => {
    setFeature((prev) => (prev === value ? "" : value));
  }, []);

  const handleServiceChange = useCallback((newService: ServiceType) => {
    setService(newService);
    setFeature("");
  }, []);

  const handleInputChange = useCallback(
    (field: keyof FormData, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  const handleSearch = useCallback(() => {
    console.log("Search:", { service, feature, ...formData });
  }, [service, feature, formData]);

  return (
    <section className="bg-waylink-fade w-full py-20">
      <div className="mian-container relative space-y-10 font-sans">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="text-center"
        >
          <motion.div
            variants={childVariants}
            className="flex items-center justify-center gap-3 mb-4"
          >
            <div
              className="h-px w-10"
              style={{
                background: "linear-gradient(to right, transparent, #FF6B35)",
              }}
            />
            <span
              className="text-xs font-bold tracking-[0.22em] uppercase"
              style={{ color: "#FF6B35" }}
            >
              Quick Search
            </span>
            <div
              className="h-px w-10"
              style={{
                background: "linear-gradient(to left, transparent, #FF6B35)",
              }}
            />
          </motion.div>

          <motion.h2
            variants={childVariants}
            className="text-4xl md:text-5xl font-extrabold leading-tight mb-3 text-neutral-800 dark:text-neutral-200"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Explore Without{" "}
            <span className="bg-clip-text text-transparent bg-linear-135 from-orange-3 via-blue-10 to-green-1">
              Limits.
            </span>
          </motion.h2>

          <motion.p
            variants={childVariants}
            className="text-sm font-medium max-w-md mx-auto leading-relaxed text-gray-light"
          >
            Find tours, adventures, and transport services tailored to your
            needs — all in a few clicks.
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-4xl mx-auto rounded-3xl box border"
          style={{
            boxShadow:
              "0 24px 64px rgba(0,0,0,0.07), inset 0 1px 0 rgba(255,255,255,0.8)",
          }}
        >
          <div
            className="h-0.5 w-full transition-all duration-300 ease-in-out"
            style={{
              background: `linear-gradient(to right, ${activeAccent}, #845EF7, #00C9A7)`,
            }}
          />

          <div className="p-6 md:p-8 space-y-6">
            <div className="flex items-center gap-1 border-b pb-4 border-input">
              <ServiceButton
                active={service === "trip"}
                onClick={() => handleServiceChange("trip")}
                label="Experience"
                icon={<Compass className="w-4 h-4" />}
                accent="#FF6B35"
              />
              <ServiceButton
                active={service === "transport"}
                onClick={() => handleServiceChange("transport")}
                label="Transport"
                icon={<Car className="w-4 h-4" />}
                accent="#845EF7"
              />
            </div>

            <motion.div layout className="flex items-center gap-1 flex-wrap">
              <AnimatePresence key={service}>
                {featureList.map((type) => (
                  <FeatureTag
                    key={`${service}-${type}`}
                    label={type}
                    active={feature === type}
                    onClick={() => selectFeature(type)}
                    accent={activeAccent}
                  />
                ))}
              </AnimatePresence>
            </motion.div>

            <AnimatePresence key={service}>
              <motion.div
                key={service}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                <SearchForm
                  service={service}
                  formData={formData}
                  onInputChange={handleInputChange}
                  onSearch={handleSearch}
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
