require('dotenv').config({ path: __dirname + '/.env' });
const express = require('express');
const app = express();
const AWS = require('aws-sdk');
const multer = require('multer');
const port = 3000;

app.use(express.static('./views'));
app.set('view engine', 'ejs');
app.set('views', './views');
app.use(express.urlencoded({
    extended: true
}));
app.use(express.json());

//middleware
const convertFormToJson = multer();

//config AWS

AWS.config.update({
    region: process.env.AWS_DEFAULT_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const docClient = new AWS.DynamoDB.DocumentClient();


const tableName = 'product';

app.get('/', (req, res) => {
    // query from db
    const params = {
        TableName: tableName
    };

    docClient.scan(params, (err, data) => {
        if (err) {
            return res.send('Internal server error');
        } else {
            return res.render('index', { data: data.Items });
        }
    });
});


app.post('/', convertFormToJson.fields([]), (req, res) => {
    //get data user send to server
    const { id, name } = req.body;
    const params = {
        TableName: tableName,
        Item: {
            id, 
            name
        }
    };

    docClient.put(params, (err, data) => {
        if (err) {
            return res.send('Internal server error');
        } else {
            return res.redirect('/');
        }
    });
});

app.post('/delete', convertFormToJson.fields([]), (req, res) => {
    console.log(req.body);
    return res.redirect('/');
});


app.listen(port, () => {
    console.log('Server is running on port: ' + `${port}`)
});