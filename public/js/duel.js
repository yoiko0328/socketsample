// 通信先のサーバを指定する
var socket = io();

/* フィールド変数 */
// playerとroom用の変数
var player1 = "";
var player2 = "";
var room = "";


/* 勝負開始前の処理 */
// ページロード時にsocketでサーバからログインユーザを取得（セッションに保存してあれば正しくユーザ名が取得できる）
window.onload = () => socket.emit('checkUserName');

// 勝負開始
socket.on('start', (player1,player2,room) => {
    this.player1 = player1;
    this.player2 = player2;
    this.room = room;
    $('table#resultTable tbody tr td#playerName1').text(player1);
    $('table#resultTable tbody tr td#playerName2').text(player2);
    $("#loading").remove();
    $('#result').remove('.result');
});

// 結果テーブル表示
socket.on('showResult',(win,def,draw,duel) =>{
    $('table#resultTable tbody tr td#win').text(win);
    $('table#resultTable tbody tr td#def').text(def);
    $('table#resultTable tbody tr td#draw').text(draw);
    $('table#resultTable tbody tr td#duel').text(duel);
});

// 結果を全画面表示
socket.on('showDuelResult', msg =>{
    
    var parentDiv = document.createElement('div');
    var p = document.createElement('p');
    var childDiv = document.createElement('div');
    var button = document.createElement('button');
    parentDiv.className = "result";
    parentDiv.id = ("result");
    
    if(typeof msg.split('|')[1] === 'undefined'){
        msg = msg.split('|')[0];
    }else{
        msg = msg.split('|')[0]+"\r\n"+msg.split('|')[1];
    }
    childDiv.innerText = msg;
    childDiv.className ="resultMsg";
    childDiv.id = "resultMsg";
    button.className ="close";
    button.innerText = "次の勝負へ";

    parentDiv.appendChild(childDiv);
    parentDiv.appendChild(p);
    parentDiv.appendChild(button);

    document.body.appendChild(parentDiv);
});

/* 勝負開始後の処理 */
//手をクリックしたときに黒枠を付ける処理
$(document).on('click', '.hand', function(){
    $('div').removeClass('selectedHand');
    var selectedHand = $(this).addClass('selectedHand');
});

//選択ボタンを押したときの処理
$(document).on('click', '.selectButton', function(){
    var item = document.getElementsByClassName('selectedHand');
    socket.emit('duel', item[0].id, room);
});

// 次へボタンを押したときの処理
$(document).on('click', '.close', function(){
    $('div').remove('.result');
    $('div').removeClass('selectedHand');
    socket.emit('showResult',room);
});   


