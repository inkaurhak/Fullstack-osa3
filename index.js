require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const app = express()

const Person = require('./models/person')

morgan.token('content-body', req => {
    return JSON.stringify(req.body)
})

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

const cors = require('cors')

app.use(express.static('dist'))
app.use(cors())
app.use(express.json())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :content-body'))

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
  }

app.get('/', (request, response) => {
    response.send('<h1>Puhelinluettelo</h1>')
})

app.get('/api/persons', (request, response) => {
    Person.find({}).then(persons => {
        response.json(persons)
    })
})

app.post('/api/persons', (request, response, next) => {
    const body = request.body
  
    const person = new Person({
        name: body.name,
        number: body.number
    })
  
    person.save().then(savedPerson => {
        response.json(savedPerson)
    })
    .catch(error => next(error))
  })
  

app.get('/api/persons/:id', (request, response, next) => {
    Person.findById(request.params.id)
      .then(person => {
        if (person) {
          response.json(person)
        } else {
          response.status(404).end()
        }
    })
    .catch(error => next(error))
  })

app.get('/info', (request, response, next) => {
    Person.estimatedDocumentCount()
    .then(docCount => {
      response.send(
        `<p>Phonebook has info for ${docCount} people</p>` + `<p>${Date()}</p>`
    )
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
    const { name, number } = request.body

    Person.findByIdAndUpdate(
      request.params.id, 
      { name, number }, 
      { new: true, runValidators: true, context: 'query' }
      )
      .then(updatedPerson => {
        response.json(updatedPerson)
      })
      .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response) => {
    Person.findByIdAndDelete(request.params.id)
    .then(result => {
      response.status(204).end()
    })
  })  

app.use(unknownEndpoint)
app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})