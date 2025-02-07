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
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

var characters = ["ambassador","contessa","captain","duke","assassin"];
var actions = ["income", "foreign_aid", "coup", "exchange", "steal", "tax", "assassinate"];

// UWAGA: Gracz jest nie tym samym co użytnownik strony
// tzn. jeden użytkownik może mieć 2 instancje klasy Player (grając jednocześnie w Coup_room1 i w Coup_room2)
class Player {
    handle = "";
    coins = 0;
    cards = [];

    constructor(handle) {
        this.handle = handle;
    }

    toString() {
        return this.handle;
    }
}

class Game {
    game_id = 0;
    players = []; //intancja klasy Player
    deck = []; //tablica kart, których nikt nie ma (kolejność MA znaczenie!)
    discard = ""; //ostatnia karta, które zostały odrzucona przez graczy
    turn_owner = new Player("Wildcard"); //tura którego gracza, wartoscia jest instancja klasy Player
    state = 1; //typ (z grafu), który jest aktualnie
    selected_action = "";
    target = ""; // gracz którego dotyczy akcja (nie wszystkie akcje kogoś dotyczą!)
    challenger = ""; //gracz który zchallengował
    blocker = ""; //gracz który zblokował
    blocking_with = "";
    players_alive = 0;
    winner = "";

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
        this.winner = "";

        this.discard = [];
        this.turn_owner = this.players[0];
        this.state = 1;
        this.players_alive = this.players.length;

        for(let player of this.players) {
            player.coins = 8;
            player.cards = this.deck.splice(0,2);
        }

        console.log("Game initialization!");
    }

    print_game_state() {
        console.log("Game state: " + this.state);
        console.log("Turn of player: " + this.turn_owner);
        console.log("Selected action: " + this.selected_action);
        console.log("Target: " + this.target);
        console.log("Challenger: " + this.challenger);
        console.log("Blocker: " + this.blocker);
        console.log("Player's items (name,coins,cards):");
        for(let player of this.players) {
            console.log(player.handle, player.coins, player.cards);
        }
        console.log();

    }

    draw_card_from_deck() {
        if(this.deck.length > 0) {
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

    character_of_action(action) {
        if(action == "exchange") {
            return "ambassador";
        }
        if(action == "steal") {
            return "captain";
        }
        if(action == "tax") {
            return "duke";
        }
        if(action == "assassinate") {
            return "assassin";
        }
        return "";
    }

    // zwraca listę characterów które mogą zblokować dany action
    blocker_of_action(action) {
        if(action == "foreign_aid") {
            return ["duke"];
        }
        if(action == "steal") {
            return ["captain","ambassador"];
        }
        if(action == "assassinate") {
            return ["contessa"];
        }
        return "";
    }

    // sprawdza czy this.blocker ma karty potrzebne do zblokowania this.selected_action
    valid_block() {
        return this.blocker.cards.includes(this.blocking_with);
    }

    valid_action(player,action,source,target) {
        let ct = 0;
        for(let plr of this.players) {
            if(plr.cards.length > 0) {
                ct++;
            }
        }
        this.players_alive = ct;

        if(player.cards.length == 0 && this.turn_owner.handle == player.handle) {
            this.state = 1;
            this.turn_owner = this.next_player_turn();
        }

        return player.cards.length > 0;
    }

    is_end(player,action,source,target) {
        let ct = 0;
        for(let plr of this.players) {
            if(plr.cards.length > 0) {
                ct++;
            }
        }
        return ct == 1;
    }

    next_player_turn() {
        var idx = 0;
        while(idx < this.players.length) {
            if(this.players[idx].handle == this.turn_owner.handle)
                break;
                
            idx++;
        }

        idx = (idx + 1) % (this.players.length);
        return this.players[idx];
    }


    resolve_action(action) {
        if(this.selected_action == "coup") {
            // console.log("Target:");
            // console.log(this.target);
            // console.log("Karty przed:");
            // console.log(this.target.cards);

            this.discard = action;
            this.target.cards.splice(this.target.cards.indexOf(action),1);

            // console.log("Karty po:");
            // console.log(this.target.cards);
            // console.log("Cała gra:");
            // console.log(this);
            // console.log("coup");
            // console.log("Karty graczy:");
            // console.log(this.players[0].cards);
            // console.log(this.players[1].cards);
        }
        else if(this.selected_action == "exchange") {
            action = action.split(" ");
            let card3 = action[0];
            let card4 = action[1];
            this.turn_owner.cards.splice(this.turn_owner.cards.indexOf(card3),1);
            this.turn_owner.cards.splice(this.turn_owner.cards.indexOf(card4),1);

            this.put_card_in_deck(card3);
            this.put_card_in_deck(card4);
            console.log("exchange");
        }
        else if(this.selected_action == "assassinate") {
            this.discard = action;
            if(this.target.cards.length > 0)
                this.target.cards.splice(this.target.cards.indexOf(action),1);
            console.log("assasinate");
        }
        else if(this.selected_action == "income") {
            this.turn_owner.coins += 1;
            console.log("income");
        }
        else if(this.selected_action == "foreign_aid") {
            this.turn_owner.coins += 2;
            console.log("foreign_aid");
        }
        else if(this.selected_action == "steal") {
            if(this.target.coins >= 2) {
                this.target.coins -= 2;
                this.turn_owner.coins += 2;
            }
            else if(this.target.coins == 1) {
                this.target.coins -= 1;
                this.turn_owner.coins += 1;
            }
            console.log("steal");
        }
        else if(this.selected_action == "tax") {
            this.turn_owner.coins += 3;
            console.log("tax");
        }
        else {
            console.log("Action name not found!");
        }
        console.log("Action resolved!");
    }

    handle_state1(player,action,source,target) {
        // console.log("XDDDDDD " + action + " " + target);
        this.selected_action = action;
        if(action == "assassinate" || action == "coup" || action == "steal") {
            for(var plr of this.players) {
                if(plr.handle == target.handle) {
                    this.target = plr;
                }
            }
        }
        else {
            this.target = "";
        }
        this.challenger = "";

        if(this.selected_action == "coup" || this.selected_action == "foreign_aid" || this.selected_action == "income") {
            this.state = 6;
            this.handle_action(player,"pay_for_action","","");
        }
        else {
            this.state = 2;
        }
        console.log("State 1 resolved");
    }

    handle_state2(player,action,source,target) {
        if(action == "challenge") {
            this.state = 3;
            for(var plr of this.players) {
                if(plr.handle == source.handle) {
                    this.challenger = plr;
                }
            }
            this.handle_action(player,"show_card","","");
        }
        else {
            this.state = 6;
            this.handle_action(player,"pay_for_action","","");
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
        this.discard = action;
        this.state = 14;
        console.log("State 4 resolved");
        this.handle_action(player,"failed","","");
    }

    handle_state5(player,action,source,target) {
        this.challenger.cards.splice(this.challenger.cards.indexOf(action),1);
        this.discard = action;

        this.turn_owner.cards.splice(this.turn_owner.cards.indexOf(this.character_of_action(this.selected_action)),1);
        this.put_card_in_deck(this.character_of_action(this.selected_action));
        this.turn_owner.cards.push(this.draw_card_from_deck());

        this.state = 6;
        this.handle_action(player,"pay_for_action","","");
        console.log("State 5 resolved");
    }

    handle_state6(player,action,source,target) {
        if(this.selected_action == "assassinate")
            this.turn_owner.coins -= 3;
        if(this.selected_action == "coup")
            this.turn_owner.coins -= 7;
        if(this.selected_action == "coup" || this.selected_action == "income" || this.selected_action == "exchange" || this.selected_action == "tax") {
            this.state = 10;
            this.handle_action(player,"resolve_action","","");
        }
        else {
            this.state = 7;
        }
        console.log("State 6 resolved");
    }

    handle_state7(player,action,source,target) {
        if(action != "no_block") {
            console.log(source);
            this.state = 8;
            for(var plr of this.players) {
                if(plr.handle == source.handle) {
                    this.blocker = plr;
                }
            }
            this.blocking_with = action;
        }
        else {
            this.state = 10;

            this.handle_action(player,"resolve_action","","");
        }
        console.log("State 7 resolved");
    }

    handle_state8(player,action,source,target) {
        if(action == "challenge") {
            this.state = 9;
            this.challenger = this.turn_owner;
            this.handle_action(player,"show_card","","");
        }
        else {
            this.state = 11;
            this.handle_action(player,"blocked","","");
        }
        console.log("State 8 resolved");
    }

    handle_state9(player,action,source,target) {
        // if(this.blocker.cards.includes(this.blocker_of_action(this.selected_action))) {
        if(this.valid_block()) {
            this.state = 12;
        }
        else {
            this.state = 13;
        }
        console.log("State 9 resolved");
        
    }

    handle_state10(player,action,source,target) {
        // rozwiąż akcje poza 

        if(this.selected_action == "exchange") {
            let card1 = this.draw_card_from_deck();
            let card2 = this.draw_card_from_deck();
            this.turn_owner.cards.push(card1);
            this.turn_owner.cards.push(card2);
        }
        else if(this.selected_action == "assassinate" && this.target.cards.length == 0) {
            this.state = 14;
            this.handle_action(player,"failed","","");
        }
        this.state = 14;
        
        console.log("State 10 resolved");
    }

    handle_state11(player,action,source,target) {
        console.log("State 11 resolved");
        this.state = 14;
        this.handle_action(player,"failed","","");
    }

    handle_state12(player,action,source,target) {
        this.challenger.cards.splice(this.challenger.cards.indexOf(action),1);
        this.discard = action;

        this.blocker.cards.splice(this.blocker.cards.indexOf(this.blocker_of_action(this.selected_action)),1);
        this.put_card_in_deck(this.blocker_of_action(this.selected_action));
        this.blocker.cards.push(this.draw_card_from_deck());

        this.state = 11;
        console.log("State 12 resolved");
    }

    handle_state13(player,action,source,target) {
        this.blocker.cards.splice(this.blocker.cards.indexOf(action),1);
        this.discard = action;

        this.state = 10;
        this.handle_action(player,"resolve_action","","");
        console.log("State 13 resolved");
    }

    handle_state14(player,action,source,target) {

        if (action != "failed") {
            this.resolve_action(action);
        }


        this.state = 1;
        this.turn_owner = this.next_player_turn();
        console.log("State 14 resolved");
        console.log("End of turn");
    }

    

    handle_action(player,action,source,target) {
        if(this.valid_action(player,action,source,target)) {
            let fn = "handle_state" + this.state;
            this[fn](player,action,source,target);
            console.log("Successful action");
        }
        else {
            
        }
        if(this.is_end(player,action,source,target)) {
            console.log("NIe powinno mnie tu być!");
            for(let plr of this.players) {
                if(plr.cards.length > 0) {
                    this.winner = plr;
                }
            }
        }
    }

    get_line(query) {
        return new Promise(res => {
            rl.question(`Podaj ${query}: `,res);
        })
    }

    player_of_handle(handle) {
        if(handle == "")
            return new Player("Wildcard");
        for(var player of this.players) {
            if(player.handle == handle)
                return player;
        }
    }

    // async game_simulation() {
    //     game.game_setup();
    //     var running = true;
    //     var line;
    //     var action,source,target
    //     console.log("Starting game state: ");
    //     game.print_game_state();
    //     while(running) {
    //         line = await this.get_line("action");
    //         if(line == "q" || line == "quit")
    //             running = false;
    //         else {
    //             action = line.trim();
    //             line = await this.get_line("source");
    //             source = line.trim();
    //             line = await this.get_line("target");
    //             target = line.trim();
    //             source = this.player_of_handle(source);
    //             target = this.player_of_handle(target);

    //             // console.log(`HAHAHA ${action} ${source} ${target}`);

    //             this.handle_action("uniwersalny gracz majacy wladze nad ruchami kazdego zioma",action,source,target);
    //         }
    //         game.print_game_state();
    //     }
    //     rl.close();
    // }
}

// var p1 = new Player("Jan"), p2 = new Player("CyprJan");
// var game = new Game(1,[p1, p2]);
// game.game_setup();
// game.print_game_state();
// game.handle_action(p1,"xd","xd","xd");
// game.game_simulation();

module.exports = {Player,Game};