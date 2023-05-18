import { StyleSheet } from '@react-pdf/renderer';

export const styles = StyleSheet.create({
  page: {
    paddingTop: 5,
    paddingBottom: 25,
    paddingLeft: 40,
    paddingRight: 40,
    fontFamily: 'Open Sans',
    backgroundColor: '#fff',
    display: 'flex',
    flexDirection: 'column',
  },
  box: {
    border: '1px solid #000',
    flex: 1,
    flexGrow: 1,
    height: '100%',
  },
  lineBottom: {
    borderBottom: '1px solid #000',
  },
  udl: {
    textDecoration: 'underline',
  },
  lineRight: {
    borderRight: '1px solid #000',
  },
  boxRow: {
    flexDirection: 'row',
  },
  ph: {
    paddingHorizontal: 6,
  },
  lh: {
    lineHeight: 1.2,
  },
  boxRowCenter: {
    alignItems: 'center',
  },
  checkbox: {
    height: 7.5,
    marginRight: 2,
    width: 7.5,
    border: '0.5px solid #000',
  },
  checkboxInner: {
    height: 7,
    width: 7,
    borderTop: '0.5px solid #555',
    borderLeft: '0.5px solid #ddd',
    borderright: '0.5px solid #eee',
  },
  textCenter: {
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
  },
  textBold: {
    fontWeight: 'extrabold',
  },
  textHidden: {
    color: 'white',
  },
});
