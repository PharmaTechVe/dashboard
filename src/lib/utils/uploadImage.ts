export async function uploadImageToCloudinary(
  file: File,
  productId: string,
  onProgress?: (progress: number) => void,
): Promise<string> {
  const res = await fetch(`/api/sign-cloudinary?productId=${productId}`);
  if (!res.ok) throw new Error('No se pudo obtener la firma');

  const { signature, timestamp, apiKey, cloudName, folder } = await res.json();

  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('api_key', apiKey);
    formData.append('timestamp', timestamp.toString());
    formData.append('signature', signature);
    formData.append('folder', folder);

    const xhr = new XMLHttpRequest();
    xhr.open(
      'POST',
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    );

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && onProgress) {
        const progress = (e.loaded / e.total) * 100;
        onProgress(progress);
      }
    });

    xhr.onload = () => {
      try {
        const response = JSON.parse(xhr.responseText);
        if (xhr.status === 200 && response.secure_url) {
          resolve(response.secure_url);
        } else {
          console.error('Cloudinary response error:', response);
          reject(
            new Error(
              response.error?.message ||
                `Upload failed with status ${xhr.status}`,
            ),
          );
        }
      } catch {
        reject(
          new Error(
            `Upload failed. Cloudinary responded with status ${xhr.status}`,
          ),
        );
      }
    };

    xhr.onerror = () =>
      reject(new Error('Error en la conexión con Cloudinary'));
    xhr.send(formData);
  });
}
