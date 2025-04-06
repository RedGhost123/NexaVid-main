import type { AppProps } from "next/app";
import { Provider, useSelector } from "react-redux";
import { ThemeProvider, CssBaseline, CircularProgress, Box } from "@mui/material";
import { useRouter } from "next/router";
import { store } from "../redux/store"; // Import Redux Store
import theme from "../Theme"; // Import Material UI Theme

function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useSelector((state: any) => state.auth);
  const router = useRouter();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return <>{children}</>;
}

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthWrapper>
          <Component {...pageProps} />
        </AuthWrapper>
      </ThemeProvider>
    </Provider>
  );
}

export default MyApp;