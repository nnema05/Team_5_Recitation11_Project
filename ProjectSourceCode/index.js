// *****************************************************
// <!-- Section 1 : Import Dependencies -->
// *****************************************************

const express = require('express'); // To build an application server or API
const multer = require('multer'); // For handling file uploads
const fs = require('fs'); // For file system operations
const app = express();
const handlebars = require('express-handlebars');
const Handlebars = require('handlebars');
const path = require('path');
const pgp = require('pg-promise')(); // To connect to the Postgres DB from the node server
const bodyParser = require('body-parser');
const session = require('express-session'); // To set the session object. To store or access session data, use the `req.session`, which is (generally) serialized as JSON by the store.
const bcrypt = require('bcryptjs'); //  To hash passwords
const axios = require('axios'); // To make HTTP requests from our server. We'll learn more about it in Part C.
//const { Pool } = require('pg');
const { Pool } = require('pg');

const router = express.Router();

// Configure the database connection
const pool = new Pool({
  user: 'username',
  host: 'localhost',
  database: 'myclothes',
  password: 'password',
  port: 5432, // Default PostgreSQL port
});


const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

// const upload = multer({
//   fileFilter: (req, file, cb) => {
//     if (!file.mimetype.startsWith('image/')) {
//       return cb(new Error('Invalid file type, only images are allowed!'), false);
//     }
//     cb(null, true);
//   }
// });



// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(express.static('public'));

// Ensure the uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log('Created uploads directory');
}


// Configure multer for file storage
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, uploadDir);
//     },
//     filename: (req, file, cb) => {
//         cb(null, `${Date.now()}-${file.originalname}`);
//     },
// });
//const upload = multer({ storage });


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

// RENDER database configuration works before docker!!
// const dbConfig = {
//   host: process.env.HOST, // the database server
//   port: process.env.POSTGRES_PORT, // the database port
//   database: process.env.POSTGRES_DB, // the database name
//   user: process.env.POSTGRES_USER, // the user account to connect with
//   password: process.env.POSTGRES_PASSWORD, // the password of the user account
// };
const dbConfig = {
  // host: 'db', // the database server
  host: process.env.POSTGRES_HOST, // the database server
  port: process.env.DB_PORT, // the database port
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
// app.use(bodyParser.json()); // specify the usage of JSON for parsing request body.
app.use(bodyParser.json({ limit: '50mb' })); // Increase the limit for JSON payloads
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true })); // Increase the limit for form submissions
app.use(express.static(__dirname + '/Data_Conversion'));

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

app.get('/welcome', (req, res) => {
  res.json({ status: 'success', message: 'Welcome!' });
});

/* login route*/
app.get('/', (req, res) => {
  res.redirect('/login'); // Redirect to the /login route
});


app.get('/login', (req, res) => {
  res.render('pages/login', { layout: 'main', isLoginPage: true });
});

/* loading register page route */
app.get('/register', (req, res) => {
  // Check for error query parameter and set a user-friendly error message
  const error = req.query.error === 'username-exists'
    ? 'Username already exists. Please choose a new one.'
    : null;

  // Render the registration page with the error message and layout options
  res.render('pages/register', {
    layout: 'main', 
    isRegisterPage: true, 
    error
  });
});


// WITH BASE 64!!
// get request that swipes through images and disaplys them on app!
// app.get('/discover', async (req, res) => {
//   try {
//     // Fetch the first outfit by default
//     const outfit = await db.oneOrNone('SELECT id, name, tags, image FROM outfits WHERE id = $1', [1]); // Start with id=1
//     res.render('pages/discover', { outfit });
//   } catch (error) {
//     console.error('Error fetching outfit from database:', error);
//     res.render('pages/discover', { outfit: null, message: 'Failed to load outfit.' });
//   }
// });

/* discover route to get the images from the database */
// app.get('/discover', async (req, res) => {
//   try {
//     // Fetch the first outfit by default
//     const outfit = await db.oneOrNone('SELECT id, name, tags, image FROM outfits WHERE id = $1', [1]); // Start with id=1
//     res.render('pages/discover', { outfit });
//   } catch (error) {
//     console.error('Error fetching outfit from database:', error);
//     res.render('pages/discover', { outfit: null, message: 'Failed to load outfit.' });
//   }
// });

// app.get('/discover/next/:id', async (req, res) => {
//   const currentId = parseInt(req.params.id, 10);
//   try {
//     const outfit = await db.oneOrNone('SELECT id, name, tags, image FROM outfits WHERE id > $1 ORDER BY id ASC LIMIT 1', [currentId]);

//     if (outfit) {
//       res.json({ success: true, outfit });
//     } else {
//       res.json({ success: false, message: 'No more outfits.' });
//     }
//   } catch (error) {
//     console.error('Error fetching the next outfit:', error);
//     res.status(500).json({ success: false, message: 'Failed to load next outfit.' });
//   }
// });

/* THIS SAVES ONLY FOR SESSION NOT IF LOGGED OUT Discover route to get the images from the database */
// app.get('/discover', async (req, res) => {
//   try {
//     const lastSeenId = req.session.lastSeenId || 1; // Default to 1 if no session variable exists
//     const outfit = await db.oneOrNone('SELECT id, name, tags, image FROM outfits WHERE id = $1', [lastSeenId]);
    
//     if (outfit) {
//       res.render('pages/discover', { outfit });
//     } else {
//       res.render('pages/discover', { outfit: null, message: 'No outfits found.' });
//     }
//   } catch (error) {
//     console.error('Error fetching outfit from database:', error);
//     res.render('pages/discover', { outfit: null, message: 'Failed to load outfit.' });
//   }
// });

// app.get('/discover/next/:id', async (req, res) => {
//   const currentId = parseInt(req.params.id, 10);
//   try {
//     const outfit = await db.oneOrNone('SELECT id, name, tags, image FROM outfits WHERE id > $1 ORDER BY id ASC LIMIT 1', [currentId]);
//     if (outfit) {
//       req.session.lastSeenId = outfit.id; // Save the last seen ID in the session
//       res.json({ success: true, outfit });
//     } else {
//       res.json({ success: false, message: 'No more outfits.' });
//     }
//   } catch (error) {
//     console.error('Error fetching the next outfit:', error);
//     res.status(500).json({ success: false, message: 'Failed to load next outfit.' });
//   }
// });

/* PRAYING THAT THIS WORKS LOL  */
app.get('/discover', async (req, res) => {
  try {
    const username = req.session.user.username; // Get the logged-in user's username

    // Fetch the last seen ID from the user's data
    const { last_seen_id: lastSeenId } = await db.one(
      'SELECT last_seen_id FROM users WHERE username = $1',
      [username]
    );

    const outfit = await db.oneOrNone(
      'SELECT id, name, tags, image FROM outfits WHERE id = $1',
      [lastSeenId]
    );

    if (outfit) {
      res.render('pages/discover', { outfit: outfit });
    } else {
      res.render('pages/discover', { outfit: null, message: 'No outfits found.' });
    }
  } catch (error) {
    console.error('Error fetching outfit from database:', error);
    res.render('pages/discover', { outfit: null, message: 'Failed to load outfit.' });
  }
});

app.get('/discover/next/:id', async (req, res) => {
  const currentId = parseInt(req.params.id, 10);
  const username = req.session.user.username;

  try {
    const outfit = await db.oneOrNone(
      'SELECT id, name, tags, image FROM outfits WHERE id > $1 ORDER BY id ASC LIMIT 1',
      [currentId]
    );

    if (outfit) {
      // Update the user's last seen outfit ID in the database
      await db.none(
        'UPDATE users SET last_seen_id = $1 WHERE username = $2',
        [outfit.id, username]
      );

      res.json({ success: true, outfit });
    } else {
      res.json({ success: false, message: 'No more outfits.' });
    }
  } catch (error) {
    console.error('Error fetching the next outfit:', error);
    res.status(500).json({ success: false, message: 'Failed to load next outfit.' });
  }
});



/*saves clothes to users database! */
app.post('/save-clothes', async (req, res) => {
  console.log("hi");
  const image = req.body.image; // Expecting the full outfit object
  const username = req.session.user.username;
  console.log(username)
  console.log(image)
  if (!username || !image) {
    return res.status(400).json({ success: false, message: 'Invalid data' });
  }

  try {
    const cutImage = image.split('/').slice(-2).join('/');  
    // testing
    console.log(`Inserting into savedclothes: outfitId=${cutImage}, username=${username}`);

    // Insert the outfit image into database
    await db.none(
      `INSERT INTO savedclothes (image, username) 
       VALUES ($1, $2)`, 
      [cutImage, username]
    );

    console.log('Outfit saved to savedclothes!');
    res.json({ success: true, message: 'Outfit saved!' });
  } catch (error) {
    console.log('Error saving outfit:', error);
    res.status(500).json({ success: false, message: 'Database error' });
  }
});



/*reset password route */
app.get('/reset-password', (req, res) => {
  res.render('pages/reset-password');
});



/* registering a new user route */
app.post('/register', async (req, res) => {
  try {

    if (!req.body.username || !req.body.password) {
      if (req.headers['x-test-request']) {
        return res.status(400).json({ message: 'Invalid input' });
      }
      return res.redirect('/register');
    }

  
    const existingUser = await db.oneOrNone('SELECT username FROM users WHERE username = $1', [req.body.username]);

    if (existingUser) {
      if (req.headers['x-test-request']) {
        return res.status(400).json({ message: 'Username already exists. Please choose a new one.' });
      }

      return res.redirect('/register?error=username-exists');
    }

    
    const hash = await bcrypt.hash(req.body.password, 10);

    
    await db.none('INSERT INTO users(username, password) VALUES($1, $2)', [req.body.username, hash]);

    
    if (req.headers['x-test-request']) {
      return res.status(200).json({ message: 'Success' });
    }

   
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

/* login route to check if user exists */
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
      return res.render('pages/login', {isLoginPage :true,  message, error: true });
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

    // Redirect to profile after successful login
    res.redirect('/profile');
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


// Reset password route
app.post('/reset-password', async (req, res) => {
  const { username, newPassword, confirmPassword } = req.body;

  // Check if passwords match
  if (newPassword !== confirmPassword) {
    return res.status(400).send('Passwords do not match');
  }

  try {
    // Find the user by username
    const user = await db.oneOrNone('SELECT * FROM users WHERE username = $1', [username]);

    if (!user) {
      return res.status(404).send('User not found');
    }

    // Hash the new password before saving
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user's password
    await db.none('UPDATE users SET password = $1 WHERE username = $2', [hashedPassword, username]);

    // Redirect to login page after password reset
    res.redirect('/login');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
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
      return res.redirect('/login');
    }
  }
  next();
};

/* testing route */
app.get('/test', (req, res) => {

  console.log("============= REDIRECTING TO LOGIN=============");      
  if (!req.session.user) {
    return res.redirect(302,'/login');
  }
  res.status(200).send("Welcome to the test route");

});

// Authentication Required
app.use(auth);
app.use('/discover', auth);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


/* example discover route from lab 8 --> keep for reference*/
app.get('/discover', async (req, res) => {
  try {
    const response = await axios({
      url: 'https://app.ticketmaster.com/discovery/v2/events.json',
      method: 'GET',
      headers: { 'Accept-Encoding': 'application/json' },
      params: {
        apikey: process.env.API_KEY,
        keyword: 'Drake',
        size: 10,
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

/* logout route */
app.get('/logout', (req, res) => {

  req.session.destroy(err => {
    if (err) {
      // If there's an error during logout, you can log it and respond accordingly
      console.error('Session destruction error:', err);
      return res.status(500).send('Could not log out.');
    }
    // Render the logout page with a success message
    res.render('pages/logout', {
      isLogoutPage: true,
      message: 'Logged out Successfully',
      error: false
    });
  });
});



/*creating profile page route*/
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



const storage = multer.memoryStorage();
const upload = multer({ storage: storage, dest: 'uploads/' }); // Temporary storage for uploaded files

// Convert a file to Base64
function fileToBase64(filePath) {
  const fileData = fs.readFileSync(filePath);
  return fileData.toString('base64');
}

/* route to handle file upload */
app.post('/upload', upload.single('image'), async (req, res) => {
  const { name, tags } = req.body;
  const imageFile = req.file;
  const userid = req.session.user.username;

  if (!imageFile) {
    return res.status(400).send('No file uploaded.');
  }

  try {
    // Define the local path where the file should be saved
    const savePath = path.join(__dirname,'/uploads', imageFile.originalname);

    console.log(savePath);
 
    fs.writeFileSync(savePath, imageFile.buffer);

    // Insert into the myclothes table without user_id
    const sqlInsert = `
      INSERT INTO myclothes (name, tags, image, username)
      VALUES ($1, $2, $3, $4)
    `;
    await db.none(sqlInsert, [name, tags, savePath , userid]);

    res.redirect('/mycloset');
  } catch (err) {
    console.error('Database insert error:', err);
    res.status(500).send('Failed to save clothing data.');
  }
});


app.get('/mycloset', async (req, res) => {
  const username = req.session.user.username;

  try {
    // get uploaded items from the `myclothes` table
    const uploadedClothes = await db.any(
      `SELECT name, tags, image FROM myclothes WHERE username = $1`,
      [username]
    );

    // get saved (right-swiped) items from the `savedclothes` table
    const savedClothes = await db.any(
      `SELECT image FROM savedclothes WHERE username = $1`,
      [username]
    );

    // Modify the fetched data (if necessary, e.g., extracting image paths)
    const uploadedClothesModified = uploadedClothes.map(data => ({
      name: data.name,
      tags: data.tags,
      image: `/uploads/${path.basename(data.image)}`, // Assuming image URLs need slicing
    }));

   

    const savedClothesModified = savedClothes.map(data => ({
      image: data.image,
    }));

    // Render the closet page with both uploaded and saved clothes
    res.render('pages/mycloset', { 
      clothes: uploadedClothesModified,
      savedClothes: savedClothesModified // Passing saved clothes to the view
    });
  } catch (err) {
    console.error('Error retrieving closet data:', err.message, err.stack);
    res.render('pages/mycloset', {
      clothes: [],
      savedClothes: [], // If an error occurs, send empty arrays
      error: 'Failed to load your closet. Please try again later.',
    });
  }
});







// Route to fetch and render clothing data


//module.exports = router;


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