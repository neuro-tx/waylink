import { Location, Media } from "./all-types";

export const displayMedia = (media: Media[]) => {
  const images: string[] = [];
  const videos: Media[] = [];
  let cover: string | undefined;

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
