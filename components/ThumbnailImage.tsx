import { initials } from "@/lib/helpers";
import { cn } from "@/lib/utils";
import Image from "next/image";

const ThumbnailImage = ({
  alternative,
  src,
  className,
}: {
  alternative: string;
  src?: string | null;
  className?: string;
}) => {
  const hue =
    (alternative.charCodeAt(0) * 41 + (alternative.charCodeAt(1) ?? 0) * 17) %
    360;
  if (src)
    return (
      <Image
        src={src}
        alt={alternative}
        className={cn("h-9 w-9 rounded-lg object-cover shrink-0", className)}
        width={40}
        height={40}
      />
    );

  return (
    <div
      className={cn(
        "h-9 w-9 rounded-lg flex items-center justify-center text-xs font-semibold shrink-0 select-none",
        className,
      )}
      style={{
        background: `oklch(28% 0.07 ${hue})`,
        color: `oklch(82% 0.14 ${hue})`,
      }}
    >
      {initials(alternative)}
    </div>
  );
};

export default ThumbnailImage;
