// var http = require('http');
// var express = require('express');
// const fs = require('fs');
// // const session = require('express-session');
// const socket = require('socket.io');

// var app = express();
// app.set('view engine', 'ejs');
// app.set('views', './views');
// app.set('static', './static');
// app.use( express.static('./static', { etag: false } ) );
// app.set('etag', false);
// app.use(express.urlencoded({ extended: true }));
// app.use(express.json());

// var server = http.createServer(app);
// var io = socket(server);
// server.listen(process.env.PORT || 3000, () => console.log('Server started on http://localhost:3000/'));

function main() {
    var logic = require('./game_logic');
    var server = require("./server");
    app = server.app;
    io = server.io;
    var games = {};// "mapa" ktora przenosi id_gry na OFICJALNY stan gry
    //każda wartość w mapie games jest instancja klasy (czyli obiekt) która przetrzymuje PEŁNĄ informacje o danej grze
    
    function emit_game(data) {
        io.emit('vis_update',data);
    }
    
    app.get("/Coup/:game_id", (req, res) => {
        // var game_id = req.params.game_id;
        // var handle = "..."; //który użytkownik zawołał get
        
        // if(!(game_id in games)) {
        //     res.render(visualization_game_not_found(game_id,handle));
        //     return;
        // }
        // var game = games[game_id];
    
    
    
        res.render('index_vis');
    });
    
    // app.post("/Coup/:game_id", (req, res) => {
    //     // var game_id = req.params.game_id;
    //     // if(!(game_id in games)) {
    //     //     res.render(visualization_game_not_found(game_id,handle));
    //     //     return;
    //     // }
    //     // var game = games[game_id];
    //     // var handle = "..."; //który użytkownik zawołał post
    //     // var action = "..."; //jaka akcja została wykonana
    
    //     // handle_action(game,handle,action);//zmienia zmienną game! i tym bardziej ją w mapie!
    
    //     // res.render(visualization_post(game,handle));
    //     res.render(index);
    // });
    
    io.on('connection', function(socket) {
        console.log('client connected:' + socket.id);
    
    });
       
    console.log( 'server listens' );
    
    
    var p1 = new logic.Player("Jan"), p2 = new logic.Player("CyprJan");
    var game = new logic.Game(1,[p1, p2]);
    
    
    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    async function demo() {
        console.log("Start");
        await sleep(5000); // Opóźnienie 2 sekundy
        console.log("Po 5 sekundach");
        emit_game({game,p1});
    }
    
    demo();
}
main();


module.exports = {main};
