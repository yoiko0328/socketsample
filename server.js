// モジュールの読込
const express = require('express');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const app = express();
const http = require('http').Server(app);
const PORT = 3030;
const io = require('socket.io')(http);
const sharedsession = require("express-socket.io-session");
const session = require("express-session")({
    secret: "my-secret",
    resave: true,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        secure: false,
        maxage: 1000 * 60 * 30
    }
});

// expressのテンプレートエンジンにejsをセット
app.set('ejs', ejs.renderFile);

// ミドルウェア関数使用宣言
app.use(session);
app.use(bodyParser.urlencoded({ extended: true }));

// publicフォルダの公開
app.use(express.static('public'));

// expressのsessionとwebsocketのセッションを共有
io.use(sharedsession(session));

// router使用宣言（app.use系の最後に書く必要がある 
// ※socket.ioとのsession共有宣言後でないとindex.jsのsessionチェックでエラーになる）
// '/battle'と書くと、battle.jsのURLルーティングには'/'だけで、'/battle'と認識される
app.use('/', require('./routes/index'));
app.use('/duel', require('./routes/duel'));

// ポートのlisten開始
http.listen(PORT, () => {
    console.log('server listening. Port:' + PORT);
});

/* websocketの処理 */
var player1 = "";
var player2 = "";
var room = "";
var selectedHand_1 = "";
var selectedHand_2 = "";
var win = 0;
var def = 0;
var draw = 0;
var duel = 0;

io.on('connection', socket => {
    /* duelページの処理 */
    // プレイヤー名のSet
    socket.on('checkUserName', () => {
        if (player1 === socket.handshake.session.userName) {
            socket.join(room);
            if(player2){
                io.to(room).emit('start', player1, player2, room);
                io.to(room).emit('showResult', win, def, draw, duel);
            }
        }
        else if (player2 === socket.handshake.session.userName) {
            socket.join(room);
            io.to(room).emit('start', player1, player2, room);
            io.to(room).emit('showResult', win, def, draw, duel);
        }
        else if (!player1) {
            room = Math.floor(Math.random() * Math.floor(100));;
            socket.join(room);
            player1 = socket.handshake.session.userName;
            console.log("socket.handshake.session.userName:"+socket.handshake.session.userName);
        }
        else if (!player2) {
            socket.join(room);
            player2 = socket.handshake.session.userName;
            io.to(room).emit('start', player1, player2, room);
            io.to(room).emit('showResult', win, def, draw, duel);
        }
        else {
            console.log('3人目がログイン');
        }
    });

    // Hand選択後の処理
    socket.on('duel', (selectedHand, room) => {
        
        // プレイヤーが選択したHandを設定
        if (socket.handshake.session.userName === player1) {
            selectedHand_1 = selectedHand;
        }
        else if (socket.handshake.session.userName === player2) {
            selectedHand_2 = selectedHand;
        }
        else {
            console.log('3人目のHand');
        }

        // 勝負の判定
        if (selectedHand_1 && selectedHand_2) {
            if (selectedHand_1 === 'rock') {
                switch (selectedHand_2) {
                    case 'rock':
                        io.to(room).emit('showDuelResult', "あいこ");
                        duel++;
                        draw++;
                        selectedHand_1 = "";
                        selectedHand_2 = "";
                        break;
                    case 'paper':
                        io.to(room).emit('showDuelResult', player1 + "のまけ" + "|" + player2 + "のかち");
                        duel++;
                        def++;
                        selectedHand_1 = "";
                        selectedHand_2 = "";
                        break;
                    case 'scissors':
                        io.to(room).emit('showDuelResult', player1 + "のかち" + "|" + player2 + "のまけ");
                        duel++;
                        win++;
                        selectedHand_1 = "";
                        selectedHand_2 = "";
                        break;
                }
            }
            if (selectedHand_1 === 'paper') {
                switch (selectedHand_2) {
                    case 'rock':
                        io.to(room).emit('showDuelResult', player1 + "のかち" + "|" + player2 + "のまけ");
                        duel++;
                        win++;
                        selectedHand_1 = "";
                        selectedHand_2 = "";
                        break;
                    case 'paper':
                        io.to(room).emit('showDuelResult', "あいこ");
                        duel++;
                        draw++;
                        selectedHand_1 = "";
                        selectedHand_2 = "";
                        break;
                    case 'scissors':
                        io.to(room).emit('showDuelResult', player1 + "のかち" + "|" + player2 + "のまけ");
                        duel++;
                        def++;
                        selectedHand_1 = "";
                        selectedHand_2 = "";
                        break;
                }
            }
            if (selectedHand_1 === 'scissors') {
                switch (selectedHand_2) {
                    case 'rock':
                        io.to(room).emit('showDuelResult', player1 + "まけ" + "|" + player2 + "のかち");
                        duel++;
                        def++;
                        selectedHand_1 = "";
                        selectedHand_2 = "";
                        break;
                    case 'paper':
                        io.to(room).emit('showDuelResult', player1 + "のかち" + "|" + player2 + "のまけ");
                        duel++;
                        win++;
                        selectedHand_1 = "";
                        selectedHand_2 = "";
                        break;
                    case 'scissors':
                        io.to(room).emit('showDuelResult', "あいこ");
                        duel++;
                        draw++;
                        selectedHand_1 = "";
                        selectedHand_2 = "";
                        break;
                }
            }
        }
    });

    // 結果の表示
    socket.on('showResult', room => {
        io.to(room).emit('showResult', win, def, draw, duel);
    });

});