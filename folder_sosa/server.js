var http = require('http');
var fs = require('fs');
var express = require('express');
var expressLayouts = require('express-ejs-layouts');
var cookieParser = require('cookie-parser');
var socket = require('socket.io');

var app = express();
var server = http.createServer(app);
var io = socket(server);

server.listen(process.env.PORT || 3000, () => console.log('Server started on http://localhost:3000/'));
// http.createServer(app).listen(3000, () => console.log('Server started on http://localhost:3000/'));

app.set('view engine', 'ejs');
app.set('views', './views');
app.set('static', './static');
app.use(expressLayouts);
app.use('/static', express.static('static'));
app.use(express.static('static'));
app.use(express.urlencoded({extended:true}));
app.use(cookieParser('uTxss6zP2HWnC0Bd6rU7V6Ym4qjnBUCm7nbJqdPI4lbJkveKPAq9OsuKTJLzLoj7'));

app.disable('etag');
app.set('layout', 'layout');

// var baza_danych = new Map();
// fs.writeFileSync('baza_danych.json', JSON.stringify(Object.fromEntries(baza_danych), null, 2), 'utf8');
var baza_danych = new Map(Object.entries(JSON.parse(fs.readFileSync('baza_danych.json', 'utf8'))));

// var socket_id_to_username = new Map();
var anon_users = new Set();
let tables = [];

// function deleteUser(user) {
//     console.log('usun: ', user);
//     for(let i = 0; i < 100; i++) {
//         for(let j = 0; j < 10; j++) {
//             if(tables[i].players[j] === user) {
//                 tables[i].players[j] = `Player ${j + 1}`;
//                 tables[i].nr--;
//             }
//         }
//     }
// }

io.on('connection', function(socket) {
    console.log('client connected:' + socket.id);

    socket.on('del', function(username) {
        // console.log('deeel');
        // console.log(username);
    })

    // console.log("+ " + socket.id + " => " + username);
    // socket_id_to_username.set(socket.id, username);
    socket.on('disconnect', function(data) {
        // console.log("- " + socket.id);
        // deleteUser(socket_id_to_username.get(socket.id));
        // console.log(data);
        console.log('client disconnected:' + socket.id);
    })
});

for(let i = 1; i <= 100; i++) {
    tables.push({
        players:['Player 1',
            'Player 2', 
            'Player 3',
            'Player 4',
            'Player 5',
            'Player 6',
            'Player 7',
            'Player 8',
            'Player 9',
            'Player 10'
        ], 
        nr: 0
    })
}

function authorize(req, res, next) {
    // console.log('authorize');
    if(!req.cookies.cookie || req.cookies.cookie.maxAge === -1) {
        res.redirect('/');
    }
    else {
        next();
    }
}

function generateRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        result += characters.charAt(randomIndex);
    }
    return result;
}

function createUsername() {
    let username = generateRandomString(16);
    while(anon_users.has(username) || baza_danych.has(username)) {
        username = generateRandomString(16);
    }
    anon_users.add(username);
    return username;
}

app.get('/', (req, res) => {
    // console.log('get /');
    if(!req.cookies.cookie || req.cookies.cookie.maxAge === -1) {
        res.cookie('cookie', {role:'Guest', username:createUsername(), maxAge:3600000 * 24});
        res.redirect('/');
    } 
    else {
        res.render('index');
    }
});

app.get('/login', authorize, (req, res) => {
    // console.log('get /login');
    res.render('login');
});

app.post('/login', authorize, (req, res) => {
    // console.log('post /login');
    let username = req.body.username;
    let password = req.body.password;
    if(baza_danych.has(username) && baza_danych.get(username) === password) {
        anon_users.delete(req.cookies.cookie.username);
        res.cookie('cookie', {role:'User', username:username, maxAge:3600000 * 24});
        res.redirect('/tables');
    } 
    else {
        res.render('login');
    }
})

app.get('/register', authorize, (req, res) => {
    // console.log('get /register');
    res.render('register');
});

app.post('/register', authorize, (req, res) => {
    // console.log('post /register');
    let username = req.body.username;
    let password = req.body.password;
    let confirm_password = req.body.confirm_password;
    if(!baza_danych.has(username) && !anon_users.has(username) && password === confirm_password) {
        anon_users.delete(req.cookies.cookie.username);
        baza_danych.set(username, password);
        fs.writeFileSync('baza_danych.json', JSON.stringify(Object.fromEntries(baza_danych), null, 2), 'utf8')
        res.cookie('cookie', {role:'User', username:username, maxAge:3600000 * 24});
        res.redirect('tables');
    }
    else {
        res.redirect('/register');
    }
})

app.get('/tables', authorize, (req, res) => {
    // console.log('get /tables');
    io.emit('update', JSON.stringify(tables));
    res.render('tables', {tables:tables});
});

app.post('/tables', authorize, (req, res) => {
    // console.log('post /tables');
    io.emit('update', JSON.stringify(tables));
    let sth = 0;
    for(let i = 0; i < 100; i++) {
        for(let j = 0; j < 10; j++) {
            if(tables[i].players[j] === req.cookies.cookie.username) {
                tables[i].players[j] = `Player ${j + 1}`;
                tables[i].nr--;
                sth = 1;
            }
        }
    }
    // console.log(sth);
    if(sth === 0) {
        let nr = 0;
        for(let i = 100; i >= 1; i--) {
            if(tables[i - 1].nr === 0) {
                nr = i;
            }
        }
        if(nr === 0) {
            res.redirect('/tables');
        }
        else {
            // console.log(`go to room #${nr}`);
            res.redirect(`table/${nr}`);
        }
    }
    else {
        res.redirect('/tables');
    }
});

app.get('/table/:id', authorize, (req, res) => {
    // console.log(`get /table/${req.params.id}`);
    let tableId = req.params.id;
    // console.log(`im here: ${tableId}`);
    if(tableId >= 1 && tableId <= 100) {
        // console.log(tables[tableId - 1]);
        tables[tableId - 1].nr++;
        for(let i = 0; i < 10; i++) {
            // console.log(tables[tableId - 1].players[i], `Player ${i + 1}`);
            if(tables[tableId - 1].players[i] === `Player ${i + 1}`) {
                tables[tableId - 1].players[i] = req.cookies.cookie.username;
                break;
            }
        }
        // console.log(tables[tableId - 1]);
        io.emit('update', JSON.stringify(tables));
        res.render('table', {tableId: tableId, table: tables[tableId - 1], username:req.cookies.cookie.username});
        // console.log("+ " + socket.id + " => " + req.cookies.cookie.username);
        // socket_id_to_username.set(socket.id, req.cookies.cookie.username);
    }
    else {
        res.render('404');
    }
});

app.get('/rules', authorize, (req, res) => {
    // console.log('get /rules');
    res.render('rules');
});

app.get('/profile', authorize, (req, res) => {
    // console.log('get /profile');
    res.render('profile', {role:req.cookies.cookie.role, username:req.cookies.cookie.username});
});

app.post('/profile', authorize, (req, res) => {
    // console.log('post /profile');
    anon_users.delete(req.cookies.cookie.username);
    res.cookie('cookie', {maxAge: -1});
    res.redirect('/');
});

app.use((req,res) => {
    // console.log('use /404');
    res.render('404');
});