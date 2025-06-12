$(document).ready(function(){});

function login(){
  var id = $("#login-id").val().trim();
  var pw = $("#login-pw").val().trim();
  if(!id || !pw){
    alert("아이디와 비밀번호를 입력하세요!");
    return;
  }
  $.ajax({
    type: "POST",
    url: "/login",
    data: { id_give: id, pw_give: pw },
    success: function(res){
      if(res['result'] === 'success'){
        alert(res['msg']);
        window.location.href = "/memo";
      }else{
        alert("로그인 실패!");
      }
    }
  });
}

function signup(){
  var id = $("#signup-id").val().trim();
  var pw = $("#signup-pw").val().trim();
  var pw2 = $("#signup-pw2").val().trim();
  if(!id || !pw || !pw2){
    alert("모든 필드를 입력하세요!");
    return;
  }
  if(pw !== pw2){
    alert("비밀번호가 일치하지 않습니다!");
    return;
  }
  $.ajax({
    type: "POST",
    url: "/signup",
    data: { id_give: id, pw_give: pw },
    success: function(res){
      if(res['result'] === 'success'){
        alert(res['msg']);
        window.location.href = "/login";
      }else{
        alert("회원가입 실패!");
      }
    }
  });
}
