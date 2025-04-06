import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { loginUser } from "@/redux/authSlice";
import { 
  Button, 
  TextField, 
  Typography, 
  Box, 
  Container, 
  Divider 
} from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";
import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/Twitter";
import { AppDispatch } from "../../redux/store";
import { signIn } from "next-auth/react";

const Login: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [loginType, setLoginType] = useState<"email" | "mobile">("email");
  const [formData, setFormData] = useState({ email: "", mobile: "", password: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginType === "email") {
      dispatch(loginUser({ email: formData.email, password: formData.password }));
    } else {
      dispatch(loginUser({ mobile: formData.mobile, password: formData.password }));
    }
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
        maxWidth="xs"
        sx={{
          bgcolor: "rgba(0, 0, 0, 0.7)", // Semi-transparent dark background
          padding: 4,
          borderRadius: 2,
          boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.3)",
          textAlign: "center",
        }}
      >
        <Typography variant="h4" color="white" fontWeight="bold" gutterBottom>
          Login to NexaVid
        </Typography>

        <Box display="flex" justifyContent="center" gap={2} mb={2}>
          <Button 
            variant={loginType === "email" ? "contained" : "outlined"} 
            onClick={() => setLoginType("email")}
            sx={{ color: "white", borderColor: "white" }}
          >
            Email Login
          </Button>
          <Button 
            variant={loginType === "mobile" ? "contained" : "outlined"} 
            onClick={() => setLoginType("mobile")}
            sx={{ color: "white", borderColor: "white" }}
          >
            Mobile Login
          </Button>
        </Box>

        <form onSubmit={handleSubmit}>
          {loginType === "email" ? (
            <TextField 
              label="Email" 
              name="email" 
              type="email" 
              fullWidth 
              margin="normal" 
              required 
              value={formData.email} 
              onChange={handleChange} 
              variant="filled"
              InputProps={{ style: { color: "white" } }}
              sx={{ bgcolor: "rgba(255, 255, 255, 0.2)", borderRadius: 1 }}
            />
          ) : (
            <TextField 
              label="Mobile Number" 
              name="mobile" 
              type="tel" 
              fullWidth 
              margin="normal" 
              required 
              value={formData.mobile} 
              onChange={handleChange} 
              variant="filled"
              InputProps={{ style: { color: "white" } }}
              sx={{ bgcolor: "rgba(255, 255, 255, 0.2)", borderRadius: 1 }}
            />
          )}

          <TextField 
            label="Password" 
            name="password" 
            type="password" 
            fullWidth 
            margin="normal" 
            required 
            value={formData.password} 
            onChange={handleChange} 
            variant="filled"
            InputProps={{ style: { color: "white" } }}
            sx={{ bgcolor: "rgba(255, 255, 255, 0.2)", borderRadius: 1 }}
          />

          <Button 
            type="submit" 
            variant="contained" 
            color="primary" 
            fullWidth 
            sx={{ mt: 2 }}
          >
            Login
          </Button>
        </form>

        <Box textAlign="center" mt={2}>
          <Typography variant="body2">
            <a href="/forgot-password" style={{ color: "#ff4081" }}>Forgot Password?</a>
          </Typography>
        </Box>

        <Divider sx={{ my: 3, bgcolor: "rgba(255, 255, 255, 0.2)" }}>Or Login with</Divider>

        <Box display="flex" justifyContent="center" gap={2}>
          <Button 
            variant="outlined" 
            startIcon={<GoogleIcon />} 
            onClick={() => signIn("google")}
            sx={{
              color: "white",
              borderColor: "white",
              "&:hover": { bgcolor: "rgba(255, 255, 255, 0.1)" },
            }}
          >
            Google
          </Button>

          <Button 
            variant="outlined" 
            startIcon={<FacebookIcon />} 
            onClick={() => signIn("facebook")}
            sx={{
              color: "white",
              borderColor: "white",
              "&:hover": { bgcolor: "rgba(255, 255, 255, 0.1)" },
            }}
          >
            Facebook
          </Button>

          <Button 
            variant="outlined" 
            startIcon={<TwitterIcon />} 
            onClick={() => signIn("twitter")}
            sx={{
              color: "white",
              borderColor: "white",
              "&:hover": { bgcolor: "rgba(255, 255, 255, 0.1)" },
            }}
          >
            Twitter
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default Login;
