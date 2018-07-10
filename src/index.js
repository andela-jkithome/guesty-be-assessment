const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan')

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
// log requests with morgan
app.use(morgan('dev'));

app.get('/', (req, res) => {
  res.send({
    working: true
  })
});


const port = process.env.PORT || 8000;

app.set('PORT', port);
app.listen(port, () => console.log(`Listening on port: ${port}`));