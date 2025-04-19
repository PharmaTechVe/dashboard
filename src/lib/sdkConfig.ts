import { PharmaTech } from '@pharmatech/sdk';

const devModeFlag = process.env.NEXT_PUBLIC_DEV_MODE === 'true';

export const api = PharmaTech.getInstance(devModeFlag);
