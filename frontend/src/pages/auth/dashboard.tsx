import {
  Box,
  Container,
  Grid,
  Typography,
  Button,
  TextField,
  Avatar,
} from "@mui/material";
import { useState } from "react";
import React from "react";
import RecentProjects from "@/components/RecentProjects";
import UploadForm from "@/components/UploadProjectForm";
import Dialog from "@mui/material/Dialog";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";

const DashboardPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundImage: "url('/nexavid-bg.jpg')",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        backdropFilter: "blur(4px)",
        px: 2,
        py: 4,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Container
        maxWidth="lg"
        sx={{
          bgcolor: "rgba(255, 255, 255, 0.85)",
          borderRadius: 3,
          p: 4,
          boxShadow: 4,
        }}
      >
        {/* Nav Bar */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Typography variant="h4" fontWeight="bold">NexaVid Dashboard</Typography>
          <Avatar src="/user.png" />
        </Box>

        {/* Quick Actions */}
        <Box mb={5}>
          <Typography variant="h6" gutterBottom>Quick Actions</Typography>
          <Grid container spacing={2}>
            <Grid item>
              <Button variant="contained" color="primary">Start New AI Video</Button>
            </Grid>
            <Grid item>
              <Button variant="outlined" onClick={() => setUploadDialogOpen(true)}>
                Upload Video
              </Button>
            </Grid>
            <Grid item>
              <Button variant="outlined">Generate AI Effects</Button>
            </Grid>
          </Grid>
        </Box>

        {/* Smart Search */}
        <Box mb={3}>
          <TextField
            label="Smart Search Projects"
            fullWidth
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Typography variant="subtitle2" mt={1}>
            AI Suggestions: “Enhance Interview Clip”, “Add Lip Sync”
          </Typography>
        </Box>

        {/* Recent Projects */}
        <Box mb={5}>
          <Typography variant="h6" gutterBottom>Recent Projects</Typography>
          <RecentProjects searchTerm={searchTerm} />
        </Box>

        {/* AI Tools */}
        <Box mb={5}>
          <Typography variant="h6" gutterBottom>AI Video Tools</Typography>
          <Grid container spacing={2}>
            {["Avatars", "Templates", "Effects"].map((tool, idx) => (
              <Grid item key={idx}>
                <Button variant="outlined">{tool}</Button>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Account Overview */}
        <Box>
          <Typography variant="h6" gutterBottom>Account Overview</Typography>
          <Box sx={{ maxWidth: 400 }}>
            <Typography>Plan: <strong>Pro</strong></Typography>
            <Typography>Credits Left: <strong>120</strong></Typography>
            <Typography>Subscription: Active</Typography>
          </Box>
        </Box>
      </Container>

      {/* Upload Video Dialog */}
      <Dialog open={uploadDialogOpen} onClose={() => setUploadDialogOpen(false)} maxWidth="md" fullWidth>
        <Box position="relative" p={3}>
          <IconButton
            onClick={() => setUploadDialogOpen(false)}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
          <UploadForm />
        </Box>
      </Dialog>
    </Box>
  );
};
export default DashboardPage;
