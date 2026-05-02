import { createBrowserClient } from "@/lib/supabase/client";
import { bucketMap } from "@/lib/supabase/storage";

export const storageService = {
  uploadAttachment: async (file: File, recordId: string, bucketKey: keyof typeof bucketMap) => {
    const supabase = createBrowserClient();
    const bucket = bucketMap[bucketKey];
    const filePath = `${recordId}/${file.name}`;

    return supabase.storage.from(bucket).upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });
  },
  avatarUrl: (path: string) => {
    return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucketMap.avatars}/${path}`;
  },
};
