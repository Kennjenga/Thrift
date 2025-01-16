// styles/GlobalStyles.ts
import { createGlobalStyle } from 'styled-components';

export const GlobalStyles = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=Open+Sans:wght@400;600&display=swap');

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    background: #121212;
    color: #ffffff;
    font-family: 'Open Sans', sans-serif;
    line-height: 1.6;
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: 'Poppins', sans-serif;
    font-weight: 600;
  }

  :root {
    --primary: #4CAF50;
    --secondary: #00BFFF;
    --accent: #FFD700;
    --background: #121212;
    --surface: #1E1E1E;
    --text: #ffffff;
    --text-secondary: rgba(255, 255, 255, 0.7);
  }
`;