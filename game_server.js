var logic = require('./game_logic');
var server = require("./server");
const cookie = require('cookie');
app = server.app;
io = server.io;
var games = {};// "mapa" ktora przenosi id_gry na OFICJALNY stan gry
//każda wartość w mapie games jest instancja klasy (czyli obiekt) która przetrzymuje PEŁNĄ informacje o danej grze
var table_of_user = {};
var player_of_user = {};
var users_sitting_in_tables = {};
var challenge_counter = {};
// var game_of_user
//mapuje username na id_stołu

function emit_game(data) {
    io.emit('vis_update',data);
}

app.get("/Coup/:game_id", (req, res) => {
    var game_id = req.params.game_id;
    var username = req.cookies.cookie.username;

    // for(let i = 0; i < 10; i++) {
    //     if(server.tables[game_id - 1].players[i] !== `Player ${i + 1}`) {
    //         console.log(server.tables[game_id - 1].players[i]);
    //     }
    // }
    console.log("To są wszystkie games:");
    console.log(games);
    if(game_id in games) {
        if(!(game_id in users_sitting_in_tables))
            users_sitting_in_tables[game_id] = 1;
        else
            users_sitting_in_tables[game_id] += 1;
            
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

// function init_game(game,table_id) {
//     io.sockets.sockets.forEach((clientsocket) => {
//         let username = cookie.parse(clientsocket.handshake.headers.cookie);
//         username = JSON.parse(username.cookie.slice(2)).username;
//         if(server.tables[table_id - 1].players.includes(username)) {
//             player = player_of_user[username];
//             clientsocket.emit("vis_update",{game,player});
//         }
//     });
// }

function send_game(game,table_id) {
    io.sockets.sockets.forEach((clientsocket) => {
        let username = cookie.parse(clientsocket.handshake.headers.cookie);
        username = JSON.parse(username.cookie.slice(2)).username;
        console.log("wysylanie stanu poczatkowego");
        console.log(table_of_user[username]);
        console.log(table_id);
        if(table_of_user[username] == table_id) {
            let player = player_of_user[username];
            console.log("wszedlem to tego ifa!!!");
            clientsocket.emit("vis_update",{game,player});
        }
    });
}

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
    socket.on('ping', function(data) {
        let origuser = cookie.parse(socket.handshake.headers.cookie);
        origuser = JSON.parse(origuser.cookie.slice(2)).username;
        table_id = table_of_user[origuser];
        let game = games[table_id];

        io.sockets.sockets.forEach((clientsocket) => {
            let username = cookie.parse(clientsocket.handshake.headers.cookie);
            username = JSON.parse(username.cookie.slice(2)).username;
            // console.log("wysylanie stanu poczatkowego");
            // console.log(table_of_user[username]);
            // console.log(table_id);
            if(table_of_user[username] == table_id) {
                let player = player_of_user[username];
                // console.log("wszedlem to tego ifa!!!");
                clientsocket.emit("vis_update",{game,player});
            }
        });
    });

    socket.on('challenge', function(data) {
        let cou
        let username = cookie.parse(socket.handshake.headers.cookie);
        username = JSON.parse(username.cookie.slice(2)).username;
        let player = player_of_user[username]
        let table_id = table_of_user[username];
        let game = games[table_id];
        action = data.action;
        source = data.source;
        target = data.target;

        if(action == "challenge") {
            game.handle_action(player,action,source,target);

            send_game(game,table_id);
        }
        else {
            if(!(game_id in challenge_counter)) {
                challenge_counter[game_id] = 0;
            }
            challenge_counter[game_id]++;
            if(challenge_counter[game_id] == game.players.length) {
                challenge_counter[game_id] = 0;
                game.handle_action(player,"no_challenge",source,target);

                send_game(game,table_id);
            }
        }
    });

    socket.on('action_taken', function(data) {
        let username = cookie.parse(socket.handshake.headers.cookie);
        username = JSON.parse(username.cookie.slice(2)).username;
        let player = player_of_user[username]
        let table_id = table_of_user[username];
        let game = games[table_id];
        action = data.action;
        source = data.source;
        target = data.target;

        console.log("Tak wyglada gra przed update:");
        console.log(game);

        game.handle_action(player,action,source,target);

        console.log("Tak wyglada gra po update:");
        console.log(game);

        send_game(game,table_id);

        // io.sockets.sockets.forEach((clientsocket) => {
        //     let username = cookie.parse(clientsocket.handshake.headers.cookie);
        //     username = JSON.parse(username.cookie.slice(2)).username;
        //     console.log("wysylanie stanu poczatkowego");
        //     console.log(table_of_user[username]);
        //     console.log(table_id);
        //     if(table_of_user[username] == table_id) {
        //         let player = player_of_user[username];
        //         console.log("wszedlem to tego ifa!!!");
        //         clientsocket.emit("vis_update",{game,player});
        //     }
        // });
    });
    socket.on('redirect', function(data) {
        console.log("Dostałem redirect i jestem serwerem");
        let table_id = data.table_id;
        // socket.broadcast.emit("redirect",{});
        // socket.emit("redirect",{});
        let players = [];
        console.log("Iteruje sie po ciastakach:");
        io.sockets.sockets.forEach((clientsocket) => {
            let username = cookie.parse(clientsocket.handshake.headers.cookie);
            console.log("Ciastko aktualnego clienta:");
            username = JSON.parse(username.cookie.slice(2)).username;
            console.log(username);
            console.log(`Username'y przy tym stole:`);
            console.log(server.tables[table_id - 1].players);
            if(server.tables[table_id - 1].players.includes(username)) {
                console.log(`Robie redirect dla uzytkownika o ciasteczku ${cookies.username}`);
                // clientsocket.emit("redirect",{});
                let p = new logic.Player(username);
                players.push(p);
                table_of_user[username] = table_id;
                player_of_user[username] = p;
            }
        });
        let game = new logic.Game(table_id,players);
        game.game_setup();
        games[table_id] = game;
        io.sockets.sockets.forEach((clientsocket) => {
            let username = cookie.parse(clientsocket.handshake.headers.cookie);
            username = JSON.parse(username.cookie.slice(2)).username;
            if(server.tables[table_id - 1].players.includes(username)) {
                clientsocket.emit("redirect",{});
            }
        });

        // let debil = 0;
        // while(users_sitting_in_tables[table_id] < games[table_id].players.length || users_sitting_in_tables[table_id] == undefined){
        //     debil++;
        // }
        // console.log("Siedzacy ludzie:");
        // console.log(users_sitting_in_tables[table_id]);
        // console.log(games[table_id].players.length);

        // io.sockets.sockets.forEach((clientsocket) => {
        //     let username = cookie.parse(clientsocket.handshake.headers.cookie);
        //     username = JSON.parse(username.cookie.slice(2)).username;
        //     console.log("wysylanie stanu poczatkowego");
        //     console.log(table_of_user[username]);
        //     console.log(table_id);
        //     if(table_of_user[username] == table_id) {
        //         let player = player_of_user[username];
        //         console.log("wszedlem to tego ifa!!!");
        //         clientsocket.emit("vis_update",{game,player});
        //     }
        // });
    });
});

// var p1 = new logic.Player("Jan"), p2 = new logic.Player("CyprJan");
// var game = new logic.Game(1,[p1, p2]);
// game.game_setup();


