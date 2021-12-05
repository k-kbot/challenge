const express = require('express')

const app = express();
app.get('/', (req, res) => {
  res.render('request.ejs');
});

app.listen(8080);

const restrictedApp = express();
const allowPostRequestFromSpecificOrigin = (req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:8080');
  res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');

  req.method === 'OPTIONS' ? res.sendStatus(200) : next();
}
restrictedApp.use(allowPostRequestFromSpecificOrigin)
restrictedApp.post('/', (req, res) => {
  res.status(200);
});

restrictedApp.listen(8081);
