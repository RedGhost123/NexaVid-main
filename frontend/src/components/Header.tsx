import { AppBar, Toolbar, Typography, Button } from "@mui/material";
import { useRouter } from "next/router";

const Header = () => {
  const router = useRouter();

  return (
    <AppBar position="static" color="transparent" elevation={1}>
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          NexaVid
        </Typography>
        <Button
          color="primary"
          variant="contained"
          onClick={() => router.push("/auth/login")}
          sx={{
            // Add padding and margins for better responsiveness
            padding: { xs: "8px 16px", sm: "10px 20px" },
            fontSize: { xs: "0.875rem", sm: "1rem" },
            borderRadius: "8px",
          }}
          aria-label="Get Started"
        >
          Login
        </Button>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
