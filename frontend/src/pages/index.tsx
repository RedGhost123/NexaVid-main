import Head from "next/head";
import { Provider } from "react-redux";
import { store } from "../redux/store"; // Redux Store
import { ThemeProvider, CssBaseline, Box, CircularProgress } from "@mui/material"; // MUI Theme
import theme from "@/Theme"; // Custom MUI Theme
import Header from "../components/Header";
import HeroSection from "../components/HeroSection";
import Features from "../components/Features";
import Demo from "../components/Demo";
import Footer from "../components/Footer";
import dynamic from "next/dynamic";
import { Suspense } from "react";

const PreviewGenerator = dynamic(() => import("../components/PreviewGenerator"), { ssr: false });

export default function Home() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />

        <div>
          <Head>
            <title>NexaVid - AI Video Generator</title>
            <meta name="description" content="Create AI-powered videos with NexaVid." />
            
            {/* Open Graph Meta Tags */}
            <meta property="og:title" content="NexaVid - AI Video Generator" />
            <meta property="og:description" content="Create AI-powered videos with NexaVid." />
            <meta property="og:image" content="URL_TO_IMAGE" />
            <meta property="og:url" content="https://nexavid.com" />

            {/* Twitter Meta Tags */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content="NexaVid - AI Video Generator" />
            <meta name="twitter:description" content="Create AI-powered videos with NexaVid." />
            <meta name="twitter:image" content="URL_TO_IMAGE" />
          </Head>

          {/* Header Navigation */}
          <Header />

          {/* Hero Section - AI Video Introduction & CTA */}
          <HeroSection />

          {/* Features - Showcasing AI Avatars, Lip-Sync, Voice Cloning, 4K output */}
          <Features />

          {/* Demo Video Showcase */}
          <Demo />

          {/* AI-Powered Preview Generator (User Inputs Text & Gets AI Video) */}
          <Suspense fallback={<Box display="flex" justifyContent="center" alignItems="center" height="100vh"><CircularProgress /></Box>}>
            <PreviewGenerator />
          </Suspense>

          {/* Footer */}
          <Footer />
        </div>
      </ThemeProvider>
    </Provider>
  );
}
