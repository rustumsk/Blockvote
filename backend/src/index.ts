import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { errorHandler } from './middleware/errorHandler'
import authRoutes from './modules/auth/auth.routes'
import usersRoutes from './modules/users/users.routes'
import electionsRoutes from './modules/elections/elections.routes'

dotenv.config()

const app = express()

app.use(cors({ origin: true, credentials: true }))
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/users', usersRoutes)
app.use('/api/elections', electionsRoutes)

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'Blockvote API running' })
})

app.use(errorHandler)

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
