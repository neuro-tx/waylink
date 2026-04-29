import { Location, Media } from "./all-types";

export const displayMedia = (media: Media[]) => {
  const images: string[] = [];
  const videos: Media[] = [];
  let cover: string | undefined;

  if (!media) return { images, videos, cover };

  media.forEach((m) => {
    switch (m.type) {
      case "video":
        videos.push(m);
        break;

      case "image":
      default:
        if (m.is_cover) {
          cover = m.url;
        }
        images.push(m.url);
        break;
    }
  });

  return {
    images,
    videos,
    cover,
  };
};

export const normalizeLocation = (locations: Location[]) => {
  let from: Location | undefined;
  let to: Location | undefined;
  const stops: Location[] = [];

  locations.map((l) => {
    switch (l.type) {
      case "start":
        from = l;
        break;
      case "end":
        to = l;
        break;
      case "stop":
      default:
        stops.push(l);
    }
  });

  return {
    from,
    to,
    stops,
  };
};

export function getRouteLocations(
  locations: Pick<Location, "id" | "city" | "country" | "type">[],
) {
  const start = locations.find((l) => l.type === "start");
  const end = locations.find((l) => l.type === "end");
  const stops = locations.filter((l) => l.type === "stop");
  return { start, end, stops };
}

export function fmtCurrency(amount: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function fmtDateTime(d: string | Date | null) {
  if (!d) return "—";
  return new Date(d).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
