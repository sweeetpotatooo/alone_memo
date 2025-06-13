"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Alert,
  Link,
  Stack,
} from "@mui/material";

export default function LoginPage() {
  const [id, setId] = useState("");
  const [pw, setPw] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!id.trim() || !pw.trim()) {
      setError("아이디와 비밀번호를 모두 입력하세요.");
      return;
    }
    // 실제 로그인 API 연동 필요
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, pw }),
    });
    let data;
    try {
      data = await res.json();
    } catch {
      setError("서버에서 올바른 JSON 응답을 받지 못했습니다.");
      return;
    }
    if (data.result === "success") {
      if (typeof window !== "undefined") {
        localStorage.setItem("userId", id);
        localStorage.setItem("token", data.token);
        // 토큰 저장 직후 값 확인 (디버깅용)
        console.log("로그인 후 저장된 토큰:", localStorage.getItem("token"));
      }
      router.push("/memo");
    } else {
      setError(data.msg || "로그인에 실패했습니다.");
    }
  }

  return (
    <Container maxWidth="xs" sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', py: 0 }}>
      <Typography
        variant="h4"
        fontWeight={700}
        align="center"
        mb={3}
        sx={{ color: '#1976d2', mb: 4 }}
      >
        나홀로 메모장
      </Typography>
      <Box
        sx={{
          boxShadow: 2,
          borderRadius: 2,
          p: 4,
          bgcolor: "background.paper",
          width: '100%',
          maxWidth: 400,
          border: '2px solid #1976d2',
        }}
      >
        <Typography
          variant="h5"
          fontWeight={700}
          align="center"
          mb={3}
        >
          로그인
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <form onSubmit={handleLogin}>
          <Stack spacing={2}>
            <TextField
              label="아이디"
              value={id}
              onChange={(e) => setId(e.target.value)}
              fullWidth
              autoFocus
            />
            <TextField
              label="비밀번호"
              type="password"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              fullWidth
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
            >
              로그인
            </Button>
          </Stack>
        </form>
        <Box mt={2} textAlign="center">
          <Link href="/signup" underline="hover">
            회원가입
          </Link>
        </Box>
      </Box>
    </Container>
  );
}
