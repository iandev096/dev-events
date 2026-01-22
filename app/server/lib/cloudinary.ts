import { v2 as cloudinary, UploadApiResponse } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadFile(
  file: File,
): Promise<UploadApiResponse | undefined> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          tags: ["dev-events"],
          resource_type: "image",
          upload_preset: "dev-events",
        },
        (error, result) => {
          if (error) reject(error);
          resolve(result);
        },
      )
      .end(buffer);
  });
}

export default cloudinary;
