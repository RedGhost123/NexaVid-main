// src/pages/ResetPassword.tsx
import React, { useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { Container, TextField, Button, Typography, Box, Alert } from "@mui/material";

const ResetPassword: React.FC = () => {
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/auth/reset-password", { token, password });
      setMessage("Password reset successful! You can now log in.");
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        setMessage(error.response?.data?.error || "Error resetting password.");
      } else {
        setMessage("An unknown error occurred.");
      }
    }
  };
  return (
    <Container maxWidth="xs">
      <Box sx={{ mt: 5, p: 3, boxShadow: 3, borderRadius: 2, bgcolor: "white" }}>
        <Typography variant="h5" textAlign="center" gutterBottom>
          Reset Password
        </Typography>
        {message && <Alert severity="info">{message}</Alert>}
        <form onSubmit={handleResetPassword}>
          <TextField fullWidth label="New Password" type="password" variant="outlined" margin="normal" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
            Reset Password
          </Button>
        </form>
      </Box>
    </Container>
  );
};

export default ResetPassword;
