"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { AppBar, Toolbar, Typography, Button, Box, Stack } from "@mui/material";
import styles from "./memo/memo.module.css";

export default function Header() {
  const [user, setUser] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const userId = typeof window !== "undefined" ? localStorage.getItem("userId") : null;
    setUser(userId);
  }, [pathname]);

  if (pathname === "/login" || pathname === "/signup") return null;

  return (
    <AppBar position="static" color="default" elevation={0}>
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        <Box display="flex" alignItems="center" sx={{ cursor: "pointer" }} onClick={() => router.push("/memo") }>
          <Typography variant="h5" fontWeight={700} color="inherit">
            나홀로 메모장 <span className={styles["ver-badge"]} style={{ fontSize: "1.2rem", marginLeft: 8, backgroundColor: '#1976d2', color: '#fff', fontWeight: 700 }}>ver3.0</span>
          </Typography>
        </Box>
        <Stack direction="row" spacing={2} alignItems="center">
          {user ? (
            <>
              <Typography color="text.secondary">{user} 님</Typography>
              <Button variant="outlined" color="primary" size="small" onClick={() => {
                if (typeof window !== "undefined") localStorage.removeItem("userId");
                setUser(null);
                router.push("/login");
              }}>
                로그아웃
              </Button>
            </>
          ) : (
            <Button variant="contained" color="primary" size="small" onClick={() => router.push("/login")}>로그인</Button>
          )}
        </Stack>
      </Toolbar>
    </AppBar>
  );
}
