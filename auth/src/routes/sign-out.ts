import express from "express";

const router = express.Router();

router.post("/api/users/sign-out", (req, res) => {
  delete req.session?.jwt;
  res.send({});
});

export { router as signOutRouter };
