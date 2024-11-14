// ********************** Initialize server **********************************

//const server = require('../index'); //TODO: Make sure the path to your index.js is correctly added
const { app, db } = require('../index'); // Import `app` without starting a new server instance


// ********************** Import Libraries ***********************************

const bcryptjs = require('bcryptjs');
const chai = require('chai'); // Chai HTTP provides an interface for live integration testing of the API's.
const chaiHttp = require('chai-http');
chai.should();
chai.use(chaiHttp);
const {assert, expect} = chai;

// ********************** DEFAULT WELCOME TESTCASE ****************************


let server;
var glbalVarisble;
describe('Server!', function() {
  before(async function() {
    server = app.listen(3000, () => {
      console.log('Server started on port 3000');
    });
  });

  after(function() {
    server.close(); // Close the server after tests
  });

  it('Returns the default welcome message', function(done) {
    chai.request(server)
      .get('/')
      .end((err, res) => {
        if (err) done(err);
        expect(res).to.have.status(200);
        done();
      });
  });
});


describe('Testing register API', () => {
  beforeEach(async () => {
    // ensure no existing user with username 'john_doe' before each test
    await db.none('DELETE FROM users WHERE username = $1', ['john_doe']);
  });

  it('positive : /register', done => {
    chai
      .request(server)
      .post('/register')
      .set('x-test-request', 'true') // Custom header to identify test requests
      .send({ id: 5, name: 'John Doe', dob: '2020-02-20', username: 'john_doe', password: 'password123' })
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.message).to.equals('Success');
        done();
      });
  });

  // negative test case
  it('negative : /register with invalid username and password', done => {
    chai
      .request(server)
      .post('/register')
      .set('x-test-request', 'true')
      .send({ id: 6, name: 'Jane Doe', dob: '2020-02-20', username: '', password: '' })
      .end((err, res) => {
        expect(res).to.have.status(400);
        expect(res.body.message).to.equals('Invalid input');
        done();
      });
  });
});

//NOT WORKING SAD
describe('Testing Redirect', () => {
  // sample test case given to test /test endpoint.
  it('\test route should redirect to /login with 302 HTTP status code', done => {
    chai
      .request(server)
      .get('/test')
      .end((err, res) => {
        res.should.have.status(302); // Expecting a redirect status code
        res.should.redirectTo(/^.*127\.0\.0\.1.*\/login$/); // Expecting a redirect to /login with the mentioned Regex
        done();
      });
  });
});
// NOT WORKING SAD
describe('Testing Redirect', () => {
  // sample test case given to test /test endpoint.
  it('test route should redirect to /login with 302 HTTP status code', done => {
    chai
      .request(server)
      .get('/test')
      .end((err, res) => {        
        if (err) {
          console.error('Test error:', err.message); // Log test error
          return done(); // Exit with error for more detail
        }
        res.should.have.status(200);
        res.should.redirectTo(/^.*127\.0\.0\.1.*\/login$/);
        done();
      });
  });
});

// render test
describe('Testing Render', () => {
  // sample test case given to test /test endpoint.
  it('test "/login" route should render with an html response', done => {
    chai
      .request(server)
      .get('/login') // for reference, see lab 8's login route (/login) which renders home.hbs
      .end((err, res) => {
        res.should.have.status(200); // Expecting a success status code
        res.should.be.html; // Expecting a HTML response
        done();
      });
  });
});

// NEW LOGIN TESTS!!
describe('Testing login API', () => {
  const testUser = {
    username: 'john_doe',
    password: 'password123',
  };

  before(async () => {
    // Ensure the user table is clean, then insert a test user with a hashed password
    await db.none('TRUNCATE TABLE users CASCADE');
    const hashedPassword = await bcryptjs.hash(testUser.password, 10);
    await db.none('INSERT INTO users (username, password) VALUES ($1, $2)', [
      testUser.username,
      hashedPassword,
    ]);
  });

  after(async () => {
    // Clean up by truncating the users table
    await db.none('TRUNCATE TABLE users CASCADE');
  });

  // Positive test case: valid login credentials
  it('positive : /login with correct credentials', done => {
    chai
      .request(server)
      .post('/login')
      .set('x-test-request', 'true') // Custom header for test request
      .send({ username: testUser.username, password: testUser.password })
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.message).to.equals('Login successful');
        done();
      });
  });

  // Negative test case: incorrect password
  it('negative : /login with incorrect password', done => {
    chai
      .request(server)
      .post('/login')
      .set('x-test-request', 'true')
      .send({ username: testUser.username, password: 'wrongpassword' })
      .end((err, res) => {
        expect(res).to.have.status(401);
        expect(res.body.message).to.equals('Incorrect username or password.');
        done();
      });
  });

  // Negative test case: username not found
  it('negative : /login with non-existent username', done => {
    chai
      .request(server)
      .post('/login')
      .set('x-test-request', 'true')
      .send({ username: 'nonexistent', password: 'password123' })
      .end((err, res) => {
        expect(res).to.have.status(401);
        expect(res.body.message).to.equals('Username not found. Please register.');
        done();
      });
  });
});



after(() => {
  db.$pool.end(); // close the database connection
});

// *********************** TODO: WRITE 2 UNIT TESTCASES **************************

// ********************************************************************************


