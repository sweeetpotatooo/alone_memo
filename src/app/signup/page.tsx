import Head from "next/head";
import Script from "next/script";

export default function SignupPage() {
  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>회원가입</title>
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
        <h1 className="text-center mb-4">회원가입</h1>
        <div className="form-group">
          <input id="signup-id" className="form-control" placeholder="아이디" />
        </div>
        <div className="form-group">
          <input
            id="signup-pw"
            type="password"
            className="form-control"
            placeholder="비밀번호"
          />
        </div>
        <div className="form-group">
          <input
            id="signup-pw2"
            type="password"
            className="form-control"
            placeholder="비밀번호 확인"
          />
        </div>
        <button
          type="button"
          className="btn btn-primary btn-block"
          onClick={() => (window as any).signup()}
        >
          회원가입
        </button>
        <p className="text-center mt-3">
          <a href="/login">로그인</a>
        </p>
      </div>
      <Script src="https://code.jquery.com/jquery-3.5.1.min.js" strategy="afterInteractive" />
      <Script src="/login.js" strategy="afterInteractive" />
    </>
  );
}
