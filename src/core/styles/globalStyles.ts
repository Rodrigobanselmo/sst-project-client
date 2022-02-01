import { css } from '@emotion/react';

const globalStyles = css`
  * {
    box-sizing: border-box;
    font-family: 'Poppins', sans-serif;
  }

  body {
    margin: 0;
    padding: 0;
  }

  .scroll-container {
    height: calc(100vh - 120px);
    overflow: auto;
  }
`;

export default globalStyles;
