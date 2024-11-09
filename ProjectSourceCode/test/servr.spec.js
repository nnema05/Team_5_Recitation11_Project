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

// describe('Server!', () => {
//   // Sample test case given to test / endpoint.
//   it('Returns the default welcome message', done => {
//     chai
//       .request(server)
//       .get('/welcome')
//       .end((err, res) => {
//         expect(res).to.have.status(200);
//         expect(res.body.status).to.equals('success');
//         assert.strictEqual(res.body.message, 'Welcome!');
//         done();
//       });
//   });
// });

let server;

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

// Example Positive Testcase :
// API: /add_user
// Input: {id: 5, name: 'John Doe', dob: '2020-02-20'}
// Expect: res.status == 200 and res.body.message == 'Success'
// Result: This test case should pass and return a status 200 along with a "Success" message.
// Explanation: The testcase will call the /add_user API with the following input
// and expects the API to return a status of 200 along with the "Success" message.

describe('Testing register API', () => {
  beforeEach(async () => {
    // Ensure no existing user with username 'john_doe' before each test
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

  // Negative test case for invalid username and password
  it('negative : /register with invalid username and password', done => {
    chai
      .request(server)
      .post('/register')
      .set('x-test-request', 'true')
      .send({ id: 6, name: 'Jane Doe', dob: '2020-02-20', username: '', password: '' }) // Invalid inputs
      .end((err, res) => {
        expect(res).to.have.status(400);
        expect(res.body.message).to.equals('Invalid input');
        done();
      });
  });
});


// describe('Testing Redirect', () => {
//   it('should redirect / route to /login with 302 HTTP status code', done => {
//     chai
//       .request(server)  // assuming `server` is exported from `index.js`
//       .get('/test')  // Request the root URL
//       .end((err, res) => {
//         // Check if the response status is 302 (redirect)
//         res.should.have.status(302);
//         // Check if the response header contains the 'Location' to /login
//         res.should.have.property('header').with.property('location').eql('/login');
//         done();
//       });
//   });
// });

// render test
describe('Testing Render', () => {
  // Sample test case given to test /test endpoint.
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

// PROFILE TEST CASE
// describe('Profile Route Tests', () => {
//   let agent;
//   const testUser = {
//     username: 'testuser',
//     password: 'testpass123',
//   };

//   before(async () => {
//     // Clear users table and create test user
//     await db.query('TRUNCATE TABLE users CASCADE');
//     const hashedPassword = await bcryptjs.hash(testUser.password, 10);
//     await db.query('INSERT INTO users (username, password) VALUES ($1, $2)', [
//       testUser.username,
//       hashedPassword,
//     ]);
//   });

//   beforeEach(() => {
//     // Create new agent for session handling
//     agent = chai.request.agent(app);
//   });

//   afterEach(() => {
//     // Clear cookie after each test
//     agent.close();
//   });

//   after(async () => {
//     // Clean up database
//     await db.query('TRUNCATE TABLE users CASCADE');
//   });

//   describe('GET /profile', () => {
//     it('should return 401 if user is not authenticated', done => {
//       chai
//         .request(app)
//         .get('/profile')
//         .set('Accept', 'application/json')  // Add this line to make the server return JSON
//         .end((err, res) => {
//           expect(res).to.have.status(401);
//           expect(res.text).to.equal('Not authenticated');
//           done();
//         });
//     });

//     it('should return user profile when authenticated', async () => {
//       // First login to get session
//       await agent.post('/login').send(testUser);

//       // Then access profile
//       const res = await agent.get('/profile');

//       expect(res).to.have.status(200);
//       expect(res.body).to.be.an('object');
//       expect(res.body).to.have.property('username', testUser.username);
//     });
//   });
// });

after(() => {
  db.$pool.end(); // Close the database connection
});

// *********************** TODO: WRITE 2 UNIT TESTCASES **************************

// ********************************************************************************