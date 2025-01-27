var http = require('http');
var express = require('express');
const fs = require('fs');
const session = require('express-session');


var app = express();
app.set('view engine', 'ejs');
app.set('views', './views');
app.use( express.static('./static', { etag: false } ) );
app.set('etag', false);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());



var games = {};//"mapa" ktora przenosi id_gry na OFICJALNY stan gry
//każda wartość w mapie games jest instancja klasy (czyli obiekt) która przetrzymuje PEŁNĄ informacje o danej grze


generic_player = {
    handle: "DAMSOS",
    coins: 0,
    cards: [], //tablica kart które ma dany gracz
};

generic_game = {
    game_id: 123,
    players: ["Jan","DamJan","CyprJan"], //unikatowe "handle"
    deck: [], //tablica kart, których nikt nie ma (kolejność MA znaczenie!)
    discard: [], //tablica kart, które zostały odrzucone przez graczy
    turn: "DAMSOS", //tura którego gracza
    turn_type: 0, //typ (z grafu), który jest aktualnie
    selected_action: "take one coin",
    action_targer: "DAMSOS", // gracz którego dotyczy akcja (nie wszystkie akcje kogoś dotyczą!)
    interruptor: "DAMSOS", //gracz który zchallengował właścieciela tury
};

class Game {
    game_id = 0;
    players = ["Jan","DamJan","CyprJan"]; //unikatowe "handle"
    deck = []; //tablica kart, których nikt nie ma (kolejność MA znaczenie!)
    discard = []; //tablica kart, które zostały odrzucone przez graczy
    turn = "DAMSOS"; //tura którego gracza
    turn_type = 0; //typ (z grafu), który jest aktualnie
    selected_action = "take one coin";
    action_targer = "DAMSOS"; // gracz którego dotyczy akcja (nie wszystkie akcje kogoś dotyczą!)
    interruptor = "DAMSOS"; //gracz który zchallengował właścieciela tury

    constructor(game_id) {
        this.game_id = game_id;


    }
}

app.get("/Coup/:game_id", (req, res) => {
    var game_id = req.params.game_id;
    var handle = "..."; //który użytkownik zawołał get
    
    if(!(game_id in games)) {
        res.render(visualization_game_not_found(game_id,handle));
        return;
    }
    var game = games[game_id];



    res.render(visualization_get(game,handle));
});

app.post("/Coup/:game_id", (req, res) => {
    var game_id = req.params.game_id;
    if(!(game_id in games)) {
        res.render(visualization_game_not_found(game_id,handle));
        return;
    }
    var game = games[game_id];
    var handle = "..."; //który użytkownik zawołał post
    var action = "..."; //jaka akcja została wykonana

    handle_action(game,handle,action);//zmienia zmienną game! i tym bardziej ją w mapie!

    res.render(visualization_post(game,handle));
});




http.createServer(app).listen(3000);