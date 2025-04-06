// src/pages/ForgotPassword.tsx
import React, { useState } from "react";
import axios from "axios";
import { Container, TextField, Button, Typography, Box, Alert } from "@mui/material";

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/auth/forgot-password", { email });
      setMessage("Password reset link sent! Check your email.");
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        setMessage(error.response?.data?.error || "Error sending reset link.");
      } else {
        setMessage("An unknown error occurred.");
      }
    }
  };
  

  return (
    <Container maxWidth="xs">
      <Box sx={{ mt: 5, p: 3, boxShadow: 3, borderRadius: 2, bgcolor: "white" }}>
        <Typography variant="h5" textAlign="center" gutterBottom>
          Forgot Password
        </Typography>
        {message && <Alert severity="info">{message}</Alert>}
        <form onSubmit={handleForgotPassword}>
          <TextField fullWidth label="Email" variant="outlined" margin="normal" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
            Send Reset Link
          </Button>
        </form>
      </Box>
    </Container>
  );
};

export default ForgotPassword;
