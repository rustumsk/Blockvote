import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { errorHandler } from './middleware/errorHandler'
import authRoutes from './modules/auth/auth.routes'

dotenv.config()

const app = express()

app.use(cors({ origin: true, credentials: true }))
app.use(express.json())

app.use('/api/auth', authRoutes)

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'Blockvote API running' })
})

app.use(errorHandler)

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
