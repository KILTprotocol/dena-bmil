/*
 * Run the project and access the documentation at: http://localhost:3000/doc
 *
 * Use the command below to generate the documentation without starting the project:
 * $ npm start
 *
 * Use the command below to generate the documentation at project startup:
 * $ npm run start-gendoc
 */

const router = require('../routes')
const polling = require('../polling')

const swaggerUi = require('swagger-ui-express')
const YAML = require('yamljs')
const express = require('express')
const app = express()

const swaggerFile = YAML.load(__dirname + '/swagger.yml')

/* Middlewares */
app.use(express.json())
app.use(router.default)
app.use('/doc', swaggerUi.serve, swaggerUi.setup(swaggerFile))

polling.poll()

app.listen(3000, () => {
  console.log(
    'Server is running!\nAPI documentation: http://localhost:3000/doc'
  )
})
