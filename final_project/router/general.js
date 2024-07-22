const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let doesExist = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req, res) => {
    // Check if a user with the given username already exists
    const username = req.body.username;
    const password = req.body.password;
    // Check if both username and password are provided
    if (username && password) {
        // Check if the user does not already exist
        if (!doesExist(username)) {
            // Add the new user to the users array
            users.push({"username": username, "password": password});
            return res.status(200).json({message: "User successfully registered. Now you can login"});
        } else {
            return res.status(404).json({message: "User already exists!"});
        }
    }
    // Return error if username or password is missing
    return res.status(404).json({message: "Unable to register user. Username and password is required"});
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
    //Write your code here
    res.send(JSON.stringify(books,null,4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    res.send(Object.values(books).filter(book => book.isbn === isbn)[0]);
});

// Get book details based o n author
public_users.get('/author/:author', function (req, res) {
    const author = req.params.author;
    res.send(Object.values(books).filter(book => book.author.toLowerCase().includes(author.toLowerCase())));
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
    //Write your code here
    const title = req.params.title;
    res.send(Object.values(books).filter(book => book.title.toLowerCase().includes(title.toLowerCase())));
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
    //Write your code here
    const isbn = req.params.isbn;
    let bookReviews = Object.values(books).filter(book => book.isbn === isbn)[0].reviews;
    res.send(bookReviews);
});

module.exports.general = public_users;
