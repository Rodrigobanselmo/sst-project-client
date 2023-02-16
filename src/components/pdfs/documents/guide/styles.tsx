import { StyleSheet } from '@react-pdf/renderer';

const table = {
  padding: 6,
  paddingVertical: 3,
  border: '1 solid #000',
};

export const s = StyleSheet.create({
  page: {
    paddingTop: 35,
    paddingBottom: 35,
    paddingHorizontal: 35,
    fontFamily: 'Open Sans',
    backgroundColor: '#fff',
  },
  image: {
    width: 100,
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
  },
  tBox: {
    backgroundColor: '#e3eeee',
    marginRight: 3,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 10,
  },
  bullet: { marginHorizontal: 7 },
  bulletDown: { marginLeft: 14 },
  header: {
    fontSize: 10,
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: 'extrabold',
    color: 'black',
  },
  title: {
    width: 400,
    fontSize: 9,
    fontWeight: 'bold',
    color: 'black',
  },
  subTitle: {
    fontSize: 9,
    fontWeight: 'normal',
    color: 'black',
  },
  h1: {
    fontSize: 8,
    fontWeight: 'bold',
    color: 'black',
    textAlign: 'center',
  },
  body: {
    fontSize: 8,
    fontWeight: 'normal',
  },
  bodyB1: {
    fontSize: 8,
    fontWeight: 'semibold',
  },
  bodySB1: {
    fontSize: 8,
    fontWeight: 'semibold',
  },
  bodyB2: {
    fontSize: 9,
    fontWeight: 'bold',
  },
  label: {
    fontSize: 7,
    fontWeight: 'normal',
    color: '#3c3c3c',
  },
  bodyS: {
    fontSize: 7,
    fontWeight: 'normal',
  },
  bodyBS: {
    fontSize: 7,
    fontWeight: 'bold',
  },
  authText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  dashedDivider: {
    borderBottom: '1 dashed #000',
    marginHorizontal: -35,
  },
  ta: {
    textAlign: 'center',
  },
  table1: {
    ...table,
  },
  table1L: {
    ...table,
    borderLeft: 0,
  },
  table2: {
    ...table,
    borderTop: 0,
  },
  table2L: {
    ...table,
    borderTop: 0,
    borderLeft: 0,
  },
});
