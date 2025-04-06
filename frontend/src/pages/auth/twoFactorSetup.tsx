import React, { useState } from "react";
import axios from "axios";
import { Container, Button, Typography, Box, TextField, Alert, CircularProgress } from "@mui/material";

const TwoFactorSetup: React.FC = () => {
  const [email, setEmail] = useState(""); // User email input
  const [otp, setOtp] = useState(""); // OTP input
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false); // Loading state for OTP request/verification

  // Function to request an OTP
  const handleRequestOtp = async () => {
    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:5000/api/auth/request-otp", { email });
      setMessage(response.data.message);
      setOtpSent(true);
      setError("");
    } catch (err) {
      setError("Failed to send OTP. Try again.");
      setMessage("");
    } finally {
      setLoading(false);
    }
  };

  // Function to verify OTP
  const handleVerifyOtp = async () => {
    try {
      const response = await axios.post("http://localhost:5000/api/auth/verify-otp", { email, otp });
      setMessage(response.data.message);
      setError("");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError("Invalid OTP. Please try again.");
        setMessage("");
      } else {
        setError("An unknown error occurred.");
        setMessage("");
      }
    }
  };
  

  // Email validation function
  const validateEmail = (email: string) => {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email);
  };

  return (
    <Container maxWidth="xs">
      <Box sx={{ mt: 5, p: 3, boxShadow: 3, borderRadius: 2, bgcolor: "white", textAlign: "center" }}>
        <Typography variant="h5">Enable 2FA with OTP</Typography>

        {message && <Alert severity="success">{message}</Alert>}
        {error && <Alert severity="error">{error}</Alert>}

        {!otpSent ? (
          <>
            <TextField
              fullWidth
              label="Enter Email"
              variant="outlined"
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Button
              variant="contained"
              fullWidth
              sx={{ mt: 2 }}
              onClick={handleRequestOtp}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : "Send OTP"}
            </Button>
          </>
        ) : (
          <>
            <TextField
              fullWidth
              label="Enter OTP"
              variant="outlined"
              margin="normal"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />
            <Button
              variant="contained"
              fullWidth
              sx={{ mt: 2 }}
              onClick={handleVerifyOtp}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : "Verify OTP"}
            </Button>
          </>
        )}
      </Box>
    </Container>
  );
};

export default TwoFactorSetup;
