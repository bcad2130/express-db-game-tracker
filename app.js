const express = require('express')
const app = express()
const port = 3000

const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');

app.set('view engine', 'ejs')

// parse application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: false }))

// parse application/json
app.use(express.json())



// DB FUNCTIONS

// Pass DB params
const sequelize = new Sequelize({
  dialect: 'sqlite',
  //storage: 'path/to/database.sqlite'
  storage: './database.sqlite'
});

// Sync model with DB
function SyncModel(model) {
  model.sync();
}

// Authenticate with DB
async function Authenticate() {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}

// Close DB Connection
async function CloseConnection() {
  console.log("Closing Connection to sqlite");
  return new Promise((resolve) => {
    sequelize.close();
  });
}

//Listen in terminal console
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})



// SIMPLE USER DB APP

// Define User model
function DefineUser() {
  const User = sequelize.define(
    'User',
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
  );

  return User;
}

// Instantiate User model
const User = DefineUser();

// Index page sets up user data model
app.get('/index', (req, res) => {
  const user = DefineUser();
  SyncModel(user);
  Authenticate()
})

// Find all users
app.get('/users', async (req, res) => {
  const users = await User.findAll();
  res.json(users);
});

// Find user via ID
app.get('/users/:id', async (req, res) => {
  const user = await User.findByPk(req.params.id);
  res.json(user);
});

// Create user via custom form post
app.post('/createuser', async (req, res) => {
  const user = await User.create(req.body);

  res.json(user);
});

// Create user via hardcoded json
app.get('/createuserdefault', async (req, res) => {
  const user = await User.create({'name':'Biden'});
  res.json(user);
});

// Update User by ID
app.put('/users/:id', async (req, res) => {
  const user = await User.findByPk(req.params.id);

  if (user) {
    await user.update(req.body);
    res.json(user);
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});

// Delete User by ID
app.delete('/users/:id', async (req, res) => {
  const user = await User.findByPk(req.params.id);
  
  if (user) {
    await user.destroy();
    res.json({ message: 'User deleted' });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});



// BOSS TRACKER APP

// Instantiate Boss model
const Boss = DefineBoss();

// Sync Boss model with DB
SyncModel(Boss);

// Define Boss model
function DefineBoss() {
  const Boss = sequelize.define(
    'Boss',
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      game: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      deaths: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
    },
  );

  return Boss;
}

// Entry page
// Define a route to serve the HTML file
// todo convert html to ejs
app.get('/html', async (req, res) => {

  // is is better to define boss at top level or within a route?
  // const boss = DefineBoss();
  // SyncModel(Boss);

  Authenticate()

  // Send the HTML file as the response
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/createboss', async (req, res) => {
  const boss = await Boss.create(req.body);

  res.json(boss);
});

app.get('/bosses', async (req, res) => {
  const bosses = await Boss.findAll();

  res.render('pages/bosses', {bosses: bosses});
});



// TEST PAGES

app.get('/helloworld', (req, res) => {
  res.send('Hello World!')
})

app.get('/ejs', (req, res) => {
    const test = {
      firstName: 'Neely',
      lastName: 'Jo',
      cat: true,
  }
    res.render('pages/index', {user: test})
})

app.get('/articles', (req, res) => {
  const testposts = [
      {title: 'Title 1', body: 'Body 1' },
      {title: 'Title 2', body: 'Body 2' },
      {title: 'Title 3', body: 'Body 3' },
      {title: 'Title 4', body: 'Body 4' },
  ]

    res.render('pages/articles', {
        articles: testposts
    })
})

//Load the files that are in the public directory:
app.use(express.static('public'))


// to see an image go to http://localhost:3000/img/bernie.png
app.use('/img', express.static(__dirname + '/images'));



// ERROR HANDLING

//handle 404s
app.use((req, res, next) => {
  res.status(404).send("Sorry can't find that!")
})

//handle 500 errors
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).send('Something broke!')
})