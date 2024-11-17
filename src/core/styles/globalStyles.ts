import { css } from '@emotion/react';

const globalStyles = css`
  * {
    box-sizing: border-box;
    font-family: 'Poppins', sans-serif;
  }
  html,
  body {
    height: 100%;
    margin: 0px;
  }
  a {
    text-decoration: none;
  }
  .scroll-container {
    height: calc(100vh - 120px);
    overflow: auto;
  }
  .react-datepicker__aria-live {
    display: none;
  }

  .noSelect {
    -webkit-touch-callout: none; /* iOS Safari */
    -webkit-user-select: none; /* Safari */
    -khtml-user-select: none; /* Konqueror HTML */
    -moz-user-select: none; /* Firefox */
    -ms-user-select: none; /* Internet Explorer/Edge */
    user-select: none; /* Non-prefixed version, currently
                                  supported by Chrome and Opera */
  }

  .noBreakText {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .rowCenter {
    display: flex;
    flex-direction: row;
    align-items: center;
  }

  .center {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .staticDatePickerToolbarRoot {
    span {
      font-size: 10px !important;
    }
  }

  .staticDatePickerToolbar {
    font-size: 24px !important;
    margin-bottom: -15px !important;
    font-weight: 500 !important;
  }
`;

export default globalStyles;
