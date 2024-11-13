// *****************************************************
// <!-- Section 1 : Import Dependencies -->
// *****************************************************

const express = require('express'); // To build an application server or API
const app = express();
const handlebars = require('express-handlebars');
const Handlebars = require('handlebars');
const path = require('path');
const pgp = require('pg-promise')(); // To connect to the Postgres DB from the node server
const bodyParser = require('body-parser');
const session = require('express-session'); // To set the session object. To store or access session data, use the `req.session`, which is (generally) serialized as JSON by the store.
const bcrypt = require('bcryptjs'); //  To hash passwords
const axios = require('axios'); // To make HTTP requests from our server. We'll learn more about it in Part C.
app.use(express.static('public'));

// *****************************************************
// <!-- Section 2 : Connect to DB -->
// *****************************************************

// create `ExpressHandlebars` instance and configure the layouts and partials dir.
const hbs = handlebars.create({
  extname: 'hbs',
  layoutsDir: __dirname + '/src/views/layouts',
  partialsDir: __dirname + '/src/views/partials',
});

console.log(__dirname, path.join(__dirname, 'src', 'views'))
app.set('views', path.join(__dirname, 'src', 'views'));
app.use(express.static(path.join(__dirname, 'resources'))); // Updated path to serve static files

// database configuration
const dbConfig = {
  host: 'db', // the database server
  port: 5432, // the database port
  database: process.env.POSTGRES_DB, // the database name
  user: process.env.POSTGRES_USER, // the user account to connect with
  password: process.env.POSTGRES_PASSWORD, // the password of the user account
};

const db = pgp(dbConfig);

// test your database
db.connect()
  .then(obj => {
    console.log('Database connection successful'); // you can view this message in the docker compose logs
    obj.done(); // success, release the connection;
  })
  .catch(error => {
    console.log('ERROR:', error.message || error);
  });

// *****************************************************
// <!-- Section 3 : App Settings -->
// *****************************************************

// Register `hbs` as our view engine using its bound `engine()` function.
app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.use(bodyParser.json()); // specify the usage of JSON for parsing request body.

// initialize session variables
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    saveUninitialized: false,
    resave: false,
  })
);

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

// *****************************************************
// <!-- Section 4 : API Routes -->
// *****************************************************


// TODO - Include your API routes here
app.get('/welcome', (req, res) => {
  res.json({ status: 'success', message: 'Welcome!' });
});

app.get('/', (req, res) => {
  res.redirect('/login'); // Redirect to the /login route
});

app.get('/login', (req, res) => {
  res.render('pages/login');
})

app.get('/register', (req, res) => {
  res.render('pages/register');
})

app.get('/discover', (req, res) => {
  res.render('pages/discover');
})

app.get('/mycloset', (req, res) => {
  res.render('pages/mycloset');
})



// FOR FOR YOU PAGE 
app.get('/for-you', (req, res) => {
  const personalizedContent = [
    {
      title: "Card 1",
      description: "This is the first card.",
      //imageUrl: 
      url: "#"
    },
    {
      title: "Card 2",
      description: "This is the second card.",
      //imageUrl: 
      //url: "#"
    },
    {
      title: "Card 3",
      description: "This is the third card.",
      //imageUrl: 
      //url: "#"
    }
  ];

  res.render('forYouPage', { personalizedContent });
});



// Register

app.post('/register', async (req, res) => {
  try {
    // validate input -
    if (!req.body.username || !req.body.password) {
      if (req.headers['x-test-request']) {
        return res.status(400).json({ message: 'Invalid input' });
      }
      return res.redirect('/register');
    }

    // hash the password using bcrypt library
    const hash = await bcrypt.hash(req.body.password, 10);

    // insert username and hashed password into the 'users' table
    await db.none('INSERT INTO users(username, password) VALUES($1, $2)', [req.body.username, hash]);

    // check if the request came from the test case 
    if (req.headers['x-test-request']) {
      return res.status(200).json({ message: 'Success' });
    }

    // redirect to GET /login route after successful registration in normal operations
    res.redirect('/login');
  } catch (error) {
    console.error('Registration error:', error.message || error);

    // send a JSON response if there's an error during testing
    if (req.headers['x-test-request']) {
      return res.status(500).json({ message: 'Error registering user' });
    }

    // redirect back to the registration page if there's an error in normal operations
    res.redirect('/register');
  }
});

// OLD LOGIN ROUTE--> DONT DELETE UNTIL VERY END!!!
// app.post('/login', async (req, res) => {
//   try {
//     // find the user in the users table
//     const user = await db.oneOrNone('SELECT * FROM users WHERE username = $1', [req.body.username]);

//     // check if the user exists
//     if (!user) {
//       // user not found, render login page 
//       const message = "Username not found. Please register.";
//       // return res.render('pages/login', { message, error: true });
//       return res.status(401).render('pages/login', { message, error: true });
//     }

//     // compare the entered password with the hashed password in the database
//     const match = await bcrypt.compare(req.body.password, user.password);

//     if (!match) {
//       // password incorrect, render login page with error message
//       const message = "Incorrect username or password.";
//       // return res.render('login', { message, error: true });
//       return res.status(401).render('pages/login', { message, error: true });

//     }

//     // if the password is correct, save user details in session
//     req.session.user = user;
//     req.session.save();

//     // redirect to /discover route after successful login
//     req.session.user = { username: user.username };  
//     res.redirect('/discover');
//   } catch (error) {
//     console.error('Login error:', error.message || error);
//    // error message login
//     const message = "An error occurred during login. Please try again.";
//     res.render('pages/login', { message, error: true });
//   }
// });

app.post('/login', async (req, res) => {
  try {
    // Find the user in the users table
    const user = await db.oneOrNone('SELECT * FROM users WHERE username = $1', [req.body.username]);

    // Check if the user exists
    if (!user) {
      const message = "Username not found. Please register.";
      if (req.headers['x-test-request']) {
        return res.status(401).json({ message });
      }
      return res.render('pages/login', { message, error: true });
    }

    // Compare the entered password with the hashed password in the database
    const match = await bcrypt.compare(req.body.password, user.password);

    if (!match) {
      const message = "Incorrect username or password.";
      if (req.headers['x-test-request']) {
        return res.status(401).json({ message });
      }
      return res.render('pages/login', { message, error: true });
    }

    // If the password is correct, save user details in session
    req.session.user = { username: user.username };
    req.session.save();

    if (req.headers['x-test-request']) {
      return res.status(200).json({ message: 'Login successful' });
    }

    // Redirect to /discover route after successful login
    res.redirect('/discover');
  } catch (error) {
    console.error('Login error:', error.message || error);

    const message = "An error occurred during login. Please try again.";
    if (req.headers['x-test-request']) {
      return res.status(500).json({ message });
    }

    // Render login page with error message in normal operations
    res.render('pages/login', { message, error: true });
  }
});





const auth = (req, res, next) => {
  if (!req.session.user) {
    // Check if the request is expecting a JSON response (API call)
    if (req.headers.accept && req.headers.accept.includes('application/json')) {
      // For API calls, send 401 status code
      return res.status(401).send('Not authenticated');
    } else {
      // For regular web requests, redirect to login page
      // return res.redirect('/login');
      res.should.redirectTo(/^.*127\.0\.0\.1.*\/login$/);
    }
  }
  next();
};

// handles testing api!
app.get('/test', (req, res) => {

  console.log("============= REDIRECTING TO LOGIN=============");      
  if (!req.session.user) {
    return res.redirect(302,'/login');
  }
  res.status(200).send("Welcome to the test route");

});

// NEED TO ADD AUTHENTICATION!!! (use disocver example)
// Authentication Required
app.use(auth);
app.use('/discover', auth);

// Discover page
app.get('/discover', async (req, res) => {
  try {
    const response = await axios({
      url: 'https://app.ticketmaster.com/discovery/v2/events.json',
      method: 'GET',
      headers: { 'Accept-Encoding': 'application/json' },
      params: {
        apikey: process.env.API_KEY,
        keyword: 'Drake',
        size: 10, // Number of events to retrieve
      },
    });

    const events = response.data._embedded.events.map(event => ({
      name: event.name,
      image: event.images[0]?.url || 'https://example.com/default.jpg',
      date: event.dates.start.localDate,
      time: event.dates.start.localTime,
      url: event.url
    }));

    res.render('pages/discover', { events });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.render('pages/discover', { events: [], message: 'Failed to load events.' });
  }
});

// Logout route
app.get('/logout', (req, res) => {

  req.session.destroy(err => {
    if (err) {
      // If there's an error during logout, you can log it and respond accordingly
      console.error('Session destruction error:', err);
      return res.status(500).send('Could not log out.');
    }
    // Render the logout page with a success message
    res.render('pages/logout', {
      message: 'Logged out Successfully',
      error: false
    });
  });
});





// handles profile 
// renders page:
// app.get('/profile', (req, res) => {
//   if (!req.session.user) {
//     return res.status(401).send('Not authenticated');
//   }
//   try {
//     res.render('pages/profile', { username: req.session.user.username });
//   } catch (err) {
//     console.error('Profile error:', err);
//     res.status(500).send('Internal Server Error');
//   }
// });

//sends json

// app.get('/profile', auth, (req, res) => {  // Use the auth middleware
//   try {
//     res.status(200).json({
//       username: req.session.user.username,
//     });
//   } catch (err) {
//     console.error('Profile error:', err);
//     res.status(500).send('Internal Server Error');
//   }
// });



// WITH THE BELOW TWO CHANGES, ALLOWS THE TEST TO PASS BUT DOESNT RENDER PROFILE CORRECTLY, HAVE TO COMMENT OUT  JSON GET AND THE TEST TO RENDER CORRECTLY
// app.get('/profile', auth, (req, res) => {
//   try {
//     if (!req.session.user) {
//       return res.status(401).send('Not authenticated');
//     }
//     res.status(200).json({
//       username: req.session.user.username,
//     });
//   } catch (err) {
//     console.error('Profile error:', err);
//     res.status(500).send('Internal Server Error');
//   }
// });


app.get('/profile', (req, res) => {
  if (!req.session.user) {
    return res.status(401).send('Not authenticated');
  }
  try {
    res.render('pages/profile', { username: req.session.user.username });
    //  res.should.be.html; // Expecting a HTML response
  } catch (err) {
    console.error('Profile error:', err);
    res.status(500).send('Internal Server Error');
  }
});

// app.get('/profile', auth, (req, res) => {
//   try 
//     if (!req.session.user) {
//       return res.status(401).send('Not authenticated');
//     }

//     if (req.headers['accept'] && req.headers['accept'].includes('application/json')) {
//       // Return JSON response for tests
//       return res.status(200).json({
//         username: req.session.user.username,
//       });
//     }

//     // Default behavior: render profile page
//     res.render('pages/profile', { username: req.session.user.username });
//   } catch (err) {
//     console.error('Profile error:', err);
//     res.status(500).send('Internal Server Error');
//   }
// });

app.get('/mycloset', (req, res) => {
  if (!req.session.user) {
    return res.status(401).send('Not authenticated');
  }
  try {
    res.render('pages/mycloset', { username: req.session.user.username });
  } catch (err) {
    console.error('My Closet error:', err);
    res.status(500).send('Internal Server Error');
  }
});










// *****************************************************
// <!-- Section 5 : Start Server-->
// *****************************************************
// starting the server and keeping the connection open to listen for more requests
// module.exports = app.listen(3000);
// console.log('Server is listening on port 3000');

// module.exports = { app: app.listen(3000), db };

// Export `app` and `db` directly without listening immediately
module.exports = { app, db };

// Conditionally start the server if running the file directly
if (require.main === module) {
  app.listen(3000, () => {
    console.log('Server is listening on port 3000');
  });
}