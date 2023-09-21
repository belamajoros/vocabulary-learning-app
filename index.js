const express = require('express');
const app = express();
const cors = require("cors");
const pool = require('./db');
const translate = require('@vitalets/google-translate-api');
var Lemmer = require('lemmer');
const PORT = process.env.PORT || 4321;
const path = require('path');
const fs = require('fs');
const pdf = require('pdf-parse');
const mammoth = require('mammoth');
const multer = require('multer');
const format = require('pg-format');
const sw = require('stopword')
var checkWord = require('check-if-word');


//middleware
app.use(cors());
app.use(express.json());

if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "client/build")))
    app.use((req, res, next) => {
        if (req.header('x-forwarded-proto') !== 'https')
          res.redirect(`https://${req.header('host')}${req.url}`)
        else
          next()
    })
}

app.post('/library', async(req, res) => {
    try {
        const { userid, title, text, word_count, language_learn, language_first} = req.body;
        const newText = await pool.query("INSERT INTO library (userid, title, text, word_count, language_learn, language_first) VALUES($1,$2,$3,$4,$5,$6) ON CONFLICT DO NOTHING RETURNING *", [userid, title, text, word_count, language_learn, language_first])
        res.json(newText.rows[0]);
    } catch (err) {
        console.error(err.message)
    }
})

app.get('/library/:userid/:language_learn/:language_first', async(req, res) =>{
    try {
        const { userid, language_learn, language_first } = req.params;
        const allText = await pool.query("SELECT id, title, text, added_on, word_count FROM library WHERE userid = $1 AND language_learn = $2 AND language_first = $3", [userid, language_learn, language_first])
        res.json(allText.rows)
    } catch (err) {
        console.error(err.message)
    }
})

app.delete('/library', async(req, res) => {
    try {
        const { idOfTexts } = req.body;
        quer = format("DELETE FROM library WHERE id IN (%L)", idOfTexts)
        await pool.query(quer, [])
        res.json('Texts were deleted')
    } catch (err) {
        console.log(err.message)
    }
})

app.get('/words/:userid/:learned/:language_learn/:language_first', async(req, res) =>{
    try {
        const { userid, learned, language_learn, language_first } = req.params;
        const allWords = await pool.query("SELECT word FROM words WHERE userid = $1 AND learned = $2 AND language_learn = $3 AND language_first = $4", [userid, learned, language_learn, language_first])
        var arr = allWords.rows.map(function(item) { return item['word']; });
        res.json(arr)
    } catch (err) {
        console.error(err.message)
    }
})

app.get('/words_translations/:userid/:language_learn/:language_first', async(req, res) =>{
    try {
        const { userid, language_learn, language_first } = req.params;
        const allWords = await pool.query("SELECT id, word, learned FROM words WHERE userid = $1 AND language_learn = $2 AND language_first = $3", [userid, language_learn, language_first])
        res.json(allWords.rows)
    } catch (err) {
        console.error(err.message)
    }
})


const upload = multer()
app.post('/pdf', upload.single('file'), async function(req, res, next) {
    let dataBuffer = fs.readFileSync(req.file.path)
    pdf(dataBuffer).then(function(data){
        res.json(data.text)
    }).catch((err) => { console.log(err.message) })
})

app.post('/docx', upload.single('file'), async function(req, res, next) {
    mammoth.extractRawText({path: req.file.path }).then(function(data){
        res.json(data.value)
    }).catch((err) => { console.log(err.message) }).done()
})


app.post('/addWords', async(req, res) => {
    try {
        const { userid, words, learned, language_learn, language_first } = req.body;
        var toAdd = []
        for (let i = 0; i < words.length; i++){
            toAdd.push([userid, words[i], learned, language_learn, language_first])
        }
        quer = format("INSERT INTO words (userid, word, learned, language_learn, language_first) VALUES %L ON CONFLICT(word, language_first, language_learn) DO UPDATE SET learned = %L RETURNING *", toAdd, learned)
        await pool.query(quer,[])
        res.json()
    } catch (err) {
        console.log(err.message)
    }
})

app.post('/words', async(req, res) => {
    try {
        const { userid, words, learned, language_learn, language_first } = req.body;
        var wordsFiltered = sw.removeStopwords(words, [sw.en])
        var allData = []
        resp = await pool.query("SELECT word FROM english_words WHERE word = ANY ($1)",[wordsFiltered])
        resp = resp.rows.map(function (obj) { return obj.word })
        for (let i = 0; i < resp.length; i++){
            var wrd = await Lemmer.lemmatize(resp[i])
            allData.push([userid, wrd, learned, language_learn, language_first])
        }
        quer = format("INSERT INTO words (userid, word, learned, language_learn, language_first) VALUES %L ON CONFLICT DO NOTHING RETURNING *", allData)
        await pool.query(quer,[])
        res.json()
    } catch(err) {
        console.error(err.message)
    }
})

app.post('/updateWords', async(req, res) => {
    try {
        const { idOfWords } = req.body;
        quer = format("UPDATE words SET learned = true WHERE id IN (%L) RETURNING *", idOfWords)
        await pool.query(quer, [])
        res.json('Texts were updated')
    } catch (err) {
        console.error(err.message)
    }
})


app.get('/translate/:word/:language_learn/:language_first', async(req, res) => {
    try {
        const { word, language_learn, language_first } = req.params;
        const translatedWord = await translate(word, {from: language_learn, to: language_first});
        res.json(translatedWord.text)
    } catch (err) {
        console.error(err.message)
    }
})

app.post('/wordform', async(req, res) => {
    try {
        const { words } = req.body;
        var wordsFiltered = sw.removeStopwords(words, [sw.en])
        var resp = await pool.query("SELECT word FROM english_words WHERE word = ANY ($1)",[wordsFiltered])
        resp = resp.rows.map(function (obj) { return obj.word })
        var start = new Date().getTime()
        let file = fs.readFileSync('lemma.en.txt', 'utf8')
        let arr = file.split(/\r?\n/)//
        arr.forEach((line)=> {
            line.split('> ')[1].split(",").some(r => {
                if(resp.includes(r)){
                    if(line.includes('/')){
                        var root = line.split('/')[0]
                    } else {
                        var root = line.split(' ')[0]
                    }
                    resp = resp.filter(item => item != r)
                    resp.push(root)
                }
            })
        });
        var end = new Date().getTime();
        var time = end - start;
        console.log("Execution time: "+time)
        var removeDups = resp.flat(1)
        removeDups = removeDups.filter(function(elem, pos) {
            return removeDups.indexOf(elem) == pos;
        })
        res.send(removeDups)
    } catch (err) {
        console.error(err.message)
    }
})

app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "client/build/index.html"));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});