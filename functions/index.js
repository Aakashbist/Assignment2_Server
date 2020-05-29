
const functions = require("firebase-functions");
const cors = require('cors')({ origin: true });
const admin = require('firebase-admin');

admin.initializeApp();

const database = admin.database().ref('/notes');

exports.addNotes = functions.https.onRequest((req, res) => {
    return cors(req, res, () => {
        if (req.method !== 'POST') {
            return res.status(401).json({
                message: 'Not allowed'
            })
        }
        const {
            address,
            description,
            imageUrl,
            lat,
            lon,
            userId
        } = req.body;

        database.push(req.body);
        res.status(200).json({ message: `Added successFully` })
    }, (error) => {
        res.status(error.code).json({
            message: `Something went wrong. ${error.message}`
        })
    })
})



exports.getNotes = functions.https.onRequest((req, res) => {
    return cors(req, res, () => {
        if (req.method !== 'GET') {
            return res.status(401).json({
                message: 'Not allowed'
            })
        }

        let notes = [];

        return database.on('value', (snapshot) => {
            snapshot.forEach((item) => {
                notes.push({
                    id: item.key,
                    address: item.val().address,
                    description: item.val().description,
                    imageUrl: item.val().imageUrl,
                    lat: item.val().lat,
                    lon: item.val().lon,
                    userId: item.val().userId,

                });

            });

            res.status(200).json(notes)
        }, (error) => {
            res.status(error.code).json({
                message: `Something went wrong. ${error.message}`
            })
        }
        )
    }
    )
})
exports.getNotesById = functions.https.onRequest((req, res) => {
    return cors(req, res, () => {
        if (req.method !== 'GET') {
            return res.status(401).json({
                message: 'Not allowed'
            })
        }
        const id = req.query.id
        let dbNoteRef = database.child(`/${id}`);
        return dbNoteRef.once('value', (snapshot) => {
            let note = snapshot.val();
            res.status(200).json(note)
        }, (error) => {
            res.status(error.code).json({
                message: `Something went wrong. ${error.message}`
            })
        }
        )
    }
    )
})

exports.delete = functions.https.onRequest((req, res) => {
    return cors(req, res, () => {
        if (req.method !== 'DELETE') {
            return res.status(401).json({
                message: 'Not allowed'
            })
        }
        const id = req.query.id
        database.child(`/${id}`).remove();
        res.status(200).json({ message: `Added Deleted` })
    }, (error) => {
        res.status(error.code).json({
            message: `Something went wrong. ${error.message}`
        })
    }
    )
})