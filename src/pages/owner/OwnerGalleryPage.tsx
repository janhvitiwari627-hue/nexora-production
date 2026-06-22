import { useState } from "react";
import { Image as ImageIcon, Video } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PhotosTab } from "./gallery/PhotosTab";
import { LivePhotosTab } from "./gallery/LivePhotosTab";
import { VideosTab } from "./gallery/VideosTab";
import {
  initialPhotos,
  initialVideos,
  type GalleryPhoto,
  type GalleryVideo,
} from "./gallery/mockGallery";
import { useOwnerContext } from "@/hooks/use-owner-context";

export function OwnerGalleryPage() {
  const { activeSalonId } = useOwnerContext();
  const [photos, setPhotos] = useState<GalleryPhoto[]>(initialPhotos);
  const [videos, setVideos] = useState<GalleryVideo[]>(initialVideos);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
        <header className="mb-6">
          <h1 className="text-heading text-3xl font-bold">Gallery</h1>
          <p className="text-muted-foreground mt-1">
            Showcase your salon with photos and videos. Set a cover and reorder anytime.
          </p>
        </header>

        <Tabs defaultValue="photos">
          <TabsList>
            <TabsTrigger value="photos" className="gap-2">
              <ImageIcon className="h-4 w-4" /> Photos
            </TabsTrigger>
            <TabsTrigger value="videos" className="gap-2">
              <Video className="h-4 w-4" /> Videos
            </TabsTrigger>
          </TabsList>
          <TabsContent value="photos" className="mt-6">
            {activeSalonId ? (
              <LivePhotosTab salonId={activeSalonId} />
            ) : (
              <PhotosTab photos={photos} setPhotos={setPhotos} />
            )}
          </TabsContent>
          <TabsContent value="videos" className="mt-6">
            <VideosTab videos={videos} setVideos={setVideos} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

