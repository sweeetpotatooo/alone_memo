import React, { useState } from "react";
import {
  Modal,
  Box,
  Typography,
  Stack,
  Button,
  TextField,
  IconButton,
  Alert
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import ThumbUpAltOutlinedIcon from "@mui/icons-material/ThumbUpAltOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import CloseIcon from "@mui/icons-material/Close";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

interface Memo {
  id: string;
  title: string;
  content: string;
  likes: number;
  createdAt: string;
  userId: string;
}

interface Comment {
  id: string;
  content: string;
  userId: string;
  createdAt: string;
}

interface MemoModalProps {
  memo: Memo;
  onClose: () => void;
  onUpdated: () => void;
}

export default function MemoModal({ memo, onClose, onUpdated }: MemoModalProps) {
  const [editMode, setEditMode] = useState(false);
  const [title, setTitle] = useState(memo.title);
  const [content, setContent] = useState(memo.content);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentInput, setCommentInput] = useState("");
  const [commentError, setCommentError] = useState("");

  // 댓글 수정/삭제 상태 관리
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editCommentInput, setEditCommentInput] = useState("");
  const [commentActionError, setCommentActionError] = useState("");

  // 좋아요 상태
  const [likeLoading, setLikeLoading] = useState(false);
  const [liked, setLiked] = useState<boolean | null>(null);
  const [likeCount, setLikeCount] = useState(memo.likes);

  // 현재 로그인한 사용자 ID
  const userId = typeof window !== "undefined" ? localStorage.getItem("userId") : null;

  // 좋아요 상태 초기화 (모달 열릴 때마다)
  React.useEffect(() => {
    setLikeCount(memo.likes);
    async function fetchLiked() {
      console.time('fetch-liked');
      const res = await fetch("/api/like", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ id: memo.id, checkOnly: true }),
      });
      const data = await res.json();
      console.timeEnd('fetch-liked');
      if (data.result === "success" && typeof data.liked === "boolean") {
        setLiked(data.liked);
      } else {
        setLiked(false);
      }
    }
    fetchLiked();
  }, [memo.id, memo.likes]);

  React.useEffect(() => {
    console.time('fetch-comments');
    fetch(`/api/memo/${memo.id}/comments`)
      .then(res => res.json())
      .then(data => {
        console.timeEnd('fetch-comments');
        if (data.result === "success") setComments(data.comments);
      });
  }, [memo.id]);

  async function handleSave() {
    setLoading(true);
    setError("");
    console.time('memo-save');
    const res = await fetch("/api/memo", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ id: memo.id, title_give: title, content_give: content }),
    });
    const data = await res.json();
    console.timeEnd('memo-save');
    setLoading(false);
    if (data.result === "success") {
      setEditMode(false);
      onUpdated();
      onClose();
    } else {
      setError(data.msg || "수정에 실패했습니다!");
    }
  }

  async function handleDelete() {
    if (!confirm("정말 이 메모를 삭제할까요?")) return;
    setLoading(true);
    setError("");
    const res = await fetch("/api/memo", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ id: memo.id }),
    });
    const data = await res.json();
    setLoading(false);
    if (data.result === "success") {
      onUpdated();
      onClose();
    } else {
      setError(data.msg || "삭제에 실패했습니다!");
    }
  }

  async function handleCommentSubmit() {
    setCommentError("");
    if (!commentInput.trim()) {
      setCommentError("댓글을 입력하세요.");
      return;
    }
    console.time('comment-submit');
    const res = await fetch(`/api/memo/${memo.id}/comments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ content: commentInput }),
    });
    const data = await res.json();
    console.timeEnd('comment-submit');
    if (data.result === "success") {
      setCommentInput("");
      setComments((prev) => [...prev, data.comment]);
    } else {
      setCommentError(data.msg || "댓글 작성에 실패했습니다!");
    }
  }

  async function handleCommentEdit(commentId: string) {
    setCommentActionError("");
    if (!editCommentInput.trim()) {
      setCommentActionError("댓글을 입력하세요.");
      return;
    }
    const res = await fetch(`/api/memo/${memo.id}/comments`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ commentId, content: editCommentInput }),
    });
    const data = await res.json();
    if (data.result === "success") {
      setComments((prev) => prev.map(c => c.id === commentId ? { ...c, content: editCommentInput } : c));
      setEditingCommentId(null);
      setEditCommentInput("");
    } else {
      setCommentActionError(data.msg || "댓글 수정에 실패했습니다!");
    }
  }

  async function handleCommentDelete(commentId: string) {
    if (!confirm("정말 이 댓글을 삭제할까요?")) return;
    setCommentActionError("");
    const res = await fetch(`/api/memo/${memo.id}/comments`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ commentId }),
    });
    const data = await res.json();
    if (data.result === "success") {
      setComments((prev) => prev.filter(c => c.id !== commentId));
      setEditingCommentId(null);
      setEditCommentInput("");
    } else {
      setCommentActionError(data.msg || "댓글 삭제에 실패했습니다!");
    }
  }

  async function handleLike() {
    setLikeLoading(true);
    console.time('like');
    const res = await fetch("/api/like", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ id: memo.id }),
    });
    const data = await res.json();
    console.timeEnd('like');
    setLikeLoading(false);
    if (data.result === "success") {
      setLiked(data.liked);
      setLikeCount(data.new_likes);
      onUpdated();
    }
  }

  // 렌더링 시간 측정
  console.log('MemoModal 렌더링됨', new Date().toISOString());

  return (
    <Modal open onClose={onClose}>
      <Box sx={{
        position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
        bgcolor: "background.paper", boxShadow: 24, p: 4, borderRadius: 2, minWidth: 500, maxWidth: 800
      }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1} mb={2}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography variant="h5" sx={{ wordBreak: 'break-all' }}>{memo.title}</Typography>
            <Stack direction="row" alignItems="center" spacing={0.5} ml={1}>
              <AccessTimeIcon fontSize="small"/>
              <Typography variant="body2" color="text.secondary">
                {new Date(memo.createdAt).toLocaleDateString("ko-KR", { year: '2-digit', month: '2-digit', day: '2-digit' })}
              </Typography>
            </Stack>
          </Stack>
          {userId === memo.userId && (
            <Stack direction="row" spacing={1}>
              <IconButton color="info" onClick={() => setEditMode(true)} disabled={loading} size="small"><EditIcon /></IconButton>
              <IconButton color="error" onClick={handleDelete} disabled={loading} size="small"><DeleteIcon /></IconButton>
              <IconButton onClick={onClose} sx={{ bgcolor: '#eee', '&:hover': { bgcolor: '#ccc' }, ml: 1 }} size="small">
                <CloseIcon fontSize="small" />
              </IconButton>
            </Stack>
          )}
          {userId !== memo.userId && (
            <IconButton onClick={onClose} sx={{ bgcolor: '#eee', '&:hover': { bgcolor: '#ccc' }, ml: 1 }} size="small">
              <CloseIcon fontSize="small" />
            </IconButton>
          )}
        </Stack>
        <Stack spacing={2}>
          {editMode ? (
            <Stack spacing={2}>
              <TextField label="제목" value={title} onChange={e => setTitle(e.target.value)} fullWidth />
              <TextField label="내용" value={content} onChange={e => setContent(e.target.value)} fullWidth multiline minRows={3} />
              {error && <Alert severity="error">{error}</Alert>}
              <Stack direction="row" spacing={1}>
                <Button variant="contained" color="success" onClick={handleSave} disabled={loading}>저장</Button>
                <Button variant="outlined" onClick={() => setEditMode(false)} disabled={loading}>취소</Button>
              </Stack>
            </Stack>
          ) : (
            <Stack spacing={2}>
              <Typography variant="body1">{memo.content}</Typography>
              <Stack direction="row" alignItems="center" spacing={2} mb={2}>
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <IconButton onClick={handleLike} disabled={likeLoading} color={liked ? "primary" : "default"}>
                    <ThumbUpAltOutlinedIcon fontSize="small" />
                  </IconButton>
                  <Typography variant="body2" color="text.secondary">{likeCount}</Typography>
                </Stack>
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <PersonOutlineIcon fontSize="small"/>
                  <Typography variant="body2" color="text.secondary">{memo.userId}</Typography>
                </Stack>
              </Stack>
              {error && <Alert severity="error">{error}</Alert>}
            </Stack>
          )}
          <Stack spacing={2} mt={3}>
            <Typography variant="subtitle1" fontWeight={700}>댓글</Typography>
            <Stack spacing={1}>
              {comments.length === 0 && <Typography color="text.secondary">아직 댓글이 없습니다.</Typography>}
              {comments.map((c) => (
                <Box key={c.id} sx={{ bgcolor: "#f5f5f5", borderRadius: 1, p: 1, mb: 1 }}>
                  {editingCommentId === c.id ? (
                    <Stack direction="row" spacing={1} alignItems="center">
                      <TextField
                        value={editCommentInput}
                        onChange={e => setEditCommentInput(e.target.value)}
                        size="small"
                        fullWidth
                      />
                      <Button variant="contained" size="small" onClick={() => handleCommentEdit(c.id)}>저장</Button>
                      <Button variant="outlined" size="small" onClick={() => { setEditingCommentId(null); setEditCommentInput(""); }}>취소</Button>
                    </Stack>
                  ) : (
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                      <Typography variant="body2">{c.content}</Typography>
                      <Stack direction="row" spacing={0} alignItems="center">
                        <IconButton size="small" onClick={() => { setEditingCommentId(c.id); setEditCommentInput(c.content); }}><EditIcon fontSize="small" /></IconButton>
                        <IconButton size="small" onClick={() => handleCommentDelete(c.id)}><DeleteIcon fontSize="small" /></IconButton>
                      </Stack>
                    </Stack>
                  )}
                  <Stack direction="row" spacing={1} alignItems="center" mt={0.5}>
                    <Typography variant="caption" color="text.secondary">{c.userId}</Typography>
                    <Typography variant="caption" color="text.secondary">{new Date(c.createdAt).toLocaleString("ko-KR")}</Typography>
                  </Stack>
                </Box>
              ))}
              {commentActionError && <Alert severity="error">{commentActionError}</Alert>}
            </Stack>
            <Stack direction="row" spacing={1} alignItems="flex-end">
              <TextField
                label="댓글 작성"
                value={commentInput}
                onChange={e => setCommentInput(e.target.value)}
                fullWidth
                size="small"
                error={!!commentError}
                helperText={commentError}
                slotProps={{
                  input: {
                    sx: {
                      bgcolor: (theme) => theme.palette.mode === 'dark' ? '#23272a' : '#fff',
                    }
                  }
                }}
              />
              <Button variant="contained" onClick={handleCommentSubmit}>등록</Button>
            </Stack>
          </Stack>
        </Stack>
      </Box>
    </Modal>
  );
}
