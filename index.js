require('dotenv').config()
const express = require('express')
const app = express()
const routes = require('./src/routes')

app.use('/api', routes)

const { PORT } = process.env
app.listen(PORT, console.log(`Server running on port ${PORT}`))
