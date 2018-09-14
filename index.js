const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000
const bodyParser = require('body-parser')
const app = express();
const migrations = require('./storage/migration');


const morgan = require('morgan');
const passport = require('passport');
const config = require('./api/config/' + process.env.NODE_ENV);
const cors = require('cors');

const hookJWTStrategy = require('./middlewares/passport');
app.use(passport.initialize());

// Hook the passport JWT strategy.
hookJWTStrategy(passport);

app.use(express.static(path.join(__dirname, 'public')))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.use(cors())
app.use(morgan('dev'));
app.use(require('./api'))
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
migrations.runMigration().then(() => {
  app.listen(PORT, () => console.log(`Listening on ${ PORT }`))
});

