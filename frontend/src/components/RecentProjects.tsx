import { useEffect, useState } from "react";
import {
  Grid, Card, CardMedia, CardContent, Typography,
  CircularProgress, IconButton, Dialog, TextField, Button,
  Box, Select, MenuItem
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";
import axios from "axios";

interface Video {
  id: string;
  title: string;
  url: string;
  createdAt: string;
  status: "pending" | "completed";
}

const RecentProjects = ({ searchTerm }: { searchTerm: string }) => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [editVideo, setEditVideo] = useState<Video | null>(null);
  const [newTitle, setNewTitle] = useState("");

  const [statusFilter, setStatusFilter] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");

  const fetchVideos = async () => {
    try {
      const res = await axios.get("/api/videos", {
        params: { search: searchTerm, status: statusFilter, sort: sortOrder },
      });
      setVideos(res.data);
    } catch (err) {
      console.error("Error fetching videos:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, [searchTerm, statusFilter, sortOrder]);

  const handleEdit = (video: Video) => {
    setEditVideo(video);
    setNewTitle(video.title);
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`/api/videos/${id}`);
      setVideos(videos.filter(video => video.id !== id));
    } catch (err) {
      console.error("Error deleting video:", err);
    }
  };

  const handleUpdate = async () => {
    if (!editVideo) return;
    try {
      await axios.put(`/api/videos/${editVideo.id}`, { title: newTitle });
      setVideos(videos.map(video =>
        video.id === editVideo.id ? { ...video, title: newTitle } : video
      ));
      setEditVideo(null);
    } catch (err) {
      console.error("Error updating video:", err);
    }
  };

  if (loading) return <CircularProgress />;
  if (!videos.length) return <Typography>No projects yet.</Typography>;

  return (
    <>
      {/* Filter & Sort */}
      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          displayEmpty
          size="small"
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="pending">⏳ Processing</MenuItem>
          <MenuItem value="completed">✅ Completed</MenuItem>
        </Select>
        <Select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          size="small"
        >
          <MenuItem value="newest">📅 Newest</MenuItem>
          <MenuItem value="oldest">📅 Oldest</MenuItem>
        </Select>
      </Box>

      {/* Projects Grid */}
      <Grid container spacing={3}>
        {videos.map((video) => (
          <Grid item xs={12} sm={6} md={4} key={video.id}>
            <Card>
              <CardMedia component="video" src={video.url} controls sx={{ height: 200 }} />
              <CardContent>
                <Typography variant="h6">{video.title}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {new Date(video.createdAt).toLocaleString()}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: video.status === "completed" ? "green" : "orange" }}
                >
                  {video.status === "completed" ? "✅ Completed" : "⏳ Processing..."}
                </Typography>
                <Box>
                  <IconButton onClick={() => handleEdit(video)}><Edit /></IconButton>
                  <IconButton onClick={() => handleDelete(video.id)}><Delete /></IconButton>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Edit Dialog */}
      {editVideo && (
        <Dialog open onClose={() => setEditVideo(null)}>
          <CardContent sx={{ minWidth: 300 }}>
            <Typography>Edit Title</Typography>
            <TextField
              fullWidth
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              sx={{ my: 2 }}
            />
            <Button variant="contained" onClick={handleUpdate}>Save</Button>
          </CardContent>
        </Dialog>
      )}
    </>
  );
};



import { useAuth } from "../context/AuthContext"; // Import authentication

const { user, token } = useAuth(); // Get logged-in user

useEffect(() => {
  fetch(`/api/videos`, {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then((res) => res.json())
    .then((data) => setVideos(data));
}, [user]);

export default RecentProjects;
