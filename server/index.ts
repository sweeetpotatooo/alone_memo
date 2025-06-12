import express from 'express';

interface User {
  id: string;
  password: string;
}

interface Comment {
  id: number;
  author: string;
  text: string;
}

interface Post {
  id: number;
  title: string;
  content: string;
  author: string;
  comments: Comment[];
}

const users: User[] = [];
const posts: Post[] = [];
let postSeq = 1;
let commentSeq = 1;

const app = express();
app.use(express.json());

app.post('/signup', (req, res) => {
  const { id_give, pw_give } = req.body as { id_give: string; pw_give: string };
  if (!id_give || !pw_give) {
    return res.json({ result: 'fail', msg: '필수 값이 누락되었습니다.' });
  }
  if (users.find(u => u.id === id_give)) {
    return res.json({ result: 'fail', msg: '이미 존재하는 아이디입니다.' });
  }
  users.push({ id: id_give, password: pw_give });
  return res.json({ result: 'success', msg: '회원가입 완료' });
});

app.post('/login', (req, res) => {
  const { id_give, pw_give } = req.body as { id_give: string; pw_give: string };
  const user = users.find(u => u.id === id_give && u.password === pw_give);
  if (user) {
    return res.json({ result: 'success', msg: '로그인 성공' });
  }
  return res.json({ result: 'fail', msg: '로그인 실패' });
});

app.post('/posts', (req, res) => {
  const { title_give, content_give, author_give } = req.body as {
    title_give: string;
    content_give: string;
    author_give: string;
  };
  if (!title_give || !content_give || !author_give) {
    return res.json({ result: 'fail', msg: '필수 값이 누락되었습니다.' });
  }
  const newPost: Post = {
    id: postSeq++,
    title: title_give,
    content: content_give,
    author: author_give,
    comments: []
  };
  posts.push(newPost);
  return res.json({ result: 'success', post: newPost });
});

app.get('/posts', (_req, res) => {
  return res.json({ result: 'success', posts });
});

app.get('/posts/:id', (req, res) => {
  const postId = Number(req.params.id);
  const post = posts.find(p => p.id === postId);
  if (!post) {
    return res.json({ result: 'fail', msg: '게시물을 찾을 수 없습니다.' });
  }
  return res.json({ result: 'success', post });
});

app.post('/posts/:id/comments', (req, res) => {
  const postId = Number(req.params.id);
  const { author_give, text_give } = req.body as {
    author_give: string;
    text_give: string;
  };
  const post = posts.find(p => p.id === postId);
  if (!post) {
    return res.json({ result: 'fail', msg: '게시물을 찾을 수 없습니다.' });
  }
  if (!author_give || !text_give) {
    return res.json({ result: 'fail', msg: '필수 값이 누락되었습니다.' });
  }
  const comment: Comment = {
    id: commentSeq++,
    author: author_give,
    text: text_give
  };
  post.comments.push(comment);
  return res.json({ result: 'success', comment });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
