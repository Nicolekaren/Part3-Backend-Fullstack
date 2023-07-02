const mongoose = require('mongoose')
mongoose.set('strictQuery', false)
const url = process.env.MONGODB_URI
var uniqueValidator = require('mongoose-unique-validator')

console.log('connecting to', url)

mongoose.connect(url)
  .then(result => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connecting to MongoDB:', error.message)
  })


const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: 3,
    required: true
  },
  number: {
    type: String,
    minLength: 8,
    validate: {
      validator: function (v) {
        return /^\d{2}\d?-\d{5,}$/.test(v)
      },
      message: (props) =>
        `${props.value} is invalid. The phone number must follow the format 'xx-xxxxxx or xxx-xxxxx' and have at least 8 digits`,
    },
  }
})
personSchema.plugin(uniqueValidator)

module.exports = mongoose.model('Person', personSchema)