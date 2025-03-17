import { Poppins } from 'next/font/google';

export const Colors = {
  primary: '#1C2143',
  secondary: '#2ECC71',
  secondaryLight: '#A3E4D7',
  secondaryWhite: '#FFFFFF',
  disabled: '#D3D3D3',
  primaryTransparent: 'rgb(28, 33, 67, .75)',

  textMain: '#393938',
  textWhite: '#FFFFFF',
  textHighContrast: '#000000',
  textLowContrast: '#666666',
  stroke: '#DFE4EA',
  disableText: '#777675',
  placeholder: '#666666',

  semanticSuccess: '#00C814',
  semanticWarning: '#FFD569',
  semanticDanger: '#E10000',
  semanticInfo: '#A3E4D7',

  iconMainDefault: '#292D32',
  iconWhite: '#FFFFFF',
  iconMainPrimary: '#1C2143',
  iconMainSecondary: '#A3E4D7',

  menuWhite: '#FFFFFF',
  menuPrimary: '#1C2143',

  toggleOn: '#1C2143',
  toggleOff: '#D7D5D3',
};

export const FontSizes = {
  h1: { size: 48, lineHeight: 58 },
  h2: { size: 40, lineHeight: 48 },
  h3: { size: 32, lineHeight: 38 },
  h4: { size: 28, lineHeight: 34 },
  h5: { size: 24, lineHeight: 28 },
  s1: { size: 18, lineHeight: 28 },
  s2: { size: 16, lineHeight: 24 },
  b1: { size: 16, lineHeight: 24 },
  b3: { size: 14, lineHeight: 20 },
  c1: { size: 12, lineHeight: 16 },
  c3: { size: 10, lineHeight: 14 },
  label: { size: 12, lineHeight: 16 },
};

export const poppins = Poppins({
  variable: '--font-poppins',
  subsets: ['latin'],
  weight: ['400', '500', '600'],
});

const theme = {
  Colors,
  FontSizes,
  poppins,
};

export default theme;
