const currentYear = new Date().getFullYear();

export const SCopyRightBottom = () => (
  <div
    style={{
      left: 0,
      bottom: 0,
      width: '100%',
      backgroundColor: '#333',
      color: 'white',
      textAlign: 'center',
      fontSize: '12px',
      padding: '2px 0',
      marginTop: 'auto',
    }}
  >
    <p>&copy; {currentYear} SimpleSST. Todos os direitos reservados.</p>
  </div>
);
