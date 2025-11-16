import express from "express";

const router = express.Router();

router.get("/create-note", (req, res) => {
  res.render("create-note"); // this will render create-note.ejs
});

export default router;