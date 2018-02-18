const mongoose = require('mongoose');

mongoose.Promise = global.Promise;
mongoose.connect("mongodb://localhost:27017/TodoApp");

const User = mongoose.model('User',
{
    email:{
      type: String,
      required: true,
      trim: true,
      minlength: 1
    }
});


var newUser = new User(
  {
    email: 'poudels@warhawks.ulm.edu'
  }
);

newUser.save().then((result)=>{
  console.log(JSON.stringify(result, undefined, 2));
}, (err) => {
  console.log(err);
});
