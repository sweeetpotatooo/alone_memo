import { notFound } from "next/navigation";

export default async function MemoDetailPage({ params }: { params: { id: string } }) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const res = await fetch(`${baseUrl}/api/memo`, { cache: 'no-store' });
  const data = await res.json();
  const memo = data.memos?.find((m: any) => m.id === params.id);
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
