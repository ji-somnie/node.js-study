const mysql = require('mysql2')

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Thalswl10!',
    database: 'practice'
  })

const express = require('express');
var bodyParser = require('body-parser');
var session = require('express-session');

const app = express();
const port = 3000;

app.set('view engine', 'ejs')
app.set('views','./views')

app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(__dirname+'/public'));
//세션 사용
app.use(session({secret: 'ming', cookie: {maxAge: 60000}, resave: true, saveUninitialized:true}))
app.use((req,res, next) => {

    res.locals.user_id="";
    res.locals.name="";

    if(req.session.member){
        //모든 템플릿에서 res의 locals 변수에 session에 있는 유저의 값으로 적용시킴
        res.locals.user_id = req.session.member.user_id
        res.locals.name=req.session.member.name
    }
    next() //다음 구문 실행
})


// routing
app.get('/', (req, res) => {

    console.log(req.session.member);

    res.render('index.ejs'); // ./views/index.ejs
});

app.get('/profile', (req, res) => {
    res.render('profile.ejs'); // ./views/profile.ejs
});

app.get('/map', (req, res) => {
    res.render('map.ejs'); // ./views/map.ejs
});

app.get('/contact', (req, res) => {
    res.render('contact.ejs'); // ./views/contact.ejs
});

app.post('/contactProc', (req, res) => {
    const name = req.body.name;
    const phone = req.body.phone;
    const email = req.body.email;
    const memo = req.body.memo;

    var sql = ` insert into contact(name, phone, email, memo, regDate) values (?,?,?,?, now() )`

    var values = [name, phone,email,memo];

    connection.query(sql, values, function(err, result){
        if(err) throw err;
        console.log('자료 1개가 삽입하였습니다.');
        res.send("<script> alert('문의사항이 등록되었습니다.'); location.href='/'; </script>")
    })

});

// 문의내용 삭제
app.get('/contactDelete', (req, res) => {
    var idx = req.query.idx
    var sql = `delete from contact where idx ='${idx}'`

    connection.query(sql, function(err, result){
        if(err) throw err;
        res.send("<script> alert('삭제되었습니다.'); location.href='/contactList'; </script>")
    })});

// 문의한 내용 나만 보기, 남들은 못 봄
app.get('/contactList', (req, res)=>{
    var sql =  `select * from contact`
    connection.query(sql, function(err, results, fields){
        if(err) throw err;
        //이렇게 하면 터미널 상에서만 console.log(results);
        res.render('contactList', {lists:results})//lists로 results의 값을 전달
    })
})


//로그인 세션 구현
app.get('/login', (req, res) => {
    res.render('login.ejs'); 
});

app.post('/loginProc', (req, res) => {
    const user_id = req.body.user_id;
    const pw = req.body.pw;

    var sql = ` select * from member where user_id =? and pw =?`

    var values = [user_id, pw];

    connection.query(sql, values, function(err, result){
        if(err) throw err;
        
        //해당 값이 있는지 여부
        if(result.length==0){
            res.send("<script> alert('존재하지 않는 아이디입니다..'); location.href='/login'; </script>")
        } 
        else{ //세션을 이용한 로그인 처리
            console.log(result[0]);

            req.session.member = result[0]
            //res.send(result);
            res.send("<script> alert('로그인되었습니다.'); location.href='/'; </script>")

        }
    })

});

//로그아웃
app.get('/logout', (req, res) => {
    req.session.member = null;
    res.send("<script> alert('로그아웃 되었습니다.'); location.href='/'; </script>")

});


// 서버 열기
app.listen(port,() => {
    console.log(`Example app listening on port ${port}`);
});
