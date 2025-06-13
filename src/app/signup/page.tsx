"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Button, Container, TextField, Typography, Alert, Link, Stack } from "@mui/material";

export default function SignupPage() {
  const [id, setId] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!id.trim() || !pw.trim() || !pw2.trim()) {
      setError("모든 항목을 입력하세요.");
      return;
    }
    if (pw !== pw2) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }
    // 실제 회원가입 API 연동 필요
    const res = await fetch("/api/signup", {
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
      setSuccess("회원가입이 완료되었습니다! 로그인 해주세요.");
      setTimeout(() => router.push("/login"), 1200);
    } else {
      setError(data.msg || "회원가입에 실패했습니다.");
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
          회원가입
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}
        <form onSubmit={handleSignup}>
          <Stack spacing={2}>
            <TextField
              label="아이디"
              value={id}
              onChange={e => setId(e.target.value)}
              fullWidth
              autoFocus
            />
            <TextField
              label="비밀번호"
              type="password"
              value={pw}
              onChange={e => setPw(e.target.value)}
              fullWidth
            />
            <TextField
              label="비밀번호 확인"
              type="password"
              value={pw2}
              onChange={e => setPw2(e.target.value)}
              fullWidth
            />
            <Button type="submit" variant="contained" color="primary" fullWidth>회원가입</Button>
          </Stack>
        </form>
        <Box mt={2} textAlign="center">
          <Link href="/login" underline="hover">로그인</Link>
        </Box>
      </Box>
    </Container>
  );
}
