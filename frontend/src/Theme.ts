import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#6200ea", // Change this to your primary color
    },
    secondary: {
      main: "#03dac6",
    },
    background: {
      default: "#f5f5f5",
    },
  },
  typography: {
    fontFamily: "Roboto, Arial, sans-serif",
  },
});

export default theme;
