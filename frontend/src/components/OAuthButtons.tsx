// src/components/OAuthButtons.tsx
import React from "react";
import { Button, Box } from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";
import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/Twitter";

const API_URL = "http://localhost:5000/api/auth"; // Backend URL

const OAuthButtons: React.FC = () => {
  const handleOAuthLogin = (provider: string) => {
    window.location.href = `${API_URL}/oauth/${provider}`;
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
      <Button variant="contained" fullWidth startIcon={<GoogleIcon />} onClick={() => handleOAuthLogin("google")}>
        Continue with Google
      </Button>
      <Button variant="contained" fullWidth color="primary" startIcon={<FacebookIcon />} onClick={() => handleOAuthLogin("facebook")}>
        Continue with Facebook
      </Button>
      <Button variant="contained" fullWidth color="secondary" startIcon={<TwitterIcon />} onClick={() => handleOAuthLogin("twitter")}>
        Continue with Twitter
      </Button>
    </Box>
  );
};

export default OAuthButtons;
