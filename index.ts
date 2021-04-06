import express from 'express'
import routes from './routes'
import { poll } from './polling'

const app = express()
const port = 3000

app.use(routes)

// Error handler
app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error(err.stack)
    res.status(500).json({
      message: err.message,
      stack: err.stack?.split('\n'),
    })
  }
)

poll()

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
