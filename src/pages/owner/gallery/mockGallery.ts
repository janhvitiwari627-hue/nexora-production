export interface GalleryPhoto {
  id: string;
  url: string;
  category: string;
  isCover: boolean;
}

export interface GalleryVideo {
  id: string;
  url: string;
  title: string;
  thumbnail: string;
}

export const PHOTO_CATEGORIES = ["Interior", "Hair", "Nails", "Makeup", "Team", "Before/After"];

export const MAX_PHOTOS = 10;
export const MAX_VIDEOS = 10;

export const initialPhotos: GalleryPhoto[] = [
  {
    id: "p1",
    url: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600",
    category: "Interior",
    isCover: true,
  },
  {
    id: "p2",
    url: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600",
    category: "Hair",
    isCover: false,
  },
  {
    id: "p3",
    url: "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600",
    category: "Nails",
    isCover: false,
  },
  {
    id: "p4",
    url: "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=600",
    category: "Makeup",
    isCover: false,
  },
  {
    id: "p5",
    url: "https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?w=600",
    category: "Team",
    isCover: false,
  },
];

export const initialVideos: GalleryVideo[] = [
  {
    id: "v1",
    url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    title: "Salon Tour — Behind the Scenes",
    thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
  },
];

export function extractYouTubeId(url: string): string | null {
  const patterns = [/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{11})/];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}
