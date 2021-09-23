import express from 'express';
const port = 8080;

const app = express();
app.use(express.static('public'))

app.listen(port, () => {
    console.log(`Container app listening at http://localhost:${port}`)
})