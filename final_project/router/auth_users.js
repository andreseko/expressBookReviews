const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => { //returns boolean
    // Filter the users array for any user with the same username
    let usersWithSameName = users.filter((user) => {
        return user.username === username;
    });
    // Return true if any user with the same username is found, otherwise false
    return usersWithSameName.length > 0;
}

const authenticatedUser = (username, password) => { //returns boolean
// Filter the users array for any user with the same username and password
    let validUsers = users.filter((user) => {
        return (user.username === username && user.password === password);
    });
    // Return true if any valid user is found, otherwise false
    return validUsers.length > 0;
}

const doesExist = (username) => {
    return isValid(username);
}

const getBookIdByISBN = (isbn) => {
    for (let [id, book] of Object.entries(books)) {
        if (isbn && book.isbn === isbn) {
            return id;
        }
    }

    return null;
};

//only registered users can login
regd_users.post("/login", (req, res) => {
    //Write your code here
    const username = req.body.username;
    const password = req.body.password;
    // Check if username or password is missing
    if (!username || !password) {
        return res.status(404).json({message: "Error logging in"});
    }
    // Authenticate user
    if (authenticatedUser(username, password)) {
        // Generate JWT access token
        let accessToken = jwt.sign({
            data: password
        }, 'access', {expiresIn: 60 * 60});
        // Store access token and username in session
        req.session.authorization = {
            accessToken, username
        }
        return res.status(200).json({message: "User successfully logged in"});
    } else {
        return res.status(208).json({message: "Invalid Login. Check username and password"});
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    let textReview = req.query.review;
    let username = req.session.authorization.username;
    const isbn = req.params.isbn;

    // check if has the text review on query parameter
    if (!textReview) {
        return res.status(404).json({message: "Text review is required."});
    }

    // get the book ID
    let bookId = getBookIdByISBN(isbn);

    if (bookId) {
        let review = {
            username: username,
            review: textReview,
        }

        books[bookId].reviews[review.username] = review.review;

        return res.status(200).json({message: "Review added/modified successfully.", review: review});
    } else {
        return res.status(404).json({message: "Book not found."});
    }
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
    let username = req.session.authorization.username;
    const isbn = req.params.isbn;

    let bookId = getBookIdByISBN(isbn);
    if (bookId && username) {
        if (books[bookId].reviews[username]) {
            delete books[bookId].reviews[username];
            res.status(200).send({message: "Review removed successfully."});
        } else {
            return res.status(404).json({message: "No reviews found."});
        }
    } else {
        return res.status(404).json({message: "Book not found."});
    }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.doesExist = doesExist;
module.exports.users = users;
