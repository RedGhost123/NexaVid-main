import { useState } from "react";
import { useDrop } from "react-dnd";
import TimelineClip from "./TimelineClip";
import { Box } from "@mui/material";

const TimelineCanvas = ({ clips, onReorder }) => {
  const [, drop] = useDrop({
    accept: "clip",
    drop: (item, monitor) => {
      const draggedIndex = item.index;
      const hoverIndex = item.hoverIndex;
      if (draggedIndex !== hoverIndex) {
        const reordered = [...clips];
        const [draggedClip] = reordered.splice(draggedIndex, 1);
        reordered.splice(hoverIndex, 0, draggedClip);
        onReorder(reordered);
      }
    },
  });

  return (
    <Box
      ref={drop}
      sx={{
        display: "flex",
        gap: 1,
        overflowX: "auto",
        backgroundColor: "#1a1a1a",
        padding: 2,
        borderRadius: 1,
      }}
    >
      {clips.map((clip, index) => (
        <TimelineClip key={index} index={index} clip={clip} />
      ))}
    </Box>
  );
};

export default TimelineCanvas;
