const {mongoose} = require('./server/db/mongoose');
const {User} = require('./server/models/user');

var id = "5a7e2baa5115d836dc9541a5";

User.findById(id).then((user)=>{
  if(!user){
    return console.log("User was not found!");
  }
  console.log('User found \n', user);
});
