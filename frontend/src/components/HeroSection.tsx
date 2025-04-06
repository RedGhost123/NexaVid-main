import { Container, Typography, Button, Box } from "@mui/material";
import Link from "next/link";

const HeroSection = () => {
  return (
    <Box
      sx={{
        backgroundImage: "url('/nexavid-bg.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: { xs: "center", md: "flex-start" }, // Left align on larger screens
        justifyContent: "flex-end", // Push text downward
        textAlign: { xs: "center", md: "left" },
        px: { xs: 2, sm: 4, md: 12 }, // Add left padding on larger screens
        pb: { xs: 6, md: 10 }, // Move content downward
      }}
    >
      <Container maxWidth="lg">
        <Typography
          variant="h2"
          fontWeight="bold"
          gutterBottom
          sx={{
            color: "#fff",
            textShadow: "2px 2px 4px rgba(0, 0, 0, 0.79)",
            fontSize: { xs: "2.2rem", sm: "3.5rem" },
            maxWidth: "900px",
          }}
        >
          AI-Powered Video Generation
        </Typography>
        <Typography
          variant="h5"
          paragraph
          sx={{
            color: "#f0f0f0",
            textShadow: "1px 1px 2px rgba(0, 0, 0, 0.5)",
            fontSize: { xs: "1rem", sm: "1.25rem" },
            maxWidth: "700px",
          }}
        >
          Create ultra-realistic AI-generated videos with avatars, lip-sync, and voice cloning in 4K quality.
        </Typography>

        <Link href="/auth/dashboard" passHref>
          <Button
            variant="contained"
            size="large"
            color="primary"
            sx={{
              mt: 3,
              px: { xs: "16px", sm: "24px" },
              py: { xs: "10px", sm: "14px" },
              fontSize: { xs: "0.9rem", sm: "1.1rem" },
              fontWeight: "bold",
            }}
          >
            Get Started
          </Button>
        </Link>
      </Container>
    </Box>
  );
};

export default HeroSection;
