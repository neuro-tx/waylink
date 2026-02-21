"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, Variants } from "framer-motion";
import { Star, MapPin, Users, BadgeCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { displayMedia, normalizeLocation } from "@/lib/helpers";
import { Location, Media } from "@/lib/all-types";

type Provider = {
  id: string;
  name: string;
  logo: string | null;
  is_verified: boolean;
};

type Product = {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  basePrice: string;
  currency: string;
  avgRate: string;
  reviews: number;
  type: "experience" | "transport";
  bookings: number;
  media: Media[];
  locations: Location[];
  provider: Provider;
};

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

export function FeaturedProductGrid({ products }: { products: Product[] }) {
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

export function ProductCard({ product }: { product: Product }) {
  const { cover } = displayMedia(product.media);
  const { to } = normalizeLocation(product.locations);
  const router = useRouter();

  return (
    <Card className="group overflow-hidden rounded-xl border shadow-sm pt-0 transition-all duration-300">
      <div className="relative h-56 w-full overflow-hidden">
        {cover && (
          <Image
            src={cover}
            alt={product.title}
            fill
            className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-102"
          />
        )}

        <div className="absolute inset-0 bg-linear-to-t from-black/30 via-black/10 to-transparent opacity-80" />

        <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-black/70 px-3 py-1 text-xs text-white backdrop-blur">
          <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-400" />
          <span>{product.avgRate}</span>
          <span className="opacity-70">({product.reviews})</span>
        </div>
      </div>

      <CardContent className="flex h-[calc(100%-14rem)] flex-col justify-between space-y-3 px-3">
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h3 className="line-clamp-1 text-base font-semibold leading-tight">
              {product.title}
            </h3>

            {product.provider?.is_verified && (
              <BadgeCheck className="h-4.5 w-4.5 text-blue-500 select-none" />
            )}
          </div>

          <p className="line-clamp-2 text-sm text-muted-foreground">
            {product.shortDescription}
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span className="truncate text-xs">
                {to?.city}, {to?.country}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{product.bookings}+ booked</span>
            </div>
          </div>
          <Separator />

          <div className="flex items-end justify-between">
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">
                Starting from
              </span>
              <span className="text-xl font-bold tracking-tight">
                {product.currency} {product.basePrice}
              </span>
            </div>

            <Button
              size="sm"
              variant="outline"
              onClick={() => router.push(`/products/${product.id}`)}
            >
              View Details
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
