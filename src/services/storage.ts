import { supabase } from '@/lib/supabase';
import imageCompression from 'browser-image-compression';

export async function compressAndUploadImage(file: File, bucket: string = 'complaint-images') {
    try {
        // 1. Compress image
        const options = {
            maxSizeMB: 1,
            maxWidthOrHeight: 1920,
            useWebWorker: true,
        };
        const compressedFile = await imageCompression(file, options);

        // 2. Generate unique filename
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        // 3. Upload to Supabase
        const { data, error } = await supabase.storage
            .from(bucket)
            .upload(filePath, compressedFile);

        if (error) throw error;

        // 4. Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from(bucket)
            .getPublicUrl(filePath);

        return publicUrl;
    } catch (error) {
        console.error('Error uploading image:', error);
        throw error;
    }
}
