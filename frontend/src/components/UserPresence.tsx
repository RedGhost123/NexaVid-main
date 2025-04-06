const [onlineUsers, setOnlineUsers] = useState([]);

useEffect(() => {
  socket.on("updateUserPresence", (users) => {
    setOnlineUsers(users);
  });

  return () => socket.off("updateUserPresence");
}, []);

return (
  <div>
    <h3>Online Users</h3>
    <ul>
      {onlineUsers.map((user) => (
        <li key={user}>{user}</li>
      ))}
    </ul>
  </div>
);
