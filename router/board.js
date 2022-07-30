const express = require('express')
const mysql = require('mysql2/promise')

const router = express.Router()

const connectPool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    database: process.env.DB_SCHEMA,
    password: process.env.DB_PASSWORD,
});


// 전체 글 목록
router.get('/', async (req, res) => {
    const conn = await connectPool.getConnection()
    const result = await conn.query('SELECT * FROM `board`')
    conn.release()
    res.send(result[0])
})

// 특정 아이디 글 정보
router.get('/:id', async (req, res) => {
    const id = req.params.id
    const conn = await connectPool.getConnection()
    const result = await conn.query('SELECT * FROM `board` WHERE id = ?', [ id ])
    conn.release()
    res.send(result[0])
})

// 글 작성
router.post('/', async (req, res) => {
    const { title, content } = req.body
    const createdAt = new Date()
    const updatedAt = new Date()

    if (!title || !content) {
        res.status(400).send({
            message: "정보가 부족합니다."
        })
    }

    const conn = await connectPool.getConnection()
    const result = await conn.query('INSERT INTO `board` (title, content, createdAt, updatedAt) value (?, ?, ?, ?)', [ title, content, createdAt, updatedAt ])
    
    conn.release()
    res.send({id: result[0].insertId})
})

// 글 삭제
router.delete('/:id', async (req, res) => {
    const conn = await connectPool.getConnection()
    await conn.query('DELETE FROM `board` WHERE id = ?', [ req.params.id ])
    conn.release()
    res.send()
})

// 글 수정
router.patch('/:id', async (req,res) => {
    const id = req.params.id
    const { title, content } = req.body
    const updatedAt = new Date()
    const conn = await connectPool.getConnection()
    await conn.query('UPDATE `board` SET title = ?, content = ?, updatedAt = ? WHERE id = ?', [ title, content, updatedAt, id ])
    conn.release()
    res.send()
})

module.exports = router