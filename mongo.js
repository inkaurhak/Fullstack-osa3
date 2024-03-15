const { ConnectionClosedEvent } = require('mongodb')
const mongoose = require('mongoose')

if (process.argv.length<3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2]

const url =
  `mongodb+srv://fullstack3:${password}@cluster1.mj0gldl.mongodb.net/puhelinluetteloApp?retryWrites=true&w=majority&appName=puhelinluettelo`

mongoose.set('strictQuery', false)
mongoose.connect(url)

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
  id: Number,
})

const Person = mongoose.model('Person', personSchema)

/* Tällä sais jotenkin id:n
Person.estimatedDocumentCount()
    .then(docCount => {
        id = docCount
    })
*/

let i = 0
let newname = ""
let newnumber = ""

process.argv.forEach((val, index) => {
    i = index
    if (index == 3) {
        newname = val
    }
    if (index == 4) {
        newnumber = val
    }
  })

if (i<3) {
    Person.find({}).then(result => {
        console.log('phonebook:')
        result.forEach(person => {
          console.log(person.name, person.number)
        })
        mongoose.connection.close()
      })
} else {
    const person = new Person({
        name: newname,
        number: newnumber,
        id: 0,
    })
    
    person.save().then(result => {
        console.log(`added ${result.name} number ${result.number} to phonebook`)
        mongoose.connection.close()
    })

}
