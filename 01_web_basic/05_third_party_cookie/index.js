const express = require('express')

const first = express();
first.use(express.static('public', {
  setHeaders: (res, path, stat) => {
    res.cookie('type', 'first', {
      httpOnly: true,
    });
  },
}));
first.listen(8080);

const third = express();
third.use(express.static('images', {
  setHeaders: (res, path, stat) => {
    res.cookie('type', 'third', {
      httpOnly: true,
      sameSite: 'None',
      secure: true,
    });
  },
}));
third.listen(8081);
