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
var actions = ["income", "foreign_aid", "coup", "exchange", "examine", "steal", "tax", "assassinate"];

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
    turn_owner = new Player("Wildcard"); //tura którego gracza, wartoscia jest instancja klasy Player
    state = 1; //typ (z grafu), który jest aktualnie
    selected_action = "";
    target = ""; // gracz którego dotyczy akcja (nie wszystkie akcje kogoś dotyczą!)
    challanger = ""; //gracz który zchallengował
    blocker = ""; //gracz który zblokował

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
        this.state = 1;

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

    draw_card_from_deck() {
        if(this.deck,length > 0) {
            return this.deck.splice(0,1)[0];
        }
        else {
            throw new Error("Can't draw a card from empty deck!");
        }
    }

    put_card_in_deck(card) {
        let rand_index = lodash.random(this.deck.length);
        this.deck.splice(rand_index,0,card);
    }

    valid_block() {

    }

    valid_action(player,action,source,target) {
        return true;
    }

    character_of_action(action) {
        if(action == "exchange") {
            return "ambassador";
        }
        if(action == "examine") {
            return "inquisitor";
        }
        if(action == "steal") {
            return "captain";
        }
        if(action == "tax") {
            return "duke";
        }
        if(action == "assassinate") {
            return "assasin";
        }
        return "";
    }

    handle_state1(player,action,source,target) {
        this.selected_action = action;
        if(action == "assassinate" || action == "coup" || action == "examine" || action == "steal") {
            this.target = target;
        }
        else {
            this.target = "";
        }
        this.challanger = "";

        this.state = 2;

        console.log("State 1 resolved");
    }

    handle_state2(player,action,source,target) {
        if(action == "challange") {
            this.state = 3;
            this.challanger = source;
        }
        else {
            this.state = 6;
        }
        console.log("State 2 resolved");
    }

    handle_state3(player,action,source,target) {
        if(this.turn_owner.cards.includes(this.character_of_action(this.selected_action))) {
            this.state = 5;
        }
        else {
            this.state = 4;
        }
        console.log("State 3 resolved");
    }

    handle_state4(player,action,source,target) {
        this.turn_owner.cards.splice(this.turn_owner.cards.indexOf(action),1);

        this.state = 14;
        console.log("State 4 resolved");
    }

    handle_state5(player,action,source,target) {
        this.challanger.cards.splice(this.challanger.cards.indexOf(action),1);

        this.challanger.cards.splice(this.turn_owner.cards.indexOf(this.selected_action),1);
        this.put_card_in_deck(this.character_of_action(this.selected_action));
        this.challanger.cards.push(this.draw_card_from_deck());

        this.state = 6;
        console.log("State 5 resolved");
    }

    handle_state6(player,action,source,target) {
        if(this.selected_action == "assassinate")
            this.turn_owner.coins -= 3;

        this.state = 7;
        console.log("State 6 resolved");
    }

    handle_state7(player,action,source,target) {
        if(action == "block") {
            this.state = 8;
            this.blocker = source;
        }
        else {
            this.state = 10;
        }
        console.log("State 7 resolved");
    }

    handle_state8(player,action,source,target) {
        if(action == "challange") {
            this.state = 9;
            this.challanger = source;
        }
        else {
            this.state = 11;
        }
        console.log("State 8 resolved");
    }

    handle_state9(player,action,source,target) {
        // if(this.blocker.cards.includes(this.blocker_of_action(this.selected_action))) {
        if(valid_block()) {
            this.state = 5;
        }
        else {
            this.state = 4;
        }
        console.log("State 9 resolved");
        
    }

    

    handle_action(player,action,source,target) {
        if(this.valid_action(player,action,source,target)) {
            let fn = "handle_state" + this.state;
            this[fn](player,action,source,target);
            console.log("Successful action");
        }
        else {
            console.log("Invalid action");
        }
    }
}

var p1 = new Player("Jan"), p2 = new Player("CyprJan");
var game = new Game(1,[p1, p2]);
game.game_setup();
game.print_game_state();
game.handle_action(p1,"xd","xd","xd");