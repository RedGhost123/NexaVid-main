import { useState, useEffect } from "react";
import { Box, Card, CardMedia, CardContent, Typography, Button, Grid } from "@mui/material";

const ProjectList = () => {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    fetch("/api/videos")
      .then((res) => res.json())
      .then((data) => setProjects(data));
  }, []);

  const handleDelete = async (id) => {
    const res = await fetch(`/api/videos/${id}`, { method: "DELETE" });
    if (res.ok) {
      setProjects(projects.filter((project) => project.id !== id));
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>My AI Video Projects</Typography>
      <Grid container spacing={3}>
        {projects.map((project) => (
          <Grid item xs={12} sm={6} md={4} key={project.id}>
            <Card>
              <CardMedia component="video" height="180" src={project.videoUrl} controls />
              <CardContent>
                <Typography variant="h6">{project.title}</Typography>
                <Typography variant="body2">Effect: {project.effectApplied || "None"}</Typography>
                <Button href={project.videoUrl} target="_blank" variant="contained" sx={{ mt: 1, mr: 1 }}>
                  Download
                </Button>
                <Button onClick={() => handleDelete(project.id)} variant="outlined" color="error">
                  Delete
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default ProjectList;
