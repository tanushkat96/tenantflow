import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import io from "socket.io-client";
import SocketContext from "./SocketContext";

export const SocketProvider = ({ children }) => {
  const socketRef = useRef(null);
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const { user, token } = useSelector((state) => state.auth);

  useEffect(() => {
    if (user && token) {
      const newSocket = io(
        import.meta.env.VITE_API_URL || "http://localhost:5000",
        {
          auth: { token },
          transports: ["websocket", "polling"],
        },
      );

      newSocket.on("connect", () => {
        console.log("Socket connected:", newSocket.id);
        socketRef.current = newSocket;
        setSocket(newSocket);
        setConnected(true);

        newSocket.emit("join", user._id);
        if (user.tenantId) {
          newSocket.emit("join-tenant", user.tenantId);
        }
      });

      newSocket.on("disconnect", () => {
        console.log("Socket disconnected");
        setConnected(false);
      });

      newSocket.on("connect_error", (error) => {
        console.error("Socket connection error:", error);
        setConnected(false);
      });

      return () => {
        newSocket.close();
        socketRef.current = null;
        setSocket(null);
        setConnected(false);
      };
    }
  }, [user, token]);

  const joinProject = (projectId) => {
    if (socketRef.current && connected) {
      socketRef.current.emit("join-project", projectId);
    }
  };

  const leaveProject = (projectId) => {
    if (socketRef.current && connected) {
      socketRef.current.emit("leave-project", projectId);
    }
  };

  const value = {
    socket,
    connected,
    joinProject,
    leaveProject,
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};

export default SocketProvider;
