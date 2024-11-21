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

// database configuration
// const dbConfig = {
//   host: process.env.HOST, // the database server
//   port: process.env.POSTGRES_PORT, // the database port
//   database: process.env.POSTGRES_DB, // the database name
//   user: process.env.POSTGRES_USER, // the user account to connect with
//   password: process.env.POSTGRES_PASSWORD, // the password of the user account
// };
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

// TODO - Include your API routes here
app.get('/welcome', (req, res) => {
  res.json({ status: 'success', message: 'Welcome!' });
});

app.get('/', (req, res) => {
  res.redirect('/login'); // Redirect to the /login route
});

// app.get('/login', (req, res) => {
//   res.render('pages/login');
// })
app.get('/login', (req, res) => {
  res.render('pages/login', { layout: 'main', isLoginPage: true });
});

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


// app.get('/register', (req, res) => {
//   res.render('pages/register');
// })

// app.get('/discover', async (req, res) => {
//   try {
//     // Query the outfits table to retrieve all outfits
//     const outfits = await db.any('SELECT name, tags, image FROM outfits');

//     // Map the results to the format needed for rendering
//     const events = outfits.map(outfit => ({
//       name: outfit.name,
//       image: outfit.image, // The Base64 string for the image
//       tag: outfit.tags,    // Tags for the outfit
//     }));

//     // Render the discover page with the data
//     res.render('pages/discover', { events });
//   } catch (error) {
//     console.error('Error fetching outfits from database:', error);
//     res.render('pages/discover', { events: [], message: 'Failed to load outfits.' });
//   }
// });

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

// // API endpoint to fetch the next outfit based on the current ID
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

// IS THERE A PROBLEM WITH THE DISOCVER
app.get('/discover', async (req, res) => {
  try {
    // Fetch the first outfit by default
    const outfit = await db.oneOrNone('SELECT id, name, tags, image FROM outfits WHERE id = $1', [1]); // Start with id=1
    res.render('pages/discover', { outfit });
  } catch (error) {
    console.error('Error fetching outfit from database:', error);
    res.render('pages/discover', { outfit: null, message: 'Failed to load outfit.' });
  }
});

app.get('/discover/next/:id', async (req, res) => {
  const currentId = parseInt(req.params.id, 10);
  try {
    const outfit = await db.oneOrNone('SELECT id, name, tags, image FROM outfits WHERE id > $1 ORDER BY id ASC LIMIT 1', [currentId]);

    if (outfit) {
      res.json({ success: true, outfit });
    } else {
      res.json({ success: false, message: 'No more outfits.' });
    }
  } catch (error) {
    console.error('Error fetching the next outfit:', error);
    res.status(500).json({ success: false, message: 'Failed to load next outfit.' });
  }
});


//saves clothes to users database!
// app.post('/save-clothes', async (req, res) => {
//   const { username, outfit } = req.body;

//   if (!username || !outfit) {
//     return res.status(400).json({ success: false, message: 'Invalid data' });
//   }

//   try {
//     // Add the outfit's base64 string to the user's `myclothes` array
//     await db.none(
//       `UPDATE users 
//        SET myclothes = array_append(myclothes, $1) 
//        WHERE username = $2`,
//       [outfit.image, username]
//     );
//     console.log("outfit saved!");
//     res.json({ success: true, message: 'Outfit saved!' });
//   } catch (error) {
//     console.log("does not save");
//     console.error(error);
//     res.status(500).json({ success: false, message: 'Database error' });
//   }
// });

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




app.get('/reset-password', (req, res) => {
  res.render('pages/reset-password');
});



// Register

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


// app.post('/register', async (req, res) => {
//   try {
//     // validate input -
//     if (!req.body.username || !req.body.password) {
//       if (req.headers['x-test-request']) {
//         return res.status(400).json({ message: 'Invalid input' });
//       }
//       return res.redirect('/register');
//     }

//     // hash the password using bcrypt library
//     const hash = await bcrypt.hash(req.body.password, 10);

//     // insert username and hashed password into the 'users' table
//     await db.none('INSERT INTO users(username, password) VALUES($1, $2)', [req.body.username, hash]);

//     // check if the request came from the test case 
//     if (req.headers['x-test-request']) {
//       return res.status(200).json({ message: 'Success' });
//     }

//     // redirect to GET /login route after successful registration in normal operations
//     res.redirect('/login');
//   } catch (error) {
//     console.error('Registration error:', error.message || error);

//     // send a JSON response if there's an error during testing
//     if (req.headers['x-test-request']) {
//       return res.status(500).json({ message: 'Error registering user' });
//     }

//     // redirect back to the registration page if there's an error in normal operations
//     res.redirect('/register');
//   }
// });

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

    // Redirect to /discover route after successful login
    //res.redirect('/discover');
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


//reset password!
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
      // return res.redirect('/login');
      // res.should.redirectTo(/^.*127\.0\.0\.1.*\/login$/);
      return res.redirect('/login');
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
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


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
      isLogoutPage: true,
      message: 'Logged out Successfully',
      error: false
    });
  });
});




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



// app.use('/upload', express.static(path.join(__dirname, 'upload')));











// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));





// app.post('/upload', upload.single('image'), async (req, res) => {
//   if (!req.file) {
//     return res.status(400).send('No file uploaded.');
//   }

//   try {
//     // Save file information in the database
//     await db.none(
//       'INSERT INTO outfits(name, tags, image) VALUES($1, $2, $3)',
//       [
//         req.body.name || 'Uploaded Image',  // Default name if not provided
//         req.body.tags || '',                // Optional tags
//         req.file.filename                   // Image filename saved in uploads/
//       ]
//     );

//     res.redirect('/mycloset');  // Redirect to the "My Closet" page after uploading
//   } catch (err) {
//     console.error('Error saving file to database:', err);
//     res.status(500).send('Error saving file to database.');
//   }
// });

// NEED TO RUN  node toBase64.js IF YOU ADD TO THIS!!!


const storage = multer.memoryStorage();
const upload = multer({ storage: storage, dest: 'uploads/' }); // Temporary storage for uploaded files

// Convert a file to Base64
function fileToBase64(filePath) {
  const fileData = fs.readFileSync(filePath);
  return fileData.toString('base64');
}

// API route to handle file upload


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
    //console.log(_dirname); 
    console.log(savePath);
 
    fs.writeFileSync(savePath, imageFile.buffer);
    
    //const base64Image = fileToBase64(imageFile.path);

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

//`data:image/png;base64,${base64Image}`



 

// const getRightSwipedClothes = async (username) => {
//   try {
//     // Fetch right-swiped clothes from the database
//     const result = await db.any(
//       `SELECT unnest(myclothes) AS clothing_item FROM users WHERE username = $1`,
//       [username]
//     );
//     return result.map(item => ({ name: item.clothing_item }));
//   } catch (error) {
//     console.error('Error fetching right-swiped clothes:', error);
//     throw error;
//   }
// };

// ATTMEPT 1
// app.get('/mycloset', async (req, res) => {
//   const username = req.session.user.username;

//   try {
//     // Fetch uploaded items from the `myclothes` table
//     const uploadedClothes = await db.any(
//       `SELECT name, tags, image FROM myclothes WHERE username = $1`,
//       [username]
//     );

//     // Fetch saved clothes from the `savedclothes` table
//     const savedClothes = await db.any(
//       `SELECT image FROM savedclothes WHERE username = $1`,
//       [username]
//     );

//     // Fetch right-swiped items from the `users` table (myclothes array)
//     const user = await db.oneOrNone(
//       `SELECT myclothes FROM users WHERE username = $1`,
//       [username]
//     );

//     uploadedClothesModified = uploadedClothes.map(data => ({
//       name: data.name,
//       tags: data.tags, // Corrected property access
//       image: data.image.slice(11) // Use data.image instead of image
//     }));

//     const rightSwipedClothes = user?.myclothes
//       ? user.myclothes.map((image, index) => ({
//           id: index + 1,
//           image: image.slice(11), // Correctly slicing the image
//           name: `Outfit ${index + 1}`, // Placeholder name
//           tags: '', // Placeholder tags
//         }))
//       : [];

//     // Modify savedClothes to match the same structure
//     const savedClothesModified = savedClothes.map(data => ({
//       image: data.image.slice(11), // Slice the path as needed
//       name: `Saved Outfit`, // Placeholder name
//       tags: '', // Placeholder tags
//     }));

//     // Render both uploaded, saved, and right-swiped clothes
//     res.render('pages/mycloset', { 
//       clothes: uploadedClothesModified, 
//       rightSwipedClothes,
//       savedClothes: savedClothesModified
//     });
//   } catch (err) {
//     console.error('Error retrieving closet data:', err.message, err.stack);
//     res.render('pages/mycloset', {
//       clothes: [],
//       rightSwipedClothes: [],
//       savedClothes: [],
//       error: 'Failed to load your closet. Please try again later.',
//     });
//   }
// });

// app.get('/mycloset', async (req, res) => {
//   const username = req.session.user.username;

//   try {
//     // Fetch uploaded items from the `myclothes` table
//     const uploadedClothes = await db.any(
//       `SELECT name, tags, image FROM myclothes WHERE username = $1`,
//       [username]
//     );

//     // // Fetch right-swiped items from the `users` table (myclothes array)
//     // const user = await db.oneOrNone(
//     //   `SELECT myclothes FROM users WHERE username = $1`,
//     //   [username]
//     // );
//     uploadedClothesModified = uploadedClothes.map(data => ({
//       name: data.name,
//       tags: data.tags, // Corrected property access
//       image: data.image.slice(11) // Use data.image instead of image
//     }));
    
//     // console.log(uploadedClothesModified);
    
    

//     // Render both uploaded and right-swiped clothes
//     res.render('pages/mycloset', { 
//       clothes: uploadedClothesModified, 

//     });
//   } catch (err) {
//     console.error('Error retrieving closet data:', err.message, err.stack);
//     res.render('pages/mycloset', {
//       clothes: [],
//       error: 'Failed to load your closet. Please try again later.',
//     });
//   }
// });

app.get('/mycloset', async (req, res) => {
  const username = req.session.user.username;

  try {
    // Fetch uploaded items from the `myclothes` table
    const uploadedClothes = await db.any(
      `SELECT name, tags, image FROM myclothes WHERE username = $1`,
      [username]
    );

    // Fetch saved (right-swiped) items from the `savedclothes` table
    const savedClothes = await db.any(
      `SELECT image FROM savedclothes WHERE username = $1`,
      [username]
    );

    // Modify the fetched data (if necessary, e.g., extracting image paths)
    const uploadedClothesModified = uploadedClothes.map(data => ({
      name: data.name,
      tags: data.tags,
      image: data.image.slice(11), // Assuming image URLs need slicing
    }));

    const savedClothesModified = savedClothes.map(data => ({
      image: data.image, // Assuming image URLs need slicing
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



// this try should work but it jsut needs to add when something gets swiped right this is the problem. 
  // try {
  //   // Fetch the first outfit by default
  //   const mysavedclothes = await db.oneOrNone(`SELECT myclothes FROM users WHERE username = '${userid}'`); 
  //   res.render('pages/mycloset', { mysavedclothes });
  // } catch (error) {
  //   console.error('Error fetching outfit from database:', error);
  //   res.render('pages/mycloset', { outfit: null, message: 'Failed to load outfit.' });
  // }

  // try {
  //   // Fetch the user's `myclothes` array from the database
  //   const userResult = await db.one(`SELECT myclothes FROM users WHERE username = '${userid}'`);
  //   const myclothes = userResult.myclothes || []; // Default to an empty array if null

  //   // Fetch the user's right-swiped clothes (assuming another helper or query exists)
  //   const rightSwipedClothes = await getRightSwipedClothes(userid);

  //   // Render the mycloset page with the clothing data
  //   res.render('pages/mycloset', { myclothes, rightSwipedClothes });
  // } catch (err) {
  //   console.error('Error loading closet:', err.message);

  //   // Render an error message if headers haven't been sent yet
  //   if (!res.headersSent) {
  //     res.render('pages/mycloset', { error: 'Failed to retrieve your closet data. Please try again later.' });
  //   }
  // }
  
 
  


// app.post('/upload', upload.single('image'), async (req, res) => {
//   const { name, tags } = req.body;
//   const imageFile = req.file;
//   const userID = req.session.user_id; // Ensure session stores the username

//   if (!userID) {
//     return res.status(401).send('Unauthorized: Please log in to upload.');
//   }

//   if (!imageFile) {
//     return res.status(400).send('No file uploaded.');
//   }

//   try {
//     const base64Image = fileToBase64(imageFile.path);

//     const sqlInsert = `
//       INSERT INTO myclothes (name, tags, image, user_id)
//       VALUES ($1, $2, $3, $4)
//     `;
//     await db.none(sqlInsert, [name, tags, `data:image/png;base64,${base64Image}`, userID]);

//     res.redirect('/mycloset');
//   } catch (err) {
//     console.error('Database insert error:', err);
//     res.status(500).send('Failed to save clothing data.');
//   }
// });

// app.get('/mycloset', async (req, res) => {
  
  
//   try {
//     const clothes = await db.any('SELECT * FROM myclothes WHERE user_id );
//     res.render('pages/mycloset', { clothes });
//   } catch (err) {
//     console.error('Database query error:', err.message, err.stack);
//     res.render('pages/mycloset', { error: 'Failed to retrieve clothing data. Please try again later.' });
//   }
// });





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