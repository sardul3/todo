const express = require('express');
const bodyParser = require('body-parser');
const _ = require('lodash');

const {User} = require('./server/models/user');
const {Todo} = require('./server/models/todo');
const {mongoose} = require('./server/db/mongoose');

const {ObjectID} = require('mongodb');

const {authenticate} = require('./server/middleware/authenticate');

var app = express();
app.use(bodyParser.json());

app.post("/todos", authenticate, (req, res)=>{
  var todo = new Todo({
    text: req.body.text,
    _creator: req.user._id
  });
  todo.save().then((result)=>{
    res.send(result);
  },
  (err)=>{
    res.status(400).send(err);
});
});

app.get("/todos", authenticate, (req, res)=>{
  Todo.find(
    {_creator: req.user._id}).then((result)=>{
    res.send({result});
  },(error)=>{
    console.log(error);
  });
});

app.get('/todos/:id', authenticate, (req,res)=>{
  var id = req.params.id;
  if(! ObjectID.isValid(id)){
    return res.status(404).send();
  }

  Todo.findOne({
      _id: id,
    _creator: req.user._id
  }).then((todo)=>{
    if(! todo){
      return res.status(404).send();
    }
    res.send({todo});
  },
   ()=>{
  res.status(400).send();
});

});

app.delete("/todos/:id", authenticate, (req, res)=>{
  var id = req.params.id;
  if(!ObjectID.isValid(id)){
    return res.status(404).send();
  }
  Todo.findOneAndRemove({
    _id:id,
    _creator: req.user._id
   }).then((todo)=>{
    if(!todo){
      res.status(404).send();
    }
    console.log(todo);
    res.status(200).send(todo);
  },()=>{
    res.status(400).send();
  });
});

app.patch('/todos/:id', authenticate, (req, res)=>{
  var id = req.params.id;
  var body = _.pick(req.body, ["text", "completed"]);
    if(!ObjectID.isValid(id)){
      return res.status(404).send();
    }
    if(_.isBoolean(body.completed) && body.completed){
      body.completedAt = new Date().getTime();
    }
    else{
      body.completed = false;
      body.completedBy = null;
    }

    Todo.findOneAndUpdate({_id:id, _creator: req.user._id}, {$set: body}, {new: true}).then((todo)=>{
      if(!todo){
        res.status(404).send();
      }
        res.send({todo});
    }).catch((e)=>{
      res.status(400).send();
    });

});



app.get('/users/me', authenticate, (req, res)=>{
  res.send(req.user);
});

app.post('/users', (req,res)=>{
  var body = _.pick(req.body, ["email", "password"]);
  var user = new User(body);
  user.save().then(()=>{
    return user.generateAuthToken();
  }).then((token)=>{
      res.header('x-auth', token).send(user);
  }).catch((e)=>{
    res.status(400).send(e);
  });
});

app.post('/users/login', (req,res)=>{
  var body = _.pick(req.body, ["email", "password"]);

  User.findByCredentials(body.email, body.password).then((user)=>{
    return user.generateAuthToken().then((token)=>{
      res.header('x-auth', token).send(user);
    });
  }).catch((e)=>{
      res.status(400).send(e);
  });
});

app.delete("/users/me/token", authenticate, (req,res)=>{
   req.user.deleteToken(req.token).then(()=>{
    res.status(200).send();
  }, ()=>{
    res.status(400).send();
  });
});


app.listen(process.env.PORT || 3000, ()=>{
  console.log(`Port is up and running!`);
})
