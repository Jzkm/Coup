window.addEventListener('load', function() {

    var socket = io();

    socket.on('update', function(data) {
        data = JSON.parse(data);

        var tablesContainer = document.getElementById("tables-container");
        tablesContainer.innerHTML = "";
        for(let i = 1; i <= 100; i++) {
            if(data[i - 1].nr === 0)
                continue;

            let tableDiv = document.createElement("div");
            tableDiv.classList.add("table-tables");

            let form = document.createElement("form");
            form.action = `/table/${i}`;
            form.method = "GET";

            let button = document.createElement("button");
            button.classList.add("button-index");
            button.type = "submit";
            button.textContent = `table #${i}`;

            form.appendChild(button);
            tableDiv.appendChild(form);

            for(let j = 1; j <= 2; j++) {
                let playersContainer = document.createElement("div");
                playersContainer.classList.add("players-tables-container");

                for(let k = 1; k <= 5; k++) {
                    let playerDiv = document.createElement("div");
                    playerDiv.classList.add("table-player");
                    playerDiv.textContent = data[i - 1].players[(j - 1) * 5 + k - 1];
                    playersContainer.appendChild(playerDiv);
                }

                tableDiv.appendChild(playersContainer);
            }
            tablesContainer.appendChild(tableDiv);
        }

    });
});