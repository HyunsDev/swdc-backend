const express = require('express')
const createError = require('http-errors')
const logger = require('morgan')
const cors = require('cors')
const path = require('path')
require('dotenv').config()

const boardRouter = require('./router/board')
const app = express()

app.use(cors())
app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/board', boardRouter)

app.use((req, res, next) => {
    next(createError(404))
})

app.use((err, req, res, next) => {
    res.status(err.status)
    res.send(err)
})

app.listen(3000, () => {
    console.log('Server Started!')
})