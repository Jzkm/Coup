var socket = io();

socket.on("connect", function() {
    console.log("+ " + username);
});

socket.on("disconnect", function() {
    // socket.emit('del', username);
    console.log("- " + username);
});
