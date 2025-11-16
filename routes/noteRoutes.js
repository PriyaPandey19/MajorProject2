import express from "express";
import CryptoJS from "crypto-js";
import Note from "./models/Note.js";
import { v4 as uuidv4 } from 'uuid';


const router = express.Router();



//encrpt and store in mongo db

// router.get("/create",(req,res) =>{
//     const success = req.query.success;
//     const token = req.query.token;
//     const secretKey = req.query.secretKey;
//     const expireMinutes = req.query.expireMinutes;
//     const queryHost = req.query.host ? decodeURIComponent(req.query.host) : null;

   
//     const currentHost = `${req.protocol}://${req.get("host")}`;
//     const finalHost = queryHost || currentHost;

//     let message = null;
//     let shareLink = null;

//     if(success && token && secretKey ){
//         message ="Note created successfully";
//         shareLink = `${finalHost}/view/${token}`;

//     }
//      res.render("create-note", { message, shareLink,expireMinutes });
// });


router.post("/create",async(req,res) =>{
    try{
        const{text, secretKey, expireMinutes} = req.body;

        if(!text || !secretKey){
            return res.status(400).json({message:"Text and security key are required"});
        }
        const encryptedText = CryptoJS.AES.encrypt(text,secretKey).toString();
        const expiresAt = new Date(Date.now() + expireMinutes * 60 *1000);
        const token = uuidv4();
        const note = new Note ({ encryptedText, expiresAt,token});
        await note.save();
        const finalHost = process.env.PUBLIC_URL;

      res.redirect(`/create?success=true&token=${token}&secretKey=${encodeURIComponent(secretKey)}&expireMinutes=${expireMinutes}&host=${encodeURIComponent(finalHost)}`);

        
       // const dynamicHost = `${req.protocol}://${req.get("host")}`;
       // res.redirect(`/create?show_link=true`);
 //res.redirect(`/create?success=true&token=${token}&secretKey=${encodeURIComponent(secretKey)}&expireMinutes=${expireMinutes}`);
   
        // res.redirect(`/view-note?success=true&token=${note.token}`);
        //res.redirect(`/view-note?noteId=${note._id}`);
        //res.render("create-note", { message: "Note created successfully!", noteToken: note.token });
    }
    catch(err){
        console.log(err);
        res.status(500).render("create-note",{message:"Failed to create note", noteId:null});
    }
});




// router.get("/view/:token/:secretKey", async(req, res) =>{
//     try{
//         const {token} = req.params;
//         let {secretKey} = req.params;
//         secretKey = decodeURIComponent(secretKey);

//         // 🔍 Find the note in DB
//         const note = await Note.findOne({token});
//         if(!note){
//             return res.status(404).render("view-note",{
//                 message:"Note not found or expired",
//                 decryptedText:null
//             })
//         }

       
//         // 🔓 Decrypt note content
//         const bytes = CryptoJS.AES.decrypt(note.encryptedText, secretKey);
//         const decryptedText = bytes.toString(CryptoJS.enc.Utf8);

//         await Note.findByIdAndDelete(note._id);
        
//         res.render("view-note",{message:"Note retrieved successfully!",decryptedText})
//     }catch(err){
//         console.error(err);
//         res.render("view-note",{message:"Failed to retrieve note",decryptedText:null});
//     }
// });

router.get("view/:token", async(req, res) =>{
    try {
        const { token } = req.params;
        
        // Use findOne() to check if the note exists (but don't decrypt here)
        const note = await Note.findOne({ token });
        
        if (!note) {
            return res.status(404).render("view-note", {
                message: "Note not found or expired",
                decryptedText: null,
                noteId: null // or token, depending on your view
            });
        }

        // Renders the form view, passing the token so the form can submit it later
        res.render("view-note", { message: null, decryptedText: null, noteId: token });
        
    } catch (err) {
        console.error(err);
        res.render("view-note", { message: "Error loading note.", decryptedText: null, noteId: null });
    }
});


router.post("/view",async(req,res) =>{
    try{
        const {noteId, secretKey} = req.body;

        if(!noteId || !secretKey){
            return res.render("view-note",{message:"Note Id and secret key are required",decryptedText:null,noteId:noteId});
        }
        const note = await Note.findOne({token:noteId});
        if(!note){
            return res.render("view-note",{message:"Note not found or expired",decryptedText:null, noteId:null});
        }


        const bytes = CryptoJS.AES.decrypt(note.encryptedText, secretKey);
        const decryptedText = bytes.toString(CryptoJS.enc.Utf8);

        //check decryption success
        if(!decryptedText){
          return res.render("view-note",{
            message:"Decryption failed.Please check your secret key",
            decryptedText:null,
            noteId:noteId
          })
        }

        await Note.findByIdAndDelete(note._id);
        res.render("view-note",{message:"Note retrieved successfully! Now it has been destroyed...",decryptedText,noteId:null})
    }catch(err){
        console.log(err);
        res.render("view-note",{message:"Failed to retrieve note",decryptedText:null,noteId:req.body.noteId});
    }
})

// router.get("/test", (req, res) => {
//   res.send("✅ Notes route working fine!");
// });


export default router;