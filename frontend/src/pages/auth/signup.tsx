import React, { useState } from "react";
import { useRouter } from "next/router";
import { signIn } from "next-auth/react";
import {
  TextField,
  Button,
  Typography,
  Container,
  Box,
  CircularProgress,
  Alert,
} from "@mui/material";

const Signup: React.FC = () => {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Handle email/password signup
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    setError("");

    // Simulating signup request (Replace with API call)
    setTimeout(() => {
      setLoading(false);
      router.push("/dashboard"); // Redirect after successful signup
    }, 2000);
  };

  // Handle Google & Facebook Signup
  const handleSocialSignup = async (provider: "google" | "facebook") => {
    setLoading(true);
    await signIn(provider, { callbackUrl: "/dashboard" }); // Redirect after signup
  };

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
        alignItems: "center",
        justifyContent: "center",
        px: { xs: 2, sm: 4 },
      }}
    >
      <Container
        maxWidth="sm"
        sx={{
          bgcolor: "rgba(0, 0, 0, 0.7)", // Dark semi-transparent background
          padding: 4,
          borderRadius: 2,
          boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.3)",
          textAlign: "center",
        }}
      >
        <Typography variant="h4" color="white" fontWeight="bold" gutterBottom>
          Create an Account
        </Typography>

        {error && <Alert severity="error">{error}</Alert>}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Full Name"
            margin="normal"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            variant="filled"
            InputProps={{ style: { color: "white" } }}
            sx={{ bgcolor: "rgba(255, 255, 255, 0.2)", borderRadius: 1 }}
          />

          <TextField
            fullWidth
            label="Email"
            type="email"
            margin="normal"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            variant="filled"
            InputProps={{ style: { color: "white" } }}
            sx={{ bgcolor: "rgba(255, 255, 255, 0.2)", borderRadius: 1 }}
          />

          <TextField
            fullWidth
            label="Password"
            type="password"
            margin="normal"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            variant="filled"
            InputProps={{ style: { color: "white" } }}
            sx={{ bgcolor: "rgba(255, 255, 255, 0.2)", borderRadius: 1 }}
          />

          <TextField
            fullWidth
            label="Confirm Password"
            type="password"
            margin="normal"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            variant="filled"
            InputProps={{ style: { color: "white" } }}
            sx={{ bgcolor: "rgba(255, 255, 255, 0.2)", borderRadius: 1 }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            disabled={loading}
            sx={{ mt: 2 }}
          >
            {loading ? <CircularProgress size={24} /> : "Sign Up"}
          </Button>
        </form>

        <Box mt={2}>
          <Button
            onClick={() => router.push("/auth/login")}
            sx={{ color: "#ff4081" }}
          >
            Already have an account? Login
          </Button>
        </Box>

        {/* Social Signup */}
        <Box mt={3}>
          <Button
            fullWidth
            variant="outlined"
            onClick={() => handleSocialSignup("google")}
            sx={{
              mt: 1,
              color: "white",
              borderColor: "white",
              "&:hover": { bgcolor: "rgba(255, 255, 255, 0.1)" },
            }}
          >
            Sign Up with Google
          </Button>

          <Button
            fullWidth
            variant="outlined"
            onClick={() => handleSocialSignup("facebook")}
            sx={{
              mt: 1,
              color: "white",
              borderColor: "white",
              "&:hover": { bgcolor: "rgba(255, 255, 255, 0.1)" },
            }}
          >
            Sign Up with Facebook
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default Signup;
