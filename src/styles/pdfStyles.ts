import { StyleSheet, Font } from '@react-pdf/renderer';
import { Colors, FontSizes } from '@/styles/styles';

Font.register({
  family: 'Poppins',
  fonts: [
    {
      src: 'https://raw.githubusercontent.com/google/fonts/main/ofl/poppins/Poppins-Regular.ttf',
      fontWeight: 'normal',
    },
    {
      src: 'https://raw.githubusercontent.com/google/fonts/main/ofl/poppins/Poppins-Bold.ttf',
      fontWeight: 'bold',
    },
  ],
});

const pdfStyles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: FontSizes.c3.size,
    fontFamily: 'Poppins',
    color: Colors.textMain,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    alignItems: 'center',
  },

  logo: {
    width: 100,
    height: 90,
    objectFit: 'contain',
  },
  titleContainer: {
    textAlign: 'center',
  },
  title: {
    fontSize: FontSizes.s1.size,
    fontWeight: 'normal',
    color: Colors.primary,
  },
  subtitle: {
    fontSize: FontSizes.c1.size,
    color: Colors.textMain,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    color: Colors.textWhite,
    paddingVertical: 6,
    paddingHorizontal: 4,
    fontWeight: 'normal',
  },
  row: {
    flexDirection: 'row',
    paddingVertical: 4,
    paddingHorizontal: 4,
    borderBottom: `0.5px solid ${Colors.stroke}`,
    backgroundColor: Colors.secondaryWhite,
  },
  cell: {
    flex: 1,
    textAlign: 'left',
    fontSize: FontSizes.c1.size,
    paddingHorizontal: 4,
  },
  summary: {
    marginTop: 20,
    alignSelf: 'flex-end',
    width: '40%',
    fontSize: FontSizes.c1.size,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 2,
  },
});

export default pdfStyles;
