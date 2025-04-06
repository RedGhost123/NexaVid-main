import { useState } from "react";
import { Button, TextField, Box, Typography, CircularProgress } from "@mui/material";
import { fetchPreview } from "../../utils/api";

const PreviewGenerator = () => {
  const [text, setText] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGeneratePreview = async () => {
    if (!text) return;
    setLoading(true);
    setError(null); // Reset previous error
    try {
      const response = await fetchPreview(text);
      if (response?.videoUrl) {
        setVideoUrl(response.videoUrl);
      } else {
        setError("Failed to generate video. Please try again.");
      }
    } catch (err) {
      setError("An error occurred while generating the video.");
    }
    setLoading(false);
  };

  return (
    <Box sx={{ textAlign: "center", py: 6, background: "linear-gradient(135deg, rgba(108, 30, 140, 0.8), rgba(255, 0, 112, 0.8))", padding: "40px", borderRadius: "8px", color: "white" }}>
      <Typography variant="h4" gutterBottom sx={{ color: "white" }}>
        AI-Powered Video Preview
      </Typography>

      <TextField
        label="Enter a prompt..."
        variant="outlined"
        fullWidth
        value={text}
        onChange={(e) => setText(e.target.value)}
        sx={{
          mb: 2,
          maxWidth: 500,
          backgroundColor: "#333", // Dark background for input
          borderRadius: "4px",
          color: "white",
          "& .MuiInputBase-root": {
            color: "white", // White text color inside the input
          },
          "& .MuiInputLabel-root": {
            color: "#bbb", // Light color for label
          },
        }}
        aria-label="Prompt Input"
      />

      <Button
        variant="contained"
        color="primary"
        onClick={handleGeneratePreview}
        disabled={loading}
        sx={{
          mb: 2,
          px: 3,
          py: 1.5,
          backgroundColor: "#ff006b", // Magenta button background
          "&:hover": {
            backgroundColor: "#e6005c", // Darker magenta on hover
          },
        }}
        aria-live="polite"
      >
        {loading ? <CircularProgress size={24} color="inherit" /> : "Generate Preview"}
      </Button>

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      {videoUrl && (
        <Box>
          <Typography variant="h6" gutterBottom sx={{ color: "white" }}>
            Your AI-generated Video
          </Typography>
          <video width="80%" controls>
            <source src={videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </Box>
      )}
    </Box>
  );
};

export default PreviewGenerator;
