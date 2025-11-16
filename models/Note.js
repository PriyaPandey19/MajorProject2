import mongoose from "mongoose";


const noteSchema = new mongoose.Schema({
    encryptedText:{
        type:String,
        required:true,
    },
    expiresAt:{
        type:Date,
        required:true,
        expires:0
    },
    token:{
        type:String,
        required:true,
        unique:true,
    }
});

const Note = mongoose.model("Note", noteSchema);
export default Note;