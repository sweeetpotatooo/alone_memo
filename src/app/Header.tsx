"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { AppBar, Toolbar, Typography, Button, Box, Stack, IconButton } from "@mui/material";
import DarkModeIcon from '@mui/icons-material/DarkMode';
import NotificationsIcon from '@mui/icons-material/Notifications';
import DeleteIcon from '@mui/icons-material/Delete';
import Drawer from '@mui/material/Drawer';
import styles from "./memo/memo.module.css";

// 알림 타입 정의
interface Notification {
  id: string;
  type: string;
  message: string;
  userId: string;
  fromUserId?: string;
  memoId?: string;
  read: boolean;
  createdAt: string;
}

export default function Header() {
  const [user, setUser] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notiOpen, setNotiOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const userId = typeof window !== "undefined" ? localStorage.getItem("userId") : null;
    setUser(userId);
  }, [pathname]);

  // 드롭다운 외부 클릭 시 닫힘 처리
  useEffect(() => {
    if (!dropdownOpen) return;
    function handleClick(e: Event) {
      setDropdownOpen(false);
    }
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [dropdownOpen]);

  // 알림 목록 불러오기
  useEffect(() => {
    if (!user) return;
    async function fetchNotifications() {
      const res = await fetch('/api/notification', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await res.json();
      if (data.result === 'success') {
        setNotifications(data.notifications);
        setUnreadCount(data.notifications.filter((n: Notification) => !n.read).length);
      }
    }
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 20000); // 20초마다 갱신
    return () => clearInterval(interval);
  }, [user]);

  // 알림 읽음 처리
  async function markNotificationsRead(ids: string[]) {
    await fetch('/api/notification', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
      body: JSON.stringify({ ids }),
    });
    setNotifications((prev) => prev.map(n => ids.includes(n.id) ? { ...n, read: true } : n));
    setUnreadCount((prev) => prev - ids.length);
  }

  // 알림 삭제 함수 추가
  async function deleteNotification(id: string) {
    await fetch('/api/notification', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
      body: JSON.stringify({ id }),
    });
    setNotifications((prev) => prev.filter(n => n.id !== id));
    setUnreadCount((prev) => prev - 1);
  }

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
              {/* 다크모드 토글 버튼 */}
              <IconButton
                size="small"
                sx={{ mr: 1, p: 1, borderRadius: '50%' }}
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    const isDark = document.documentElement.classList.toggle('dark-mode');
                    localStorage.setItem('nightMode', isDark ? 'true' : 'false');
                  }
                }}
                aria-label="나이트 모드 전환"
                color="inherit"
              >
                <DarkModeIcon />
              </IconButton>
              {/* 알림 아이콘 */}
              <Box sx={{ position: 'relative', mr: 1 }}>
                <IconButton color={unreadCount > 0 ? 'primary' : 'default'} onClick={() => { setNotiOpen(true); setDropdownOpen(false); if (unreadCount > 0) markNotificationsRead(notifications.filter(n => !n.read).map(n => n.id)); }}>
                  <NotificationsIcon />
                  {unreadCount > 0 && (
                    <Box sx={{ position: 'absolute', top: 6, right: 6, width: 10, height: 10, bgcolor: 'red', borderRadius: '50%' }} />
                  )}
                </IconButton>
                <Drawer anchor="right" open={notiOpen} onClose={() => setNotiOpen(false)}>
                  <Box sx={{ width: 320, p: 2, pt: 3, bgcolor: '#fff', height: '100%', boxSizing: 'border-box' }}>
                    <Typography variant="h6" fontWeight={700} mb={2} color="primary">알림</Typography>
                    {notifications.length === 0 ? (
                      <Typography color="text.secondary" fontSize={14} textAlign="center" py={2}>알림이 없습니다.</Typography>
                    ) : notifications.map((n) => (
                      <Box key={n.id} sx={{ px: 1, py: 1, borderBottom: '1px solid #eee', bgcolor: n.read ? 'inherit' : '#e3f2fd', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box onClick={() => { if (!n.read) markNotificationsRead([n.id]); if (n.memoId) router.push(`/memo`); setNotiOpen(false); }} sx={{ flex: 1, minWidth: 0 }}>
                          <Typography fontSize={14} color={n.read ? 'text.secondary' : 'primary'}>{n.message}</Typography>
                          <Typography fontSize={12} color="text.secondary">{new Date(n.createdAt).toLocaleString('ko-KR')}</Typography>
                        </Box>
                        <IconButton size="small" onClick={() => deleteNotification(n.id)} aria-label="알림 삭제" sx={{ ml: 1 }}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    ))}
                  </Box>
                </Drawer>
              </Box>
              <Box sx={{ position: 'relative', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                {/* 유저 드롭다운 */}
                <Typography
                  color="text.secondary"
                  sx={{ cursor: 'pointer', userSelect: 'none' }}
                  onClick={e => { e.stopPropagation(); setDropdownOpen(v => !v); }}
                >
                  {user} 님
                </Typography>
                {dropdownOpen && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: '100%',
                      right: 0,
                      bgcolor: '#fff',
                      boxShadow: 3,
                      borderRadius: 1,
                      minWidth: 120,
                      zIndex: 10,
                      mt: 1,
                      p: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-end',
                    }}
                  >
                    <Button fullWidth sx={{ justifyContent: 'flex-end', textAlign: 'right' }} onClick={e => { e.stopPropagation(); setDropdownOpen(false); router.push('/memo/my-memos'); }}>
                      내가 작성한 글
                    </Button>
                    <Button fullWidth sx={{ justifyContent: 'flex-end', textAlign: 'right' }} onClick={e => { e.stopPropagation(); setDropdownOpen(false); router.push('/memo/liked-memos'); }}>
                      내가 좋아요한 글
                    </Button>
                  </Box>
                )}
              </Box>
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
