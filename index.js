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

app.get('/api/users', async (req, res) => {
  const user = await User.find({}).select('_id username')
  if (!user){
    res.send("no users")
  } else {
    res.json(user)
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
  const { from, to, limit } = req.query;
  const { _id } = req.params;

  try {
    const user = await User.findById(_id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const filter = { user_id: _id };
    if (from || to) {
      filter.date = {};
      if (from) filter.date.$gte = new Date(from);
      if (to) filter.date.$lte = new Date(to);
    }

    let exercisesQuery = Excersice.find(filter).limit(parseInt(limit) || 0);

    const exercises = await exercisesQuery.exec();

    const formattedExercises = exercises.map(exercise => ({
      description: exercise.description,
      duration: exercise.duration,
      date: exercise.date.toDateString()
    }));

    res.json({
      _id: user._id,
      username: user.username,
      count: formattedExercises.length,
      log: formattedExercises
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
