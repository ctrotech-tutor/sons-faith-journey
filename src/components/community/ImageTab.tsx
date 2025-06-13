import { TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Download, Camera } from "lucide-react";
import { motion } from "framer-motion";

export default function ImageTab({
  searchQuery,
  setSearchQuery,
  handleSearch,
  loading,
  images,
  handleImageSelect
}: {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  handleSearch: () => void;
  loading: boolean;
  images: any[];
  handleImageSelect: (image: any) => void;
}) {
  return (
    <TabsContent value="images" className="space-y-4">
      {/* Search Bar */}
      <div className="flex gap-2 items-center backdrop-blur-md bg-white/30 dark:bg-white/5 border border-white/10 p-2 rounded-xl shadow-sm">
        <Input
          className="flex-1 bg-transparent text-sm placeholder:text-purple-500 dark:placeholder:text-purple-300"
          placeholder="Search inspirational images, spiritual art..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <Button
          onClick={handleSearch}
          disabled={loading}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4"
        >
          {loading ? (
            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
          ) : (
            <Search className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Loader */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin h-8 w-8 border-2 border-purple-600 border-t-transparent rounded-full" />
        </div>
      ) : images.length === 0 ? (
        <div className="text-center text-gray-500 dark:text-gray-400 italic py-8">No images found.</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-[360px] overflow-y-auto scrollbar-thin scrollbar-thumb-purple-400 dark:scrollbar-thumb-purple-600 scrollbar-track-transparent pr-1">
          {images.map((image) => (
            <motion.div
              key={image.id}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.95 }}
              className="relative aspect-square cursor-pointer group rounded-xl overflow-hidden shadow-md"
              onClick={() => handleImageSelect(image)}
            >
              <img
                src={image.urls.small}
                alt={image.alt_description}
                className="w-full h-full object-cover"
                loading="lazy"
              />

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Download className="h-6 w-6 text-white drop-shadow" />
              </div>

              {/* Photographer info */}
              <div className="absolute bottom-1 flex items-center gap-2 left-1 right-1 text-white text-[11px] bg-black/60 backdrop-blur-md p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity text-center truncate">
                <Camera className='w-5 h-5' /> {image.user.name}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </TabsContent>
  );
}
