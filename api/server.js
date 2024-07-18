const express = require('express')
const app = express()
const mysql = require('mysql2')
const cors = require('cors');
const bcrypt = require('bcrypt')
const dotenv = require('dotenv');

app.use(express.json())
app.use(cors())
dotenv.config();

// connection to the database
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
})

// check if connection works
db.connect((err) => {
    // if connection does not work
    if(err) return console.log("Error connceting to MySQL")

    // if connection works succesfull
    console.log("Connected to MySQL as id: ", db.threadId)

    //create a database
    db.query(`CREATE DATABASE IF NOT EXISTS expense_tracker`, (err, result) => {
        if(err) return console.log(err) // error while creating database

        console.log("database expense_tracker created/checked");// db created successfull

        //change our database
        db.changeUser({ database: 'expense_tracker' }, (err, result) => {
            if(err) return console.log(err) // if error changing the database

            console.log("expense_tracker is in use"); // successfull use of database

            //create users table
            const usersTable = `
                CREATE TABLE IF NOT EXISTS users (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    email VARCHAR(100) NOT NULL UNIQUE,
                    username VARCHAR(50) NOT NULL,
                    password VARCHAR(255)
                )
            `;

            db.query(usersTable, (err, result) => {
                if(err) return console.log(err) // if error creating table

                console.log("users table created/checked") //user table created successfully
            })
        })
    })
})

//user registration route
app.post('/api/register', async(req, res) => {
    try{
        const users = `SELECT * FROM users WHERE email = ?`
        //check if user exists
        db.query(users, [req.body.email], (err, data) => {
            // if we find user with same email in database
            if(data.length > 0) return res.status(409).json("User already exists");

            // If we don't find user email in database
            //hashing password(encryption)
            const salt = bcrypt.genSaltSync(10)
            const hashedPassword = bcrypt.hashSync(req.body.password, salt)

            // query to create new user
            const newUser = `INSERT INTO users(email, username, password) VALUES (?)`
            value = [ req.body.email, req.body.username, hashedPassword ]

            db.query(newUser, [value], (err, data) => {
                if(err) return res.status(400).json("Something went wrong")

                return res.status(201).json("User created successfully")
            })
        })
    }
    catch(err) {
        res.status(500).json("Internal Server Error")
    }
})

// user login route
app.post('/api/login', async(req, res) => {
    try{
        // check existing user
        const users = `SELECT * FROM users WHERE email = ?`
        db.query(users, [req.body.email], (err, data) => {
            // if there is no user
            if(data.length === 0) return res.status(404).json("User not found")
            
            //if user exists and we compare password
            const isPasswordValid = bcrypt.compareSync(req.body.password, data[0].password)

            // if passwords don't much
            if(!isPasswordValid) return res.status(400).json("Invalid Email or Password")

            //passwords match we accept
            return res.status(200).json("Login sucessful")
        })
    } 
    catch(err) {
        res.status(500).json("Internal Server Error")
    }
})

// starts our server
app.listen(3000, () => {
    console.log('server is running on PORT 3000...')   
})