import { Hono } from 'hono'
import { userRouter } from './routes/userRouter'
import { cors }  from 'hono/cors'

const app = new Hono()

app.use('/*', cors())
app.route('/api/v1/user', userRouter)



export default app
