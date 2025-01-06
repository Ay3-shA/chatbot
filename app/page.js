"use client";
import {
  Box,
  Button,
  Stack,
  TextField,
  CircularProgress,
  Typography,
} from "@mui/material";
import { useState, useRef, useEffect, useCallback } from "react";

function useScrollToBottom(messages) {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return messagesEndRef;
}

function Home() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hi! I'm the Headstarter support assistant. How can I help you today?",
    },
  ]);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useScrollToBottom(messages);

  const sendMessage = useCallback(async () => {
    if (!message.trim() || isLoading) return;
    setIsLoading(true);
    setMessage("");

    setMessages((messages) => [
      ...messages,
      { role: "user", content: message },
      { role: "assistant", content: "..." },
    ]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify([...messages, { role: "user", content: message }]),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      let assistantResponse = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = decoder.decode(value, { stream: true });
        assistantResponse += text;

        setMessages((messages) => [
          ...messages.slice(0, -1),
          { role: "assistant", content: assistantResponse },
        ]);
      }

      setMessages((messages) => [
        ...messages.slice(0, -1),
        { role: "assistant", content: assistantResponse },
      ]);
    } catch (error) {
      console.error("Error:", error);
      setMessages((messages) => [
        ...messages.slice(0, -1),
        { role: "assistant", content: "Sorry, something went wrong." },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [message, isLoading, messages]);

  const handleKeyPress = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      bgcolor="#0A0A0A"
      p={2}
      sx={{
        backgroundImage: "linear-gradient(135deg, #1E1E1E 25%, #0A0A0A 100%)",
        color: "#EDEDED",
      }}
    >
      <Typography
        variant="h4"
        gutterBottom
        sx={{ color: "#FFF", fontWeight: "bold", letterSpacing: 1.2 }}
      >
        Headstarter Support Assistant
      </Typography>
      <Stack
        direction={"column"}
        width={{ xs: "100%", sm: "500px" }}
        height="70vh"
        bgcolor="#2C2C2C"
        borderRadius="16px"
        boxShadow="0 8px 20px rgba(0, 0, 0, 0.3)"
        p={3}
        spacing={3}
        border="1px solid #333"
        sx={{
          transition: "transform 0.3s ease, box-shadow 0.3s ease",
          "&:hover": {
            transform: "scale(1.02)",
            boxShadow: "0 12px 24px rgba(0, 0, 0, 0.4)",
          },
        }}
      >
        <Stack
          direction={"column"}
          spacing={2}
          flexGrow={1}
          overflow="auto"
          maxHeight="100%"
          px={1}
          py={2}
          sx={{
            scrollbarWidth: "thin",
            "&::-webkit-scrollbar": {
              width: "6px",
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "#555",
              borderRadius: "10px",
            },
          }}
        >
          {messages.map((message, index) => (
            <Box
              key={index}
              display="flex"
              justifyContent={
                message.role === "assistant" ? "flex-start" : "flex-end"
              }
              mb={2}
            >
              <Box
                bgcolor={message.role === "assistant" ? "#007AFF" : "#4CAF50"}
                color="white"
                borderRadius={16}
                p={2}
                maxWidth="75%"
                boxShadow="0 4px 12px rgba(0, 0, 0, 0.3)"
                sx={{
                  transform: "translateY(-4px)",
                  transition: "transform 0.2s ease-in-out",
                  "&:hover": {
                    transform: "translateY(0)",
                  },
                }}
              >
                {message.content}
              </Box>
            </Box>
          ))}
          <div ref={messagesEndRef} />
        </Stack>
        <Stack direction={"row"} spacing={2} pt={1}>
          <TextField
            label="Type your message here…"
            variant="filled"
            fullWidth
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            InputProps={{
              style: { color: "#FFFFFF", backgroundColor: "#3E3E3E" },
            }}
            InputLabelProps={{
              style: { color: "#BBBBBB" },
            }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={sendMessage}
            disabled={isLoading}
            sx={{
              minWidth: "120px",
              padding: "10px 16px",
              fontSize: "16px",
              fontWeight: "bold",
              backgroundColor: "#FF5722",
              "&:hover": {
                backgroundColor: "#FF3D00",
              },
            }}
          >
            {isLoading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Send"
            )}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}

export default Home;
