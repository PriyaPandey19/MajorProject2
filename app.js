import express from "express";
import expressLayouts from "express-ejs-layouts";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import noteRoutes from "./routes/noteRoutes.js";
import notePageRoutes from "./routes/notePage.js";
import path from "path";
import { fileURLToPath } from "url";
import { title } from "process";
import helmet from "helmet";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(helmet({
  contentSecurityPolicy: false
}));
dotenv.config();
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(expressLayouts);
app.set('layout', 'layout/boilerplate');

//mongoose.connect("mongodb://127.0.0.1:27017/test");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/", noteRoutes);
app.use("/pages", notePageRoutes);



app.get("/",(req,res) =>{
  res.redirect("/create");
})
app.get("/create", (req, res) => { 
  const {success, token, secretKey, expireMinutes, host} = req.query;
  let message = null;
    let shareLink = null;
    if(success && token && secretKey ){
        message ="Note created successfully";
        shareLink = `${decodeURIComponent(host)}/view/${token}`;
    }
  res.render("create-note", { message, shareLink, expireMinutes });
});
app.get('/features',(req,res) =>{
  res.render('features',{title:'NoteCrypt Fetures'});
});
app.get('/about',(req,res) =>{
  res.render('about',{title:'NoteCrypt Company Info'});
})
app.use(express.static("public"));





const PORT = process.env.PORT|| 3000;
mongoose
.connect(process.env.ATLASDB_URL)
.then(() => {console.log("connected to MongoDB Atlas");
app.listen(PORT, () => console.log(`server running on port ${PORT}`)); 
})
.catch((err) => console.error("MongoDB connect error:", err));

// app.use("/api/notes",noteRoutes);


