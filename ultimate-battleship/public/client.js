(function() {
    var socket = io.connect(window.location.hostname + ':' + 3000);
    var red = document.getElementById('red');
    var green = document.getElementById('green');
    var blue = document.getElementById('blue');
    var pixel = document.getElementById('pixel');

    function emitValue(color, e) {
        socket.emit('rgb', {
            color: color,
            value: e.target.value,
            position: pixel.value
        });
    }

    red.addEventListener('click', emitValue.bind(null, 'red'));
    blue.addEventListener('click', emitValue.bind(null, 'blue'));
    green.addEventListener('click', emitValue.bind(null, 'green'));

    socket.on('connect', function(data) {
        socket.emit('join', 'Client is connected!');
    });

    socket.on('rgb', function(data) {
        var color = data.color;
        var position = data.position;
        document.getElementById(color).value = data.value;
    });

    socket.on('color', function(data) {
        var color = data.color;
        var position = data.position;
    });
}());
