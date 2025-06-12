import Head from "next/head";
import Script from "next/script";

export default function LoginPage() {
  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>로그인</title>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap@4.6.0/dist/css/bootstrap.min.css"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css?family=Stylish&display=swap"
          rel="stylesheet"
        />
        <link rel="stylesheet" href="/login.css" />
      </Head>
      <div className="login-container">
        <h1 className="text-center mb-4">로그인</h1>
        <div className="form-group">
          <input id="login-id" className="form-control" placeholder="아이디" />
        </div>
        <div className="form-group">
          <input
            id="login-pw"
            type="password"
            className="form-control"
            placeholder="비밀번호"
          />
        </div>
        <button type="button" className="btn btn-primary btn-block" onClick={() => (window as any).login()}>
          로그인
        </button>
        <p className="text-center mt-3">
          <a href="/signup">회원가입</a>
        </p>
      </div>
      <Script src="https://code.jquery.com/jquery-3.5.1.min.js" strategy="afterInteractive" />
      <Script src="/login.js" strategy="afterInteractive" />
    </>
  );
}
