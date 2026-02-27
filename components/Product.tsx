"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, Variants } from "framer-motion";
import { Star, MapPin, Users, BadgeCheck } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { displayMedia, normalizeLocation } from "@/lib/helpers";
import { ProductCardProps } from "@/lib/all-types";

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
      ease: "easeOut",
    },
  },
};

const itemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 25,
    scale: 0.96,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
};

export function ProductGrid({ products }: { products: ProductCardProps[] }) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "40px" }}
      className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
    >
      {products.map((p) => (
        <motion.div key={p.id} variants={itemVariants}>
          <ProductCard product={p} />
        </motion.div>
      ))}
    </motion.div>
  );
}

export function ProductCard({ product }: { product: ProductCardProps }) {
  const { cover } = displayMedia(product.media);
  const { to } = normalizeLocation(product.locations);
  const router = useRouter();

  return (
    <div className="group relative overflow-hidden rounded-2xl border box">
      <div className="relative h-52 w-full aspect-square overflow-hidden flex-1">
        {cover ? (
          <Image
            src={cover}
            alt={product.title}
            fill
            className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
          />
        ) : (
          <div
            className="w-full h-full"
            style={{
              background: "linear-gradient(135deg, #FF6B3522, #FF6B3508)",
            }}
          />
        )}

        <div className="absolute inset-0 bg-linear-to-t from-black/30 via-black/10 to-transparent opacity-80" />

        <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-black/70 px-3 py-1 text-xs text-white backdrop-blur">
          <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-400" />
          <span>{product.avgRate}</span>
          <span className="opacity-70">({product.reviews})</span>
        </div>
      </div>

      <div className="flex flex-col flex-1 justify-between p-4 gap-4">
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h3
              className="truncate text-base font-bold leading-tight"
              style={{ fontFamily: "Georgia, serif" }}
            >
              {product.title}
            </h3>

            {product.provider?.isVerified && (
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="shrink-0 mt-0.5"
              >
                <BadgeCheck className="h-4.5 w-4.5 text-blue-10" />
              </motion.div>
            )}
          </div>

          <p className="line-clamp-2 text-sm text-muted-foreground">
            {product.shortDescription}
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-green-1">
            <div className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-orange-3" />
              <div className="truncate max-w-30">
                {to?.city && to?.country ? (
                  <span>
                    {to.city}, {to.country}
                  </span>
                ) : (
                  <span className="underline underline-offset-2">
                    Not Detected
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5 text-orange-3" />
              <span>
                {product.bookings > 0
                  ? `${product.bookings}+ booked`
                  : "No bookings yet"}
              </span>
            </div>
          </div>

          <Separator />

          <div className="flex items-end justify-between gap-3">
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">
                Starting from
              </span>
              <span className="text-xl font-bold tracking-tight">
                <span className="text-sm font-semibold mr-0.5 text-orange-3">
                  {product.currency}
                </span>
                {product.basePrice}
              </span>
            </div>

            <motion.button
              type="button"
              onClick={() => router.push(`/experince/${product.id}`)}
              whileTap={{ scale: 0.97 }}
              whileHover={{ scale: 1.01 }}
              className="shrink-0 cursor-pointer px-4 py-2 rounded-xl text-xs font-semibold border transition-colors duration-200 text-orange-3"
              style={{ borderColor: `#FF6B3550`, background: `#FF6B3510` }}
            >
              View Details
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}
