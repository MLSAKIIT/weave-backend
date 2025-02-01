import { Hono } from 'hono'
import { userRouter } from './routes/userRouter'
import { cors } from 'hono/cors'
import authRouter from './routes/authRouter'

const app = new Hono()

app.use('/*', cors())
app.route('/api/v1/user', userRouter)

app.route('/api/v1/auth', authRouter)

export default app
