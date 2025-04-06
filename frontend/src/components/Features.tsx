import React, { useEffect } from "react";
import { Box, Typography, Grid, Card, CardContent } from "@mui/material";
import MovieFilterIcon from "@mui/icons-material/MovieFilter";
import RecordVoiceOverIcon from "@mui/icons-material/RecordVoiceOver";
import FaceRetouchingNaturalIcon from "@mui/icons-material/FaceRetouchingNatural";
import HdIcon from "@mui/icons-material/Hd";
import AOS from "aos"; // Importing AOS
import "aos/dist/aos.css"; // Import AOS styles

const Features = () => {
  const features = [
    { title: "AI Avatars", description: "Generate realistic AI-driven avatars.", icon: <FaceRetouchingNaturalIcon fontSize="large" /> },
    { title: "Lip-Sync AI", description: "Perfect lip-syncing with AI models.", icon: <MovieFilterIcon fontSize="large" /> },
    { title: "Voice Cloning", description: "Clone voices with AI for realistic audio.", icon: <RecordVoiceOverIcon fontSize="large" /> },
    { title: "4K Video Output", description: "Generate high-resolution AI videos.", icon: <HdIcon fontSize="large" /> },
  ];

  useEffect(() => {
    AOS.init({ duration: 1000 }); // Initialize AOS with a 1s duration for each animation
  }, []);

  return (
    <Box
      sx={{
        padding: "60px 20px",
        textAlign: "center",
        background: "linear-gradient(135deg, rgba(108, 30, 140, 0.8), rgba(255, 0, 112, 0.8))", // Dark gradient with purple and magenta tones
        color: "white",
      }}
    >
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Feature Highlights
      </Typography>
      <Grid container spacing={3} justifyContent="center">
        {features.map((feature, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card
              sx={{
                textAlign: "center",
                padding: "20px",
                boxShadow: 3,
                bgcolor: "#222", // Slightly darker background for the card to contrast the page
                color: "white",
                transition: "transform 0.3s",
                "&:hover": {
                  transform: "scale(1.05)",
                  boxShadow: "0px 4px 20px rgba(255, 255, 255, 0.2)",
                },
              }}
              data-aos="fade-up" // Apply fade-up animation on scroll
            >
              {feature.icon}
              <CardContent>
                <Typography variant="h6">{feature.title}</Typography>
                <Typography variant="body1" sx={{ color: "#ddd" }}>
                  {feature.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Features;
