import type { NextApiRequest, NextApiResponse } from 'next';
import { v2 as cloudinary } from 'cloudinary';


const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (!cloudName || !apiKey || !apiSecret) {
  throw new Error('Faltan variables de entorno de Cloudinary');
}

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
});


type Data =
  | { result: string }
  | { message: string; error?: unknown };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  console.log('Endpoint /api/delete-cloudinary llamado');

  if (req.method !== 'POST') {
    console.warn('Método no permitido:', req.method);
    return res
      .status(405)
      .json({ message: 'Método no permitido. Usa POST.' });
  }

  const { publicId } = req.body;

  if (!publicId || typeof publicId !== 'string') {
    console.warn('⚠️ publicId inválido:', publicId);
    return res
      .status(400)
      .json({ message: 'El campo "publicId" es requerido y debe ser una cadena.' });
  }

  try {
    console.log('Eliminando imagen con publicId:', publicId);

    const result = await cloudinary.uploader.destroy(publicId);

    console.log('Resultado de Cloudinary:', result);

    if (result.result !== 'ok') {
      return res.status(500).json({
        message: 'No se pudo eliminar la imagen de Cloudinary.',
        error: result,
      });
    }

    return res.status(200).json({ result: 'Imagen eliminada exitosamente' });
  } catch (error) {
    console.error('Error eliminando en Cloudinary:', error);
    return res.status(500).json({
      message: 'Error eliminando la imagen en Cloudinary.',
      error,
    });
  }
}
