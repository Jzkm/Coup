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

var characters = ["ambassador","inquisitor","contessa","captain","duke","assasin"];

// UWAGA: Gracz jest nie tym samym co użytnownik strony
// tzn. jeden użytkownik może mieć 2 instancje klasy Player (grając jednocześnie w Coup_room1 i w Coup_room2)
class Player {
    handle = "";
    coins = 0;
    cards = [];

    constructor(handle) {
        this.handle = handle;
        this.coins = 2;
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
        
        for(let character of characters) {
            for(let i=0;i<3;i++)
                this.deck.push(character);
        }

        this.turn = this.players[0];
    }
}