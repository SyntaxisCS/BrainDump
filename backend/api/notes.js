// Express
const express = require("express");

// Passport
const passport = require("passport");

// Router initialization
const notes = express.Router();

// Database Handlers
const {getNoteById,getAllNotes,createNote,deleteNote,updateNote} = require("./database/dbHandler");

// Middleware
const ensureAuthentication = (req, res, next) => {
    if (req.session.authenticated) {
        return next();
    } else {
        res.status(400).send({error: "Not authenticated"});
    }
};

// Endpoints
notes.get("/", ensureAuthentication, (req, res) => {
    getAllNotes(req.session.user.email).then(response => {
        res.send({notes: response});
    }, err => {
        switch(err) {
            case "Could not find any notes for specified user":
                res.status(204).send({notes: "No notes found"});
            break;
            default:
                res.status(500).send({error: "Internal Server Error"});
        }
    });
});

notes.get("/:noteid", ensureAuthentication, (req, res) => {
    let noteId = req.params.noteid;

    getNoteById(noteId, req.session.user.uuid).then(response => {
        res.send({note: response});
    }, err => {
        switch(err) {
            case "Forbidden":
                res.status(403).send({error: "Not authenticated"});
            break;
            case "No notes":
                res.status(204).send({error: "No notes found with that id"});
            break;
            default:
                res.status(500).send({error: "Internal Server Error"});
            break;
        }
    });
});

notes.post("/create", ensureAuthentication, (req, res) => {

    let noteObject = {
        uuid: req.session.user.uuid,
        content: req.body.content
    };

    createNote(noteObject).then(response => {
        let createdNote = {
            uuid: response.id,
            updatedDate: response.updated_date,
            creationDate: response.creation_date
        };

        res.status(201).send(createdNote);
    }, err => {
        console.log(err);
        res.status(500).send({error: "Could not create note"});
    });
});

notes.delete("/:noteid", ensureAuthentication, (req, res) => {
    let noteId = req.params.noteid;

    deleteNote(noteId).then(response => {
        res.status(204).send({note: `Deleted ${noteId}`});
    }, err => {
        res.status(500).send({error: "Could not delete note"});
    });
});

notes.post("/:noteid", ensureAuthentication, (req, res) => {
    let userId = req.session.user.uuid;
    let noteId = req.params.noteid;
    let newContent = req.body.content;

    updateNote(userId, noteId, newContent).then(response => {
        res.send({note: newContent});
    }, err => {
        res.status(500).send({error: "Could not update note"});
    });
});

module.exports = notes;