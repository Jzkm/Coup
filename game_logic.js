/*
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
*/

const lodash = require("lodash");

var characters = ["ambassador","inquisitor","contessa","captain","duke","assasin"];

// UWAGA: Gracz jest nie tym samym co użytnownik strony
// tzn. jeden użytkownik może mieć 2 instancje klasy Player (grając jednocześnie w Coup_room1 i w Coup_room2)
class Player {
    handle = "";
    coins = 0;
    cards = [];

    constructor(handle) {
        this.handle = handle;
    }
}

class Game {
    game_id = 0;
    players = []; //intancja klasy Player
    deck = []; //tablica kart, których nikt nie ma (kolejność MA znaczenie!)
    discard = []; //tablica kart, które zostały odrzucone przez graczy
    turn = 0; //tura którego gracza, wartoscia jest instancja klasy Player
    turn_type = 0; //typ (z grafu), który jest aktualnie
    selected_action = "";
    action_targer = ""; // gracz którego dotyczy akcja (nie wszystkie akcje kogoś dotyczą!)
    interruptor = ""; //gracz który zchallengował właścieciela tury

    constructor(game_id,players) {
        this.game_id = game_id;
        this.players = players;
    }
    
    //wołana na początku gry lub podczas zaczynania ponownej rozgrywki (z tymi samymi graczami i w tym samym pokoju)
    game_setup() {
        this.deck = [];
        for(let character of characters) {
            for(let i=0;i<3;i++)
                this.deck.push(character);
        }
        this.deck = lodash.shuffle(this.deck);

        this.discard = [];
        this.turn = this.players[0];

        for(let player of this.players) {
            player.coins = 2;
            player.cards = this.deck.splice(0,2);
        }

        console.log("Game initialization!");
    }

    print_game_state() {
        console.log("Player's items (name,coins,cards):");
        for(let player of this.players) {
            console.log(player.handle, player.coins, player.cards);
        }

    }
}


var game = new Game(1,[new Player("Jan"), new Player("CyprJan")]);
game.game_setup();
game.print_game_state();