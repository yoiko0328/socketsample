const express = require('express');
const router = express.Router();
var title;

// GETリクエスト
router.get('/', function(req, res) {
    title = 'Duel';
    // セッションに名前が保存されていればDuelページへ遷移
    if (req.session.userName) {
        title = title + '(' + req.session.userName+ ')';
        res.render('.././views/duel.ejs', { title: title });
    }else{
        title = 'Login'
        res.redirect('http://localhost:3030/');
    }
});

// POSTリクエスト
router.post('/', function(req, res) {
    title = 'Duel';
    req.session.userName = req.body.userName;
    title = title + '(' + req.session.userName+ ')';
    res.render('.././views/duel.ejs', { title: title });
});

module.exports = router;