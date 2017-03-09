// This example shows how to use node-pixel using Johnny Five as the
// hook for the board.
'use strict';

const five = require('johnny-five');
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

var pixel = require("../../lib/pixel.js");

var opts = {};
opts.port = process.argv[2] || "";

var board = new five.Board(opts);
var strip = null;
const fps = 1; // how many frames per second do you want to try?

board.on("ready", function() {

    console.log("Board ready, lets add light");

    strip = new pixel.Strip({
        data: 11,
        length: 50,
        color_order: pixel.COLOR_ORDER.RGB,
        board: this,
        controller: "FIRMATA",
    });

    strip.on("ready", function() {

        console.log("Strip ready, let's go");

        var colors = ["red", "green", "blue", "yellow", "cyan", "magenta", "white"];
        //var current_colors = [0,1,2,3,4];
        strip.color("blue");
        strip.show();
    });

    io.on('connection', function(client) {
        client.on('join', function(handshake) {
            console.log(handshake);
        });

        // Set initial state
        var state = {
            red: 1, green: 1, blue: 1
        };

        client.on('rgb', function(data) {
            console.log(data);
            // Set the new colors
            if(data.position != '') {
                var position = parseInt(data.position);
                if(position >= 0 && position <= 49) {
                    strip.pixel(position).color(data.color);
                    strip.show();
                } else {
                    console.log("Invalid position");
                }
            } else {
                strip.color(data.color);
                strip.show();
            }

            client.emit('rgb', data);
            client.broadcast.emit('rgb', data);
        });

        client.on('color', function(data) {
            strip.pixel(5).color(data.color);
            strip.show();

            client.emit('color', data);
            client.broadcast.emit('color', data);
        })
    });
});

const port = process.env.PORT || 3000;

server.listen(port);
console.log(`Server listening on http://localhost:${port}`);