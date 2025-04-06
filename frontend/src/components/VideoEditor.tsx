import { useEffect, useState } from "react";
import { useCollaboration } from "./CollaborationProvider";

interface VideoEditorProps {
  sessionId: string;
  userId: string;
  role: "editor" | "viewer";
}

const VideoEditor = ({ sessionId, userId, role }: VideoEditorProps) => {
  const { socket } = useCollaboration();
  const [edits, setEdits] = useState<any[]>([]);
  const [lockedBy, setLockedBy] = useState<string | null>(null);

  useEffect(() => {
    if (!socket) return;

    // Join session on mount
    socket.emit("joinSession", { sessionId, userId, role });

    // Listen for edit updates
    socket.on("editUpdate", (data) => {
      setEdits((prev) => [...prev, data]);
    });

    // Handle lock updates
    socket.on("editLocked", ({ userId }) => {
      setLockedBy(userId);
    });

    socket.on("editUnlocked", () => {
      setLockedBy(null);
    });

    // Leave session on unmount
    return () => {
      socket.emit("leaveSession", { sessionId, userId });
    };
  }, [socket, sessionId, userId, role]);

  // Request to lock editing
  const requestEdit = () => {
    if (lockedBy && lockedBy !== userId) {
      alert("Another user is currently editing.");
      return;
    }
    socket.emit("requestEditLock", {
      sessionId,
      userId,
      timestamp: Date.now(),
    });
  };

  // Perform an edit
  const makeEdit = () => {
    if (lockedBy !== userId) return;

    socket.emit("editAction", {
      sessionId,
      userId,
      action: "cut",
      data: { timestamp: 5 },
    });
  };

  // Release edit lock
  const releaseLock = () => {
    if (lockedBy === userId) {
      socket.emit("releaseEditLock", { sessionId, userId });
    }
  };

  return (
    <div>
      <h2>Video Editor (Live)</h2>

      {role === "viewer" ? (
        <p>🔒 View-only mode</p>
      ) : (
        <>
          <button onClick={requestEdit}>Request Edit</button>
          <button onClick={makeEdit} disabled={lockedBy !== userId}>
            ✂️ Cut at 5s
          </button>
          <button onClick={releaseLock}>Release Edit</button>
        </>
      )}

      <ul>
        {edits.map((edit, index) => (
          <li key={index}>
            {edit.action} at {edit.data.timestamp}s
          </li>
        ))}
      </ul>

      {lockedBy && (
        <p>
          🔒 Currently editing:{" "}
          {lockedBy === userId ? "You" : `User ${lockedBy}`}
        </p>
      )}
    </div>
  );
};

const [cursors, setCursors] = useState({});

useEffect(() => {
  if (!socket) return;

  socket.on("cursorUpdate", ({ userId, position }) => {
    setCursors((prev) => ({ ...prev, [userId]: position }));
  });

  return () => {
    socket.off("cursorUpdate");
  };
}, [socket]);

const handleMouseMove = (e) => {
  socket.emit("cursorMove", {
    sessionId,
    userId,
    position: { x: e.clientX, y: e.clientY },
  });
};

return (
  <div onMouseMove={handleMouseMove} style={{ position: "relative" }}>
    {Object.entries(cursors).map(([id, pos]) => (
      <div
        key={id}
        style={{
          position: "absolute",
          left: pos.x,
          top: pos.y,
          width: 10,
          height: 10,
          backgroundColor: "red",
          borderRadius: "50%",
        }}
      />
    ))}
  </div>
);

const handleUndo = () => {
    socket.emit("undoEdit", { sessionId });
  };
  
  const handleRedo = () => {
    socket.emit("redoEdit", { sessionId });
  };
  
  return (
    <div>
      <button onClick={handleUndo}>Undo</button>
      <button onClick={handleRedo}>Redo</button>
    </div>
  );
  


export default VideoEditor;
