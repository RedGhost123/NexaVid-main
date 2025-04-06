import { useState } from "react";
import { Box, Button, Typography, Grid, Card, CardMedia, CardContent } from "@mui/material";

const effects = [
  { id: "face-swap", name: "AI Face Swap", preview: "/previews/face-swap.gif", cost: 5 },
  { id: "motion", name: "AI Motion Effects", preview: "/previews/motion.gif", cost: 4 },
  { id: "text-video", name: "AI Text-to-Video", preview: "/previews/text-video.gif", cost: 10 },
];

const EffectSelection = ({ onSelectEffect, credits }) => {
  const [selectedEffect, setSelectedEffect] = useState(null);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Select an AI Effect</Typography>
      <Typography variant="body1">Credits Available: {credits}</Typography>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        {effects.map((effect) => (
          <Grid item xs={12} sm={6} md={4} key={effect.id}>
            <Card
              sx={{
                cursor: "pointer",
                border: selectedEffect === effect.id ? "3px solid #1976D2" : "none",
              }}
              onClick={() => setSelectedEffect(effect.id)}
            >
              <CardMedia component="img" height="150" image={effect.preview} />
              <CardContent>
                <Typography variant="h6">{effect.name}</Typography>
                <Typography variant="body2">Cost: {effect.cost} credits</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Button
        variant="contained"
        color="primary"
        sx={{ mt: 3 }}
        disabled={!selectedEffect || effects.find((e) => e.id === selectedEffect).cost > credits}
        onClick={() => onSelectEffect(selectedEffect)}
      >
        Apply Effect
      </Button>
    </Box>
  );
};

const handleApplyEffect = async () => {
    const res = await fetch("/api/effects/apply", {
      method: "POST",
      body: JSON.stringify({ effectId: selectedEffect, videoId }),
    });
  
    const data = await res.json();
    if (data.success) alert("Effect applied successfully!");
  };
  

export default EffectSelection;
