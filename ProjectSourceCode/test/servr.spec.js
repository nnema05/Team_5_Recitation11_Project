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

// NOT WORKING SAD
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

// PROFILE TEST CASE- NOT WORKING SAD

// ATTEMPT 1!!!! --> THIS IS HTML RESPONSE
// describe('Profile Route Tests', () => {
//   let agent;
//   const testUser = {
//     username: 'testuser',
//     password: 'testpass123',
//   };

//   before(async () => {
//     // clear users table and create test user
//     await db.query('TRUNCATE TABLE users CASCADE');
//     const hashedPassword = await bcryptjs.hash(testUser.password, 10);
//     await db.query('INSERT INTO users (username, password) VALUES ($1, $2)', [
//       testUser.username,
//       hashedPassword,
//     ]);
//   });

//   beforeEach(() => {
//     // new agent for session handling
//     agent = chai.request.agent(app);
//   });

//   afterEach(() => {
//     // Clear cookie after each test
//     agent.close();
//   });

//   after(async () => {
//     // clean up database
//     await db.query('TRUNCATE TABLE users CASCADE');
//   });

//   describe('GET /profile', () => {
    
//    // DOES NOT LOGIN!
//      // negative test case
//     it('should return 401 if user is not authenticated', done => {
//       agent.get('/logout').end()
//       chai
//         .request(app)
//         .get('/profile')
//         .end((err, res) => {
//           expect(res).to.have.status(401);
//           expect(res.text).to.equal('Not authenticated');
//           done();
//         });
//     });

//     // positive test case
//     it('should return user profile when authenticated', async () => {
//       // first login
//       await agent.post('/login').send(testUser);

//       // access profile
//       const res = await agent.get('/profile');

//       expect(res).to.have.status(200);
//       expect(res.text).to.include(`<h1>${testUser.username}'s Profile</h1>`);
//     });
// });

// });



after(() => {
  db.$pool.end(); // close the database connection
});

// *********************** TODO: WRITE 2 UNIT TESTCASES **************************

// ********************************************************************************


