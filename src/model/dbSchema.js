const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


const dbSchema = new mongoose.Schema({
  firstname: {
    type: String,
    required: true,
  },
  lastname: {
    type: String,
    required: true,
  },
  birthday: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phone: {
    type: Number,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  confirmpassword: {
    type: String,
    required: true,
  },
  // here we need to make another field for store token
  tokens :[{
    token : {
      type : String,
      required : true
    }
  }]
});

// here we are creating jwt token 
// here we are normal function because we are dealing this keyword 
// we use dbSchema.methods function because we are dealing with registerInfo which is instence of dbModel in app.js

dbSchema.methods.generateToken = async function(){
  try{
    // SECRET_KEY Is Define in .env file
    const token = await jwt.sign({_id : this._id}, process.env.SECRET_KEY);
     
    this.tokens = this.tokens.concat({token:token})
    // for save the tokens in DB
    await this.save();
    // console.log(token)
    return token;

  }catch(e){ 
  console.log("Error is : ", e);
  }

}



// ++++++++++++++++++++++++++++++++++++++++++++++++++

// for hashing the password here we convert user plain password into hashing value and store that hashing value in database

dbSchema.pre("save", async function (next) {
  if (this.isModified("password")) {

    this.password = await bcrypt.hash(this.password, 10);
    this.confirmpassword = await bcrypt.hash(this.password, 10);
   

    // after the check password and confirm password both are same we doesn't need to store the confirm password field
    // for remove the confirm password field
    // this.confirmpassword = undefined;

    
    next();
  }
});

// ++++++++++++++++++++++++++++++++++++++++

const dbModel = mongoose.model("RegisterData", dbSchema);

module.exports = dbModel;
