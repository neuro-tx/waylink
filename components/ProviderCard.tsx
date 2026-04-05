"use client";

import {
  BusinessType,
  ProviderStatus,
  ServiceType,
  SpotlightProvider,
} from "@/lib/all-types";
import {
  BadgeCheck,
  Briefcase,
  Building2,
  Mail,
  Phone,
  Star,
  UserCircle2,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";

const SERVICE_ACCENT: Record<ServiceType, string> = {
  experience: "#FF6B35",
  transport: "#845EF7",
};

const BUSINESS_ICON: Record<BusinessType, React.ElementType> = {
  individual: UserCircle2,
  company: Building2,
  agency: Briefcase,
};

const BUSINESS_LABEL: Record<BusinessType, string> = {
  individual: "Independent",
  company: "Company",
  agency: "Agency",
};

export function ProviderCard({
  provider,
  delay = 0,
}: {
  provider: SpotlightProvider;
  delay?: number;
}) {
  const router = useRouter();
  const accent = SERVICE_ACCENT[provider.serviceType];
  const BizIcon = BUSINESS_ICON[provider.businessType];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
      className="group relative flex flex-col rounded-2xl border box font-sans overflow-hidden"
      style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}
    >
      <div className="relative h-32 w-full overflow-hidden shrink-0">
        {provider.cover ? (
          <Image
            src={provider.cover}
            alt={provider.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-101"
          />
        ) : (
          <div
            className="w-full h-full"
            style={{
              background: `linear-gradient(135deg, ${accent}28, ${accent}08)`,
            }}
          />
        )}
        <div className="absolute inset-0 bg-linear-to-t from-black/20 via-transparent to-transparent" />

        <div
          className="absolute top-0 left-0 right-0 h-0.5"
          style={{
            background: `linear-gradient(to right, ${accent}, transparent)`,
          }}
        />

        <div
          className="absolute right-2.5 top-2.5 flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium text-white capitalize backdrop-blur-sm"
          style={{ background: `${accent}cc` }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          {provider.serviceType}
        </div>
      </div>

      <div className="relative px-5 pb-5 pt-7 flex flex-col gap-4 flex-1">
        <div className="absolute -top-5 left-4 w-12 h-12 rounded-xl overflow-hidden shrink-0">
          {provider.logo ? (
            <Image
              src={provider.logo}
              alt={provider.name}
              width={48}
              height={48}
              className="w-full h-full object-cover"
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center text-2xl font-extrabold"
              style={{
                background: `${accent}5a`,
                color: accent,
              }}
            >
              {provider.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        <div className="flex items-start justify-between gap-2 mt-1">
          <div className="flex flex-col gap-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3
                className="text-base font-bold leading-tight truncate text-neutral-800 dark:text-neutral-100"
                style={{ fontFamily: "Georgia, serif" }}
              >
                {provider.name}
              </h3>
              {provider.isVerified && (
                <BadgeCheck className="w-4 h-4 text-blue-10" />
              )}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="flex items-center gap-1 text-xs text-gray-light">
                <BizIcon className="w-3 h-3" />
                {BUSINESS_LABEL[provider.businessType]}
              </span>
              <span className="flex items-center gap-1 text-xs text-gray-light">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                {provider.avgRating}
                <span className="text-muted-foreground">({provider.totalReviews})</span>
              </span>
            </div>
          </div>

          {provider.status !== "approved" && (
            <span
              className="text-[10px] px-2 py-0.5 rounded-full font-semibold shrink-0 capitalize"
              style={{
                background:
                  provider.status === "pending" ? "#FF6B3515" : "#ef444415",
                color: provider.status === "pending" ? "#FF6B35" : "#ef4444",
              }}
            >
              {provider.status}
            </span>
          )}
        </div>

        {provider.description && (
          <p className="text-xs leading-relaxed text-muted-foreground line-clamp-1">
            {provider.description}
          </p>
        )}

        {(provider.businessEmail || provider.businessPhone) && (
          <div className="flex items-center gap-3 flex-wrap text-xs text-muted-foreground">
            {provider.businessEmail && (
              <span className="flex items-center gap-1 truncate max-w-35">
                <Mail className="w-3 h-3 shrink-0" style={{ color: accent }} />
                {provider.businessEmail}
              </span>
            )}
            {provider.businessPhone && (
              <span className="flex items-center gap-1">
                <Phone className="w-3 h-3 shrink-0" style={{ color: accent }} />
                {provider.businessPhone}
              </span>
            )}
          </div>
        )}

        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Products", value: `${provider.totalProducts}` },
            {
              label: "Bookings",
              value: `${provider.totalBookings.toLocaleString()}+`,
            },
            { label: "Rating", value: provider.avgRating },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="flex flex-col items-center gap-1 rounded-xl py-2.5 border text-center"
              style={{ background: `${accent}08`, borderColor: `${accent}20` }}
            >
              <span
                className="text-base font-extrabold"
                style={{ fontFamily: "Georgia, serif" }}
              >
                {value}
              </span>
              <span className="text-xs text-muted-foreground leading-none">
                {label}
              </span>
            </div>
          ))}
        </div>

        <motion.button
          type="button"
          onClick={() => router.push(`/providers/${provider.id}`)}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          className="w-full flex items-center justify-center gap-1.5 py-3 rounded-xl text-xs font-bold cursor-pointer border"
          style={{
            background: `${accent}12`,
            borderColor: `${accent}40`,
            color: accent,
          }}
        >
          <Users className="w-3 h-3" />
          View Profile
        </motion.button>
      </div>
    </motion.div>
  );
}
