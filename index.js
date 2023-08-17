require('dotenv').config()
const express = require('express') //
const app = express() //
const morgan = require('morgan') //
const cors = require('cors')
app.use(express.json())
app.use(cors())
app.use(express.static('build'))

const Person = require('./models/person')

morgan.token('body', function (req, res){
  return `${JSON.stringify(req.body)}` })

app.use(morgan(':method :url :status :response-time :req[header] :body'))

app.get('/api/persons', (req, res) => {
  Person.find({})
    .then(persons => {
      res.json(persons.map(person => person.toJSON()))
    })
})

app.post('/api/persons', (request, response, next) => {
  const body = request.body
  console.log(body) //delete this

  if (body.name === undefined) {
    return response.status(400).json({
      error: 'name field is missing'
    })
  }
  if (body.number === undefined) {
    return response.status(400).json({
      error: 'number field is missing'
    })
  }

  const person = new Person(  {
    name: body.name,
    number: body.number
  })

  person
    .save()
    .then(savedPerson => {
      console.log('savedPerson', savedPerson)
      response.json(savedPerson)
    })
    .catch(error => next(error))
})

app.get('/info', (request, response, next ) => {
  const date = new Date()
  Person
    .countDocuments({})
    .then(total => {
      let info = `<p>This phonebook has info for ${total} people</p>
                  <p>${date}</p>`
      response.send(info)
    })
    .catch(error => next(error))
})

app.get('/api/persons/:id', (request, response, next ) => {
  Person.findById(request.params.id)
    .then(person => {
      if (person){
        response.json(person)
      }
      else{
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  const { name, number } = request.body
  Person
    .findByIdAndUpdate(request.params.id, { name, number }, {
      new: true,
      runValidators: true,
      context: 'query' })
    .then(updatedPerson => {
      response.json(updatedPerson)
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

const errorHandler = (error, request, response, next) => {
  console.error(error.message)
  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'invalid id' })
  }
  else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }
  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})