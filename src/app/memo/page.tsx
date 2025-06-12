import Head from "next/head";
import Script from "next/script";

export default function MemoPage() {
  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />
        <title>크래프톤 정글 | 나홀로 메모장</title>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap@4.6.0/dist/css/bootstrap.min.css"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css"
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
        <link
          href="https://fonts.googleapis.com/css?family=Stylish&display=swap"
          rel="stylesheet"
        />
        <link rel="stylesheet" href="/memo.css" />
      </Head>
      <div className="wrap">
        <div className="jumbotron">
          <h1 className="display-4">
            나홀로 메모장 <span className="ver-badge">ver2.0</span>
          </h1>
          <hr className="my-4" />
          <div id="post-box" className="form-post">
            <div>
              <div className="form-group">
                <input
                  id="memo-title"
                  className="form-control"
                  placeholder="제목을 입력하세요"
                />
              </div>
              <div className="form-group">
                <textarea
                  id="memo-content"
                  className="form-control"
                  rows={3}
                  placeholder="내용을 입력하세요"
                ></textarea>
              </div>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => (window as any).postMemo()}
              >
                저장하기
              </button>
            </div>
          </div>
        </div>
        <div id="card-list" className="card-columns"></div>
      </div>
      <Script src="https://code.jquery.com/jquery-3.5.1.min.js" strategy="afterInteractive" />
      <Script
        src="https://cdn.jsdelivr.net/npm/popper.js@1.16.1/dist/umd/popper.min.js"
        strategy="afterInteractive"
        crossOrigin="anonymous"
      />
      <Script
        src="https://cdn.jsdelivr.net/npm/bootstrap@4.6.0/dist/js/bootstrap.min.js"
        strategy="afterInteractive"
        crossOrigin="anonymous"
      />
      <Script src="/memo.js" strategy="afterInteractive" />
    </>
  );
}

