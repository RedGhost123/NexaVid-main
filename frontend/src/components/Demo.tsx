import { Container, Typography, Box } from "@mui/material";

const Demo = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 10, textAlign: "center" }}>
      <Typography variant="h3" gutterBottom>
        Watch AI in Action
      </Typography>
      <Box component="video" controls width="100%" maxWidth="800px" loading="lazy" aria-label="AI Demo Video">
        <source src="/demo.mp4" type="video/mp4" />
        <source src="/demo.webm" type="video/webm" />
        Your browser does not support the video tag.
      </Box>
    </Container>
  );
};

export default Demo;
