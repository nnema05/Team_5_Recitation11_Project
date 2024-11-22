# Software Dev Project
Style Swipe<br />
This application is a Tinder-style web platform where users can swipe left or right on clothing items. Based on user preferences, the application recommends outfits they might like. The project features a simple interface with images of clothes, and users can save their preferences by swiping.

## Contributors/ Members
Soumya Devulapalli<br />
Mary Kodenkandath <br />
Matis Uhl de Morais<br />
Nandini Nema<br />

## Technology Stack used for the project
Backend: Node.js, Express.js <br />
Frontend: HTML, CSS, JavaScript, Handlebars<br />
Database: PostgreSQL<br />
Testing: Chai (for unit tests)<br />
Hosting: Render (for cloud deployment)<br />

## Prerequisites to run the application
To run this application locally, ensure you have the following installed on your system: <br />

Node.js (version 16 or later) <br />
npm (Node Package Manager, bundled with Node.js) <br />
PostgreSQL (version 12 or later) <br />
Git (for cloning the repository) <br />
Docker (if you plan to run the database in a container) <br />

## Instructions on how to run the application locally
1. Clone the Repository
   git clone git@github.com:nnema05/Team_5_Recitation11_Project.git
2. Set Up Environment Variables
  POSTGRES_USER = "postgres"
  POSTGRES_PASSWORD = "pwd"
  POSTGRES_DB="users_db"
  HOST = 'db'
  POSTGRES_HOST = 'db'
  DB_PORT = 5432 
   
3. Start docker
   docker compose up
4. Close it down when done
   docker compose down -v

## How to run the tests
npm test
or docker compose up 

## Link to the deployed application
https://team-5-recitation11-project.onrender.com
