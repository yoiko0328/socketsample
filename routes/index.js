const express = require('express');
const router = express.Router();
var title;

// GETリクエスト
router.get('/', function(req, res) {
    title = 'Login';
    // セッションに名前が保存されていればbattleページへ遷移
    if (req.session.userName) {
        title = 'Duel' + '(' + req.session.userName + ')';
        console.log("req.session.userName:"+req.session.userName);
        res.redirect('http://localhost:3030/duel');
    }else{
        res.render('.././views/index.ejs', { title: title });
    }
});

// POSTリクエスト
router.post('/', function (req, res) {
    title = 'Login';
    res.render('.././views/index.ejs', { title: title });
});

module.exports = router;