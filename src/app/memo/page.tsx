"use client";
import { useEffect, useState } from "react";
import Head from "next/head";
import Script from "next/script";
import styles from "./memo.module.css";

interface Memo {
  _id: string;
  title: string;
  content: string;
  likes: number;
}

export default function MemoPage() {
  const [memos, setMemos] = useState<Memo[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");

  useEffect(() => {
    loadMemos();
  }, []);

  async function loadMemos() {
    const res = await fetch("/memo");
    const data = await res.json();
    if (data.result === "success") {
      setMemos(data.memos);
    } else {
      alert("메모를 불러올 수 없습니다.");
    }
  }

  async function postMemo() {
    if (!title.trim() || !content.trim()) {
      alert("제목과 내용을 모두 입력하세요!");
      return;
    }
    const res = await fetch("/memo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title_give: title, content_give: content }),
    });
    const data = await res.json();
    if (data.result === "success") {
      alert(data.msg);
      setTitle("");
      setContent("");
      loadMemos();
    } else {
      alert("메모 저장에 실패했습니다!");
    }
  }

  async function likeMemo(id: string) {
    const res = await fetch("/memo/like", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id_give: id }),
    });
    const data = await res.json();
    if (data.result === "success") {
      setMemos((prev) =>
        prev.map((memo) =>
          memo._id === id ? { ...memo, likes: data.new_likes } : memo
        )
      );
    } else {
      alert("좋아요 처리 실패!");
    }
  }

  async function deleteMemo(id: string) {
    if (!confirm("정말 이 메모를 삭제할까요?")) return;
    const res = await fetch("/memo/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id_give: id }),
    });
    const data = await res.json();
    if (data.result === "success") {
      loadMemos();
    } else {
      alert("메모 삭제 실패!");
    }
  }

  function startEdit(memo: Memo) {
    setEditingId(memo._id);
    setEditTitle(memo.title);
    setEditContent(memo.content);
  }

  async function saveEdit(id: string) {
    if (!editTitle.trim() || !editContent.trim()) {
      alert("제목과 내용을 모두 입력해주세요!");
      return;
    }
    const res = await fetch("/memo/edit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id_give: id,
        title_give: editTitle,
        content_give: editContent,
      }),
    });
    const data = await res.json();
    if (data.result === "success") {
      setEditingId(null);
      loadMemos();
    } else {
      alert("수정에 실패했습니다!");
    }
  }

  // Sort memos by likes descending
  const sortedMemos = [...memos].sort((a, b) => b.likes - a.likes);

  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <title>크래프톤 정글 | 나홀로 메모장</title>
      </Head>
      <Script src="https://code.jquery.com/jquery-3.5.1.min.js" strategy="afterInteractive" />
      <Script src="https://cdn.jsdelivr.net/npm/popper.js@1.16.1/dist/umd/popper.min.js" strategy="afterInteractive" crossOrigin="anonymous" />
      <Script src="https://cdn.jsdelivr.net/npm/bootstrap@4.6.0/dist/js/bootstrap.min.js" strategy="afterInteractive" crossOrigin="anonymous" />
      <div className={styles.wrap}>
        <div className="jumbotron">
          <h1 className="display-4">
            나홀로 메모장 <span className={styles["ver-badge"]}>ver3.0</span>
          </h1>
          <hr className="my-4" />
          <div id="post-box" className={`form-post ${styles["#post-box"]}`}> 
            <div>
              <div className="form-group">
                <input
                  id="memo-title"
                  className="form-control"
                  placeholder="제목을 입력하세요"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                />
              </div>
              <div className="form-group">
                <textarea
                  id="memo-content"
                  className="form-control"
                  rows={3}
                  placeholder="내용을 입력하세요"
                  value={content}
                  onChange={e => setContent(e.target.value)}
                ></textarea>
              </div>
              <button
                type="button"
                className="btn btn-primary"
                onClick={postMemo}
              >
                저장하기
              </button>
            </div>
          </div>
        </div>
        <div id="card-list" className={styles["card-columns"]}>
          {sortedMemos.map(memo => (
            <div className="card" key={memo._id} data-id={memo._id} data-likes={memo.likes}>
              <div className="card-body">
                {editingId === memo._id ? (
                  <div>
                    <input
                      type="text"
                      className="form-control new-title mb-2"
                      value={editTitle}
                      placeholder="새 제목 입력"
                      onChange={e => setEditTitle(e.target.value)}
                    />
                    <textarea
                      className="form-control new-text mb-2"
                      rows={2}
                      placeholder="새 내용 입력"
                      value={editContent}
                      onChange={e => setEditContent(e.target.value)}
                    ></textarea>
                    <button className="btn btn-success save-button" onClick={() => saveEdit(memo._id)}>
                      저장
                    </button>
                  </div>
                ) : (
                  <>
                    <h5 className="card-title">{memo.title}</h5>
                    <p className="card-text">{memo.content}</p>
                    <p className="card-likes">{memo.likes}</p>
                    <button className={`btn ${styles["btn-edit"]} edit-button`} onClick={() => startEdit(memo)}>
                      수정
                    </button>
                    <button className="btn btn-danger delete-button" onClick={() => deleteMemo(memo._id)}>
                      삭제
                    </button>
                    <a href="#" className="link-like" onClick={e => { e.preventDefault(); likeMemo(memo._id); }}>
                      좋아요! <i className="fas fa-thumbs-up"></i>
                    </a>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
