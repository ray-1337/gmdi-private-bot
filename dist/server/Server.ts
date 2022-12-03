import Express from "express";
import fs from "fs";

const app = Express();

app.get('/', (_, res) => {
  return res.send("ngapain lu liat-liat. kepo ya.");
});

app.get('/:filename', (req, res) => {
  if (!req.params?.filename || !fs.existsSync(`../gmdi-content-logging/${req.params.filename}`)) {
    res.status(404);
    return res.send("unknown content");
  };

  return res.sendFile(`../gmdi-content-logging/${req.params.filename}`);
});

app.get('/favicon.ico', (_, res) => {
  res.status(206);
  return res.end();
});

export default app.listen(Number(process.env?.SERVER_PORT || 3000), () => {
  console.log("Server: Ready.");
});