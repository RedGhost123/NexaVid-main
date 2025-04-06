import React from "react";
import { Box, Typography } from "@mui/material";

const Footer = () => {
  return (
    <Box
      sx={{
        textAlign: "center",
        padding: { xs: "10px", sm: "20px" }, // Responsively adjust padding
        backgroundColor: "#1a0026",
        color: "#fff",
      }}
    >
      <Typography variant="body2">
        © {new Date().getFullYear()} NexaVid. All rights reserved.
      </Typography>
    </Box>
  );
};

export default Footer;
