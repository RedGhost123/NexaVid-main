import React, { useState } from "react";
import axios, { AxiosError } from "axios";
import { Container, TextField, Button, Typography, Box, Alert, CircularProgress } from "@mui/material";

const TwoFactorVerify: React.FC = () => {
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Function to handle OTP verification
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic OTP validation (adjust as needed)
    if (otp.length !== 6 || isNaN(Number(otp))) {
      setMessage("Invalid OTP format. Please enter a 6-digit OTP.");
      return;
    }

    setLoading(true); // Start loading state
    try {
      const response = await axios.post("http://localhost:5000/api/auth/verify-2fa", { otp });
      setMessage(response.data.message);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        // Type guard for Axios error
        setMessage(error.response?.data?.error || "Invalid OTP.");
      } else {
        setMessage("An unknown error occurred.");
      }
    } finally {
      setLoading(false); // End loading state
    }
  };

  return (
    <Container maxWidth="xs">
      <Box sx={{ mt: 5, p: 3, boxShadow: 3, borderRadius: 2, bgcolor: "white" }}>
        <Typography variant="h5" textAlign="center">Enter 2FA Code</Typography>
        {message && <Alert severity="info">{message}</Alert>}
        
        <form onSubmit={handleVerifyOTP}>
          <TextField
            fullWidth
            label="OTP Code"
            variant="outlined"
            margin="normal"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
            inputProps={{ maxLength: 6 }}
          />
          
          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{ mt: 2 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : "Verify OTP"}
          </Button>
        </form>
      </Box>
    </Container>
  );
};

export default TwoFactorVerify;
