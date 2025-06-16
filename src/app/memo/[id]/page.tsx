import { notFound } from "next/navigation";

export default async function Page({ params }: { params: { id: string } }) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const res = await fetch(`${baseUrl}/api/memo`, { cache: 'no-store' });
  const data = await res.json();
  
  // 타입 에러 방지: any 대신 Memo 타입 사용
  type Memo = { id: string; title: string; content: string; likes: number; createdAt: string; userId: string };
  const memo = (data.memos as Memo[])?.find((m) => m.id === params.id);
  if (!memo) return notFound();

  return (
    <main style={{ maxWidth: 600, margin: '40px auto', padding: 24, background: '#fff', borderRadius: 12, boxShadow: '0 2px 16px rgba(0,0,0,0.08)' }}>
      <h2 style={{ color: '#1976d2', fontWeight: 700 }}>{memo.title}</h2>
      <div style={{ color: '#888', fontSize: 14, marginBottom: 8 }}>작성자: {memo.userId} | {memo.createdAt}</div>
      <div style={{ margin: '16px 0', fontSize: 16 }}>{memo.content}</div>
      <div style={{ color: '#1976d2', fontWeight: 500 }}>좋아요: {memo.likes}</div>
    </main>
  );
}
