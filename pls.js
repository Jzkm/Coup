var http = require('http');
var express = require('express');
const fs = require('fs');
const session = require('express-session');

const csrfProtection = csrf({ cookie: true });


var app = express();
app.set('view engine', 'ejs');
app.set('views', './views');
app.use( express.static('./static', { etag: false } ) );
app.set('etag', false);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());





app.get("/Coup", (req, res) => {
    //damian daje nam graczy
});

app.post("/Coup", (req, res) => {
   
});




http.createServer(app).listen(3000);