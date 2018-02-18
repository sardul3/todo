const express = require('express');
const bodyParser = require('body-parser');
const _ = require('lodash');

const {User} = require('./server/models/user');
const {Todo} = require('./server/models/todo');
const {mongoose} = require('./server/db/mongoose');

const {ObjectID} = require('mongodb');


var app = express();
app.use(bodyParser.json());

app.post("/todos", (req, res)=>{
  var todo = new Todo({text: req.body.text});
  todo.save().then((result)=>{
    res.send(result);
  },
  (err)=>{
    res.status(400).send(err);
});
});

app.get("/todos", (req, res)=>{
  Todo.find().then((result)=>{
    res.send({result});
  },(error)=>{
    console.log(error);
  });
});

app.get('/todos/:id', (req,res)=>{
  var id = req.params.id;
  if(! ObjectID.isValid(id)){
    return res.status(404).send();
  }
  Todo.findById(id).then((todo)=>{
    if(! todo){
      return res.status(404).send();
    }
    res.send({todo});
  },
   ()=>{
  res.status(400).send();
});

});

app.delete("/todos/:id", (req, res)=>{
  var id = req.params.id;
  if(!ObjectID.isValid(id)){
    return res.status(404).send();
  }
  Todo.findByIdAndRemove(id).then((todo)=>{
    if(!todo){
      res.status(404).send();
    }
    console.log(todo);
    res.status(200).send(todo);
  },()=>{
    res.status(400).send();
  });
});

app.patch('/todos/:id', (req, res)=>{
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
      body.completedAt = null;
    }

    Todo.findByIdAndUpdate(id, {$set: body}, {new: true}).then((todo)=>{
      if(!todo){
        res.status(404).send();
      }
        res.send({todo});
    }).catch((e)=>{
      res.status(400).send();
    });

});


app.listen(process.env.PORT || 3000, ()=>{
  console.log(`Port is up and running!`);
})
