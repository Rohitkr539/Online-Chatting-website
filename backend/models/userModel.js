import mongoose from "mongoose";

const userModel = new mongoose.Schema({
    fullName:{
        type:String,
        required:true
    },
    username:{
      type:String,
      required:true,
      unique:true
    },
    password:{
        type:String,
        required:true
    },
    profilePhoto:{
        type:String,
        default:""
    },
    gender:{
        type:String,
        enum:["male", "female"],
        required:true
    },
    friends: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    friendRequests: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    sentFriendRequests: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    blockedContacts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }]
}, {timestamps:true});
export const User = mongoose.model("User", userModel);