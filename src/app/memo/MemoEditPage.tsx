"use client";

import React, { useState } from "react";
import {
  Container,
  Box,
  Typography,
  Stack,
  Button,
  TextField,
  Alert,
} from "@mui/material";
import { useRouter } from "next/navigation";

export default function MemoEditPage({
  memo,
  onSaved,
}: {
  memo?: { id: string; title: string; content: string };
  onSaved?: () => void;
}) {
  const [title, setTitle] = useState(memo?.title || "");
  const [content, setContent] = useState(memo?.content || "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSave() {
    setLoading(true);
    setError("");
    const method = memo ? "PATCH" : "POST";
    const body = memo
      ? { id: memo.id, title_give: title, content_give: content }
      : { title_give: title, content_give: content };
    const res = await fetch("/api/memo", {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    setLoading(false);
    if (data.result === "success") {
      if (onSaved) onSaved();
      else router.push("/memo");
    } else {
      setError(data.msg || "저장에 실패했습니다!");
    }
  }

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Box sx={{ boxShadow: 2, borderRadius: 2, p: 4, bgcolor: "background.paper" }}>
        <Typography variant="h5" fontWeight={700} align="center" mb={3}>
          {memo ? "메모 수정" : "메모 작성"}
        </Typography>
        <Stack spacing={2}>
          <TextField
            label="제목"
            value={title}
            onChange={e => setTitle(e.target.value)}
            fullWidth
            autoFocus
          />
          <TextField
            label="내용"
            value={content}
            onChange={e => setContent(e.target.value)}
            fullWidth
            multiline
            minRows={16}
            maxRows={40}
          />
          {error && <Alert severity="error">{error}</Alert>}
          <Button variant="contained" color="primary" onClick={handleSave} disabled={loading} sx={{ bgcolor: '#1976d2', color: '#fff', '&:hover': { bgcolor: '#115293' } }}>
            저장
          </Button>
        </Stack>
      </Box>
    </Container>
  );
}
