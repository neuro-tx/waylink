"use client";

import { motion } from "motion/react";
import { Card, CardContent, CardFooter, CardTitle } from "@/components/ui/card";
import { ArrowRight, MapPin } from "lucide-react";
import { Product } from "@/lib/all-types";
import Image from "next/image";
import { displayMedia, normalizeLocation } from "@/lib/helpers";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";

interface Props {
  products: Product[];
}

export default function FeaturedGrid({ products }: Props) {
  const router = useRouter();

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={{
        hidden: {},
        visible: {
          transition: { staggerChildren: 0.12 },
        },
      }}
      className="grid md:grid-cols-2 lg:grid-cols-3 gap-4"
    >
      {products.map((product) => {
        const { cover } = displayMedia(product.media);
        const { to } = normalizeLocation(product.locations);

        return (
          <motion.div
            key={product.id}
            variants={{
              hidden: { opacity: 0, y: 40 },
              visible: { opacity: 1, y: 0 },
            }}
            transition={{ duration: 0.5 }}
            className="w-full overflow-hidden"
          >
            <Card className="group overflow-hidden rounded-3xl pt-0">
              <CardTitle>
                {cover && (
                  <div className="h-56 overflow-hidden relative">
                    <Image
                      src={cover}
                      alt={product.title}
                      width={300}
                      height={300}
                      className="w-full h-full object-cover group-hover:scale-101 transition-transform duration-700"
                    />
                  </div>
                )}
              </CardTitle>
              <CardContent className="px-4">
                <div className="flex items-center justify-between flex-nowrap gap-3 mb-2">
                  {to && (
                    <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                      <MapPin size={16} />
                      {to?.city}, {to?.country}
                    </div>
                  )}
                  <Badge variant="outline" className="text-red-500">
                    {product.basePrice} {product.currency}
                  </Badge>
                </div>

                <h3 className="text-base font-bold ">{product.title}</h3>

                <p className="text-sm text-muted-foreground line-clamp-2">
                  {product.shortDescription}
                </p>
              </CardContent>
              <CardFooter className="px-4">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full cursor-pointer"
                  onClick={() => router.push(`/products/${product.id}`)}
                >
                  <span>View Experience</span>
                  <ArrowRight />
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
