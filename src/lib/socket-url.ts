const devModeFlag = process.env.NEXT_PUBLIC_DEV_MODE === 'true';
const devUrl =
  process.env.NEXT_PUBLIC_DEV_URL || 'https://api-dev-8jfx.onrender.com';
const prodUrl = process.env.NEXT_PUBLIC_URL || 'https://api-d8h5.onrender.com';

export const SOCKET_URL = devModeFlag ? devUrl : prodUrl;
