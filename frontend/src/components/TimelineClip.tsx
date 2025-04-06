import { useDrag } from "react-dnd";
import { Box, Typography } from "@mui/material";

const TimelineClip = ({ clip, index }) => {
  const [, drag] = useDrag({
    type: "clip",
    item: { index, ...clip },
  });

  return (
    <Box
      ref={drag}
      sx={{
        width: 120,
        height: 60,
        backgroundColor: "#333",
        color: "#fff",
        borderRadius: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "grab",
      }}
    >
      <Typography variant="body2">{clip.name}</Typography>
    </Box>
  );
};

export default TimelineClip;
