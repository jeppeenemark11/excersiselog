const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const mongoose = require('mongoose')

const { Schema } = mongoose

mongoose.connect(process.env['DB_URL'])


const UserSchema = new Schema({
  username: String,
});
const User = mongoose.model('User', UserSchema);

const ExcersiceSchema = new Schema({
user_id: {type: String, required: true},
description: String,
duration: Number,
date: Date 
})
const Excersice = mongoose.model('Exercice', ExcersiceSchema);


app.use(cors())
app.use(express.static('public'))
app.use(express.urlencoded({extended: true}));
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.get('api/users', async (req, res) => {
  const user = await User.find({}).select('_id username')
  if (!users){
    res.send("no users")
  } else {
    res.json(users)
  }
  }
)


app.post('/api/users', async (req, res) => {
const usermiddle = new User({
  username: req.body.username
})

  try {
    const user = await usermiddle.save()
    console.log(user)
    res.json(user)
  } catch (err) {
    console.log(err)
  }
})

app.post('/api/users/:_id/exercises', async (req, res) => {
const id = req.params._id
const {description, duration, date} = req.body 

  try {
    const user = await User.findById(id)
    if (!user) {
      res.send("no user found")
    } else {
      const exc = new Excersice({
        user_id: user._id,
        description,
        duration,
        date: date ? new Date(date) : new Date()
      })
      const Exccc = await exc.save()
      res.json({
        _id: user._id,
        username: user.username,
        description: Exccc.description,
        duration: Exccc.duration,
        date: Exccc.date.toDateString()
      })
    }
  } catch (err) {
    console.log(err)
    res.send("error")
  }
  
})

app.get('/api/users/:_id/logs', async (req, res) => {
const {from, to, limit} = req.query;
const id = req.params._id;
const user = await User.findById(id);

  if (!users){
    res.send("no users")
    return
  } 
  let Dateee = {}
  if (from) {
    Dateee["$gte"] = new Date(from)
  }
  if (to){
    Dateee["$lte"] = new Date(to)
  } 
  let filter = {user_id: id}

  if (from || to) {
    filter.date = Dateee
  }
  const log = await Excersice.find(filter).limit(+limit ?? 100)

  const reallog = log.map((l) => ({
    description: l.description,
    duration: l.duration,
    date: l.date.toDateString()
  }))
  
  res.json({
    username: user.username,
    count: log.length,
    _id: user._id,
    reallog
    
  })
  
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
