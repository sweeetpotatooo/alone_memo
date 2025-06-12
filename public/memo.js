$(document).ready(function(){
  loadMemos();
});

// 1) 메모 가져오기 (GET /memo)
function loadMemos(){
  $.ajax({
    type: "GET",
    url: "/memo",
    data: {},
    success: function(response){
      if(response['result'] === 'success'){
        let memos = response['memos'];
        $("#card-list").empty();
        memos.forEach(function(memo){
          makeMemoCard(memo._id, memo.title, memo.content, memo.likes);
        });
        resortCards();
      } else {
        alert("메모를 불러올 수 없습니다.");
      }
    }
  });
}

// 2) 메모 등록 (POST /memo)
function postMemo(){
  let title = $("#memo-title").val().trim();
  let content = $("#memo-content").val().trim();

  if(!title || !content) {
    alert("제목과 내용을 모두 입력하세요!");
    return;
  }

  $.ajax({
    type: "POST",
    url: "/memo",
    data: {
      title_give: title,
      content_give: content
    },
    success: function(response){
      if(response['result'] === 'success'){
        alert(response['msg']);
        $("#memo-title").val("");
        $("#memo-content").val("");
        loadMemos();
      } else {
        alert("메모 저장에 실패했습니다!");
      }
    }
  });
}

// 3) 카드 HTML 생성
function makeMemoCard(id, title, content, likes){
  let tempHtml = `
    <div class="card" data-id="${id}" data-likes="${likes}">
      <div class="card-body">
        <h5 class="card-title">${title}</h5>
        <p class="card-text">${content}</p>
        <p class="card-likes">${likes}</p>
        <button class="btn btn-edit edit-button" onclick="editMemo(this)">수정</button>
        <button class="btn btn-danger delete-button" onclick="deleteMemo(this)">삭제</button>
        <a href="#" class="link-like" onclick="likeMemo(this)">
          좋아요!
          <i class="fas fa-thumbs-up"></i>
        </a>
      </div>
    </div>
  `;
  $("#card-list").append(tempHtml);
}

// 4) 좋아요 클릭
function likeMemo(elem){
  let card = $(elem).closest(".card");
  let memo_id = card.attr("data-id");

  $.ajax({
    type: "POST",
    url: "/memo/like",
    data: {
      id_give: memo_id
    },
    success: function(response){
      if(response['result'] === 'success'){
        let newLikes = response['new_likes'];
        card.attr("data-likes", newLikes);
        card.find(".card-likes").text(newLikes);
        resortCards();
      } else {
        alert("좋아요 처리 실패!");
      }
    }
  });
}

// 5) 좋아요 내림차순 정렬
function resortCards(){
  let cards = $("#card-list .card").get();
  cards.sort(function(a, b){
    let likesA = parseInt($(a).attr("data-likes"));
    let likesB = parseInt($(b).attr("data-likes"));
    return likesB - likesA;
  });
  $("#card-list").html(cards);
}

// 6) 메모 수정
function editMemo(elem){
  let card = $(elem).closest(".card");
  let currentTitle = card.find(".card-title").text();
  let currentText  = card.find(".card-text").text();

  let editHtml = `
    <div>
      <input type="text" class="form-control new-title mb-2" value="${currentTitle}" placeholder="새 제목 입력">
      <textarea class="form-control new-text mb-2" rows="2" placeholder="새 내용 입력">${currentText}</textarea>
      <button class="btn btn-success save-button" onclick="saveMemo(this)">저장</button>
    </div>
  `;
  card.find(".card-body").html(editHtml);
}

// 7) 수정내용 서버로 전송
function saveMemo(elem){
  let card = $(elem).closest(".card");
  let memo_id = card.attr("data-id");

  let newTitle = card.find(".new-title").val().trim();
  let newText  = card.find(".new-text").val().trim();

  if(!newTitle || !newText){
    alert("제목과 내용을 모두 입력해주세요!");
    return;
  }

  $.ajax({
    type: "POST",
    url: "/memo/edit",
    data: {
      id_give: memo_id,
      title_give: newTitle,
      content_give: newText
    },
    success: function(response){
      if(response['result'] === 'success'){
        loadMemos();
      } else {
        alert("수정에 실패했습니다!");
      }
    }
  });
}

// 8) 메모 삭제
function deleteMemo(elem){
  let card = $(elem).closest(".card");
  let memo_id = card.attr("data-id");

  if(!confirm("정말 이 메모를 삭제할까요?")) {
    return;
  }

  $.ajax({
    type: "POST",
    url: "/memo/delete",
    data: {
      id_give: memo_id
    },
    success: function(response){
      if(response['result'] === 'success'){
        loadMemos();
      } else {
        alert("메모 삭제 실패!");
      }
    }
  });
}
