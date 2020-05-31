import { https } from "firebase-functions";
import express from "express";
import cors from "cors";
import { initializeApp, database as _database } from "firebase-admin";

initializeApp();
const database = _database().ref('/notes');


const app = express();
app.use(cors({ origin: true }))

app.get("/", (req, res) => {

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
})

app.post("/", async (req, res) => {
    const notes = req.body;
    await database.push(notes);
    res.status(200).json({ message: `Added successFully` })
}, (error) => {
    res.status(error.code).json({
        message: `Something went wrong. ${error.message}`
    })
})


app.put("/:id", async (req, res) => {
    const body = req.body;
    await database.child(req.params.id).update(body);

    res.status(200).send()
});

app.get("/:id", async (req, res) => {
    let dbNoteRef = database.child(req.params.id);
    return await dbNoteRef.once('value', (snapshot) => {
        let note = snapshot.val();
        res.status(200).json(note)
    }, (error) => {
        res.status(error.code).json({
            message: `Something went wrong. ${error.message}`
        })
    }
    )
})

app.delete("/:id", async (req, res) => {
    await database.child(req.params.id).remove();
    res.status(200).json({ message: `Added Deleted` })
})


export const notes = https.onRequest(app);