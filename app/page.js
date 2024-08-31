"use client";
import { Box, Button, Stack, TextField, CircularProgress } from "@mui/material";
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

        // Update the most recent assistant message
        setMessages((messages) => [
          ...messages.slice(0, -1),
          { role: "assistant", content: assistantResponse },
        ]);
      }

      // Final update to ensure full response is set
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
      bgcolor="#121212"
      color="hashtag#FFFFFF"
    >
      <Stack
        direction={"column"}
        width="500px"
        height="700px"
        bgcolor="hashtag#1E1E1E"
        borderRadius="12px"
        boxShadow="0 4px 12px rgba(0, 0, 0, 0.1)"
        p={2}
        spacing={3}
        border="1px solid #333"
      >
        <Stack
          direction={"column"}
          spacing={2}
          flexGrow={1}
          overflow="auto"
          maxHeight="100%"
          px={1}
          py={2}
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
                bgcolor={
                  message.role === "assistant"
                    ? "hashtag#007AFF"
                    : "hashtag#4CAF50"
                }
                color="white"
                borderRadius={16}
                p={2}
                maxWidth="75%"
                boxShadow="0 2px 8px rgba(0, 0, 0, 0.2)"
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
            variant="outlined"
            fullWidth
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            InputProps={{
              style: { color: "hashtag#FFFFFF", backgroundColor: "#333" },
            }}
            InputLabelProps={{
              style: { color: "hashtag#BBBBBB" },
            }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={sendMessage}
            disabled={isLoading}
            style={{ minWidth: "100px", padding: "12px" }}
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
