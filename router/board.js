// 라이브러리 불러오기
const express = require('express')
const mysql = require('mysql2/promise')

// express 라우터
const router = express.Router()

// 데이터베이스 커넥션풀을 생성
// 커넥션풀: 커넥션을 위한 정보 저장
// 커넥션(connection): 데이터베이스와의 연결
// 커넥션을 하는 이유: 데이터베이스를 사용(읽기, 쓰기, 수정, 삭제 등)하기 위함
// 'process.env'?: 아까 .env 파일 불러온 결과
const connectPool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    database: process.env.DB_SCHEMA,
    password: process.env.DB_PASSWORD,
});


// 전체 글 목록
// board 라우터가 '/board'에 등록되었기 때문에, '/board/'(또는 '/board') 로 접근해야 됨
router.get('/', async (req, res) => {
    // DB 커넥션 생성
    const conn = await connectPool.getConnection()

    // DB에서 board 테이블 조회
    // SQL: "SELECT (칼럼1, 칼럼2) FROM '테이블' 로 작성하여 읽기 가능"
    const result = await conn.query('SELECT * FROM `board`')

    // 만약 DB 결과를 직접 보고 싶다면 아래 코드를 주석 해체하고 실행
    //console.log(result[0])


    // DB 작업이 끝나면 커넥션을 해제해야 함.
    // 해제를 하지 않고 계속 사용한 경우 최대 커넥션 제한에 걸림
    conn.release()

    // DB 결과를 클라이언트에게 전송.
    // res.send() 등으로 클라이언트에게 응답을 한 경우 다음 미들웨어를 처리하지 않음
    res.send(result[0])
})

// 특정 아이디 글 정보
// ':id'의 의미: /board/1 이렇게 접근했을 때 '1'이 자동으로 req.params.id로 저장됨
router.get('/:id', async (req, res) => {
    // :id로 받은 글 아이디를 'id'변수에 저장
    const id = req.params.id

    // DB 커넥션 생성
    const conn = await connectPool.getConnection()

    // DB에서 특정 row 조회
    // 일반적인 조회 명령어 뒤에 "WHERE 조건"을 추가해서 해당 조건에 맞는 row만 조회 가능
    // "?"와 뒤의 배열의 의미: 만약 ? 자리에 변수를 그대로 넣으면 SQL Injection이라는 해킹을 받을 수 있음
    // 클라이언트에서 받는 신뢰할 수 없는 정보는 무조건 ?로 채우고 뒤에 리스트로 담기
    // *혹시 진로가 보안 쪽이라면 SQL Injection에 대해 더 알아보면 좋습니다. 기본적이면서 굉장히 치명적인 해킹 기법이에요.
    const result = await conn.query('SELECT * FROM `board` WHERE id = ?', [ id ])

    // DB 커넥션 해제
    conn.release()

    // DB 결과를 클라이언트에게 응답
    res.send(result[0])
})

// 글 작성
// HTTP Method가 post이면서 '/board'로 요청한 요청을 처리
// HTTP Method란? Search HTTP Method
router.post('/', async (req, res) => {
    // body로 title과 content 받기
    // 아래와 같이 변수를 저장하는 방법 -> Search 구조 분해 할당
    const { title, content } = req.body

    // 생성 시간 = 현재 시간
    const createdAt = new Date()

    // 수정 시간 = 현재 시간
    const updatedAt = new Date()

    // 만약 title이나 content가 없다면
    if (!title || !content) {

        // 400(Bad Request) 응답 코드와 함께 클라이언트에게 응답
        res.status(400).send({
            message: "정보가 부족합니다."
        })
        return
    }

    // 커넥션 생성
    const conn = await connectPool.getConnection()

    // 새로운 글 생성
    const result = await conn.query('INSERT INTO `board` (title, content, createdAt, updatedAt) value (?, ?, ?, ?)', [ title, content, createdAt, updatedAt ])
    
    // DB 커넥션 해제
    conn.release()

    // 새로운 글의 아이디 전송
    res.send({id: result[0].insertId})
})

// 글 삭제
// HTTP Method가 delete이면서 '/:id'로 요청한 요청을 처리
router.delete('/:id', async (req, res) => {
    // DB 커넥션 생성
    const conn = await connectPool.getConnection()

    // 글 삭제
    // 만약 해당하는 글이 없더라도 오류가 발생하지 않음.
    // 만약 삭제가 된건지 무시된건지 알고 싶다면 글 생성 코드처럼 result로 쿼리 결과를 저장한 다음 결과를 분석해보면 됨. ( 직접 해보세요 :) )
    // - 또는 먼저 해당 글을 조회한 다음 글이 있는지 보고 아래 코드를 처리해도 됨. 방법은 진짜 많음
    await conn.query('DELETE FROM `board` WHERE id = ?', [ req.params.id ])

    // DB 커넥션 해체
    conn.release()

    // 빈 응답 전송: 딱히 전송할 데이터가 없으면 그냥 빈 응답 보내도 됨.
    res.send()
})

// 글 수정
// HTTP Method가 patch '/:id'로 요청한 요청을 처리
router.patch('/:id', async (req,res) => {
    // :id로 받은 글 아이디를 'id'변수에 저장
    const id = req.params.id

    // body에서 title과 content
    const { title, content } = req.body

    // 수정한 시간 = 현재 시간
    const updatedAt = new Date()

    // 데이터베이스 커넥션 생성
    const conn = await connectPool.getConnection()

    // 해당 글 수정
    await conn.query('UPDATE `board` SET title = ?, content = ?, updatedAt = ? WHERE id = ?', [ title, content, updatedAt, id ])
    
    // 커넥션 해제
    conn.release()

    // 빈 응답 전송
    res.send()
})

module.exports = router