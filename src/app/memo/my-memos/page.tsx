"use client";
import { useEffect, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Stack,
  Pagination,
  Fab,
  IconButton,
  CircularProgress,
} from "@mui/material";
import MemoModal from "../MemoModal";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useRouter } from "next/navigation";
import NotesIcon from "@mui/icons-material/Notes";
import ThumbUpAltOutlinedIcon from "@mui/icons-material/ThumbUpAltOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ViewListIcon from "@mui/icons-material/ViewList";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import SearchIcon from "@mui/icons-material/Search";
import SortIcon from '@mui/icons-material/Sort';

interface Memo {
  id: string;
  title: string;
  content: string;
  likes: number;
  createdAt: string;
  userId: string;
}

export default function MyMemosPage() {
  const [memos, setMemos] = useState<Memo[]>([]);
  const [selectedMemo, setSelectedMemo] = useState<Memo | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 9;
  const router = useRouter();
  const [likedMap, setLikedMap] = useState<{ [id: string]: boolean }>({});
  const [viewType, setViewType] = useState<'card' | 'list'>('card');
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [sortType, setSortType] = useState<'latest' | 'likes'>('latest');

  // 정렬, 검색, 페이지네이션
  const sortedMemos = [...memos].sort((a, b) => {
    if (sortType === 'latest') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else {
      return b.likes - a.likes;
    }
  });
  const filteredMemos = sortedMemos.filter(
    (memo) =>
      memo.title.toLowerCase().includes(search.toLowerCase()) ||
      memo.content.toLowerCase().includes(search.toLowerCase()) ||
      memo.userId.toLowerCase().includes(search.toLowerCase())
  );
  const pagedMemos = filteredMemos.slice((page - 1) * pageSize, page * pageSize);
  const pageCount = Math.ceil(filteredMemos.length / pageSize);

  useEffect(() => {
    loadMemos();
  }, []);

  async function loadMemos() {
    setLoading(true);
    const res = await fetch("/api/memo?filter=my", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    const data = await res.json();
    if (data.result === "success") {
      setMemos(data.memos);
    }
    setLoading(false);
  }

  if (loading) return <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}><CircularProgress /></Box>;

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box mb={4}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ cursor: "pointer" }} onClick={() => router.push("/memo/my-memos") }>
              <NotesIcon fontSize="large" color="primary" />
              <Typography variant="h4" fontWeight={700} gutterBottom>
                내가 작성한 글
              </Typography>
            </Stack>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Box component="form" onSubmit={e => { e.preventDefault(); }} sx={{ display: 'flex', alignItems: 'center', bgcolor: '#f5f5f5', borderRadius: 1, px: 1, mr: 1 }}>
              <SearchIcon color="action" />
              <input
                type="text"
                placeholder="검색어를 입력하세요"
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: 16, padding: 4, width: 160 }}
              />
              <IconButton
                sx={{ ml: 1 }}
                onClick={() => {
                  setSortType(prev => prev === 'latest' ? 'likes' : 'latest');
                  setPage(1);
                }}
                aria-label="정렬 변경"
                color={sortType === 'likes' ? 'primary' : 'default'}
              >
                <SortIcon />
                <span style={{ fontSize: 13, marginLeft: 4 }}>
                  {sortType === 'latest' ? '최신순' : '좋아요순'}
                </span>
              </IconButton>
            </Box>
            <IconButton onClick={() => setViewType('card')} color={viewType === 'card' ? 'primary' : 'default'}>
              <ViewModuleIcon />
            </IconButton>
            <IconButton onClick={() => setViewType('list')} color={viewType === 'list' ? 'primary' : 'default'}>
              <ViewListIcon />
            </IconButton>
            <Fab color="primary" aria-label="refresh" size="small" onClick={loadMemos} sx={{ boxShadow: 2 }}>
              <RefreshIcon />
            </Fab>
          </Stack>
        </Stack>
        {viewType === 'card' ? (
          <Box display="grid" gridTemplateColumns="repeat(3, 1fr)" gap={2} minHeight={pagedMemos.length > 0 ? 0 : 300}>
            {pagedMemos.map((memo) => (
              <Card
                key={memo.id}
                sx={{
                  minWidth: 0,
                  maxWidth: 350,
                  minHeight: 180,
                  height: 180,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  cursor: "pointer",
                  transition: 'box-shadow 0.2s, transform 0.2s',
                  boxShadow: 2,
                  '&:hover': {
                    boxShadow: 8,
                    transform: 'translateY(-6px) scale(1.03)',
                    border: '2px solid #1976d2',
                    zIndex: 2,
                  },
                }}
                onClick={() => setSelectedMemo(memo)}
              >
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ color: '#1976d2' }}>
                    {memo.title}
                  </Typography>
                  <Stack direction="row" alignItems="center" spacing={2} mb={1}>
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <IconButton
                        onClick={async (e) => {
                          e.stopPropagation();
                          const res = await fetch("/api/like", {
                            method: "POST",
                            headers: {
                              "Content-Type": "application/json",
                              Authorization: `Bearer ${localStorage.getItem("token")}`,
                            },
                            body: JSON.stringify({ id: memo.id }),
                          });
                          const data = await res.json();
                          setLikedMap((prev) => ({ ...prev, [memo.id]: data.liked }));
                          loadMemos();
                        }}
                        color={likedMap[memo.id] ? "primary" : "default"}
                      >
                        <ThumbUpAltOutlinedIcon fontSize="small" />
                      </IconButton>
                      <Typography variant="body2" color="text.secondary">
                        {memo.likes}
                      </Typography>
                    </Stack>
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <PersonOutlineIcon fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {memo.userId}
                      </Typography>
                    </Stack>
                  </Stack>
                  <Stack direction="row" alignItems="center" spacing={0.5} mb={1}>
                    <AccessTimeIcon fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      {new Date(memo.createdAt).toLocaleDateString("ko-KR", { year: '2-digit', month: '2-digit', day: '2-digit' })}
                    </Typography>
                  </Stack>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {memo.content.length > 40 ? memo.content.slice(0, 40) + "..." : memo.content}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        ) : (
          <Box minHeight={pagedMemos.length > 0 ? 0 : 300}>
            <Stack spacing={1}>
              {pagedMemos.map((memo) => (
                <Card
                  key={memo.id}
                  sx={{
                    width: '100%',
                    minHeight: 80,
                    display: 'flex',
                    alignItems: 'center',
                    px: 2,
                    py: 1,
                    boxShadow: 1,
                    mb: 1,
                    cursor: 'pointer',
                    transition: 'box-shadow 0.2s, background 0.2s',
                    '&:hover': {
                      boxShadow: 6,
                      background: '#f0f7ff',
                    },
                  }}
                  onClick={() => setSelectedMemo(memo)}
                >
                  <Stack direction="row" alignItems="center" spacing={2} width="100%">
                    <Typography variant="subtitle1" fontWeight={700} sx={{ minWidth: 120 }}>
                      {memo.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
                      {memo.content.length > 40 ? memo.content.slice(0, 40) + "..." : memo.content}
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <IconButton
                        onClick={async (e) => {
                          e.stopPropagation();
                          const res = await fetch("/api/like", {
                            method: "POST",
                            headers: {
                              "Content-Type": "application/json",
                              Authorization: `Bearer ${localStorage.getItem("token")}`,
                            },
                            body: JSON.stringify({ id: memo.id }),
                          });
                          const data = await res.json();
                          setLikedMap((prev) => ({ ...prev, [memo.id]: data.liked }));
                          loadMemos();
                        }}
                        color={likedMap[memo.id] ? "primary" : "default"}
                      >
                        <ThumbUpAltOutlinedIcon fontSize="small" />
                      </IconButton>
                      <Typography variant="body2" color="text.secondary">
                        {memo.likes}
                      </Typography>
                      <PersonOutlineIcon fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {memo.userId}
                      </Typography>
                      <AccessTimeIcon fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {new Date(memo.createdAt).toLocaleDateString("ko-KR", { year: '2-digit', month: '2-digit', day: '2-digit' })}
                      </Typography>
                    </Stack>
                  </Stack>
                </Card>
              ))}
            </Stack>
          </Box>
        )}
        <Stack alignItems="center" mt={4}>
          <Pagination
            count={pageCount}
            page={page}
            onChange={(_, value) => setPage(value)}
            color="primary"
            shape="rounded"
            size="large"
          />
        </Stack>
      </Box>
      {selectedMemo && (
        <MemoModal
          memo={selectedMemo}
          onClose={() => setSelectedMemo(null)}
          onUpdated={loadMemos}
        />
      )}
    </Container>
  );
}
