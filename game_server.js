var logic = require('./game_logic');
var server = require("./server");
const cookie = require('cookie');
app = server.app;
io = server.io;
var games = {};// "mapa" ktora przenosi id_gry na OFICJALNY stan gry
//każda wartość w mapie games jest instancja klasy (czyli obiekt) która przetrzymuje PEŁNĄ informacje o danej grze

function emit_game(data) {
    io.emit('vis_update',data);
}

app.get("/Coup/:game_id", (req, res) => {
    var game_id = req.params.game_id;
    var username = req.cookies.cookie.username;


    if(game_id in games) {
        let player_in_lobby = false;
        var game = games[game_id];
        var player;
        for(let plr of game.players) {
            if(plr.cookie == username) {
                player_in_lobby = true;
                player = plr;
            }
        }
        if(!player_in_lobby) {
            player = game.players[0];
        }

        if(player_in_lobby) {
            res.render('index_vis');
            emit_game({game,player});
        }
        else {
            //tutaj można dodać playera który jest obserwatorem rozgrywki
            res.render('index_vis');
            emit_game({game,player});
        }
    }
    else {
        res.render('404');
    }
});

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
    

    const cookies = cookie.parse(socket.handshake.headers.cookie || '');
    console.log('Cookies:', cookies);
    socket.on('ping', function(socket) {
        var player = p1;
        emit_game({game,player});
    });

    socket.on('action_taken', function(data) {
        action = data.action;
        source = data.source;
        target = data.target;
        game.handle_action(p1,action,source,target);
        var player = p1;
        emit_game({game,player});
    });
});

// var p1 = new logic.Player("Jan"), p2 = new logic.Player("CyprJan");
// var game = new logic.Game(1,[p1, p2]);
// game.game_setup();


