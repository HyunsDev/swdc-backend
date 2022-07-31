
// 라이브러리 불러오기
const express = require('express')
const createError = require('http-errors')
const logger = require('morgan')
const cors = require('cors')
const path = require('path')

// .env 파일 불러오기
// 불러온 .env 파일은 process.env에 자동으로 저장된다.
// 사용법 'process.env.키'
// .env 파일은 비밀번호 등 중요한 정보가 들어있기 때문에 git에 업로드 하지 않고 내 컴퓨터에만 보관한다.
// .env.example 를 복붙해서 .env 바꿔준 다음 내용을 채워보자
require('dotenv').config()

// 라우터 불러오기
const boardRouter = require('./router/board')


// 익스프레이스 앱 객체
const app = express()


/*
[ 미들웨어 ]
Express에서 각 요청은 아래 미들웨어를 한 번씩 거치게 됩니다.
*/

// CORS 방지: (Search: CORS)
app.use(cors())

// 콘솔에 접속 로그 표시 (Search: morgan)
// 'dev': 로그 레벨 ()
app.use(logger('dev'))

// Body 데이터를 string에서 json으로 변환
app.use(express.json())

// URL encode된 데이터를 원래 데이터로 변환
app.use(express.urlencoded({ extended: false }));

// public 폴더를 정적 폴더로 지정
// 정적 폴더: 폴더 안에 있는 파일을 그대로 전송
app.use(express.static(path.join(__dirname, 'public')));


// 아까전에 불러온 Board 라우터를 /board 에 등록
// 라우터도 미들웨어의 일종
// '/board'로 들어온 요청은 boardRouter로 전송됨 
app.use('/board', boardRouter)


// 위에서 요청을 처리하지 못한 경우 === 파일이 없는 경우 => 404 오류
// 404오류란?: Search HTTP 응답 코드
app.use((req, res, next) => {
    next(createError(404))
})


// Express에서 발생한 오류를 처리 (메게변수가 3개 => 일반 미들웨어, 4개 => 오류 처리 미들웨어)
app.use((err, req, res, next) => {
    res.status(err.status)
    res.send(err)
})

// 서버를 최종적으로 실행, PORT 3000번
// 서버 실행 후 http://localhost:3000 에서 접속 가능
// 포트 번호 뒤에 함수는 서버가 시작됬을 때 실행하는 함수
app.listen(3000, () => {
    console.log('Server Started!')
})