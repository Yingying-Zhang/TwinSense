var express = require('express');
var app = express();


var app = express();
app.use(express.json()); // JSON parser for post request
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept"); // For POST CORS Error
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, PUT');
    next();
});

//var sensorsJsonFile = __dirname+'/data.json'

app.get('/json_data', function(req, res) {
    const data = require('./data.json'); 
    res.json(data);
});



const port = 8000
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})