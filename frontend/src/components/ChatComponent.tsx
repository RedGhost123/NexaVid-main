const [messages, setMessages] = useState([]);
const [message, setMessage] = useState("");

useEffect(() => {
  if (!socket) return;

  socket.on("newMessage", (msg) => {
    setMessages((prev) => [...prev, msg]);
  });

  return () => socket.off("newMessage");
}, [socket]);

const sendMessage = () => {
  if (message.trim()) {
    socket.emit("sendMessage", { sessionId, userId, message });
    setMessage("");
  }
};

return (
  <div>
    <div>
      {messages.map((msg, i) => (
        <p key={i}><strong>{msg.userId}:</strong> {msg.message}</p>
      ))}
    </div>
    <input value={message} onChange={(e) => setMessage(e.target.value)} />
    <button onClick={sendMessage}>Send</button>
  </div>
);
const uploadFile = (file) => {
    const formData = new FormData();
    formData.append("file", file);
  
    fetch("/api/upload", { method: "POST", body: formData })
      .then((res) => res.json())
      .then(({ fileUrl }) => {
        socket.emit("sendMessage", { sessionId, userId, message: fileUrl });
      });
  };
  
  return <input type="file" onChange={(e) => uploadFile(e.target.files[0])} />;
  const [typingUser, setTypingUser] = useState(null);

useEffect(() => {
  socket.on("userTyping", (user) => {
    setTypingUser(user);
    setTimeout(() => setTypingUser(null), 3000);
  });

  return () => socket.off("userTyping");
}, []);

const handleTyping = () => {
  socket.emit("userTyping", { sessionId, userId });
};

return (
  <div>
    {typingUser && <p>{typingUser} is typing...</p>}
    <input onKeyDown={handleTyping} />
  </div>
);
socket.on("newMessage", (msg) => {
    if (document.hidden) {
      new Notification("New Message", { body: msg.message });
    }
  });
  const [unreadCount, setUnreadCount] = useState(0);

useEffect(() => {
  socket.on("newMessage", (msg) => {
    if (document.hidden) {
      setUnreadCount((prev) => prev + 1);
      document.title = `(${unreadCount + 1}) New Messages`;
    }
  });

  return () => socket.off("newMessage");
}, []);

useEffect(() => {
  const handleVisibilityChange = () => {
    if (!document.hidden) {
      setUnreadCount(0);
      document.title = "NexaVid Chat";
    }
  };

  document.addEventListener("visibilitychange", handleVisibilityChange);
  return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
}, []);
const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file", file);
  
    const response = await fetch("/api/upload-media", { method: "POST", body: formData });
    const { fileUrl } = await response.json();
  
    socket.emit("sendMessage", { type: "media", url: fileUrl });
  };
  
  return (
    <div>
      <input type="file" accept="image/*,video/*" onChange={handleFileUpload} />
    </div>
  );
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file", file);
  
    const response = await fetch("/api/upload-file", { method: "POST", body: formData });
    const { fileUrl } = await response.json();
  
    socket.emit("sendMessage", { type: "file", url: fileUrl, name: file.name });
  };
  
  return (
    <div>
      <input type="file" accept=".pdf,.doc,.docx,.txt" onChange={handleFileUpload} />
    </div>
  );
  