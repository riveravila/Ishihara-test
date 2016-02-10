function QuestionnaireItemIshihara(className, content, required, size) {
//    QuestionnaireItem.call(this, className, content, required);
    this.size = size;
    this.content = content;
    this.canvas = null;
}
//QuestionnaireItemIshihara.prototype = Object.create(QuestionnaireItem.prototype);
QuestionnaireItemIshihara.prototype.constructor = QuestionnaireItemIshihara;
QuestionnaireItemIshihara.prototype.createUI = function () {
    this.canvas = document.createElement('canvas');
    this.canvas.width = this.size;
    this.canvas.height = this.size;
    ict_generate(this.canvas, this.content);
    return this.canvas;
};
QuestionnaireItemIshihara.prototype.releaseUI = function () {
    this.canvas = null;
};

function normal_rand(mean, variance) {
    var V1, V2, S;
    do {
        var U1 = Math.random();
        var U2 = Math.random();
        V1 = 2 * U1 - 1;
        V2 = 2 * U2 - 1;
        S = V1 * V1 + V2 * V2;
    } while (S > 1);
    X = Math.sqrt(-2 * Math.log(S) / S) * V1;
    X = mean + Math.sqrt(variance) * X;
    return X;
}
var ICT_MIN_DISTANCE = 2.0 / 400;

function ict_distance(d1, d2) {
    return Math.sqrt(Math.pow(d1[0] - d2[0], 2) + Math.pow(d1[1] - d2[1], 2));
}
function ict_distance_check(d1, d2) {
    var distance = Math.sqrt(Math.pow(d1[0] - d2[0], 2) + Math.pow(d1[1] - d2[1], 2));
    return distance <= d1[2] + d2[2] + ICT_MIN_DISTANCE;
}
//hue saturation value to red-green-blue
function hsv_to_rgb(H, S, V) {
    var C = V * S;
    var H1 = H / 60;
    var X = C * (1 - Math.abs(H1 % 2 - 1));
    if (0 <= H1 && H1 < 1)
        RGB1 = [C, X, 0];
    else if (1 <= H1 && H1 < 2)
        RGB1 = [X, C, 0];
    else if (2 <= H1 && H1 < 3)
        RGB1 = [0, C, X];
    else if (3 <= H1 && H1 < 4)
        RGB1 = [0, X, C];
    else if (4 <= H1 && H1 < 5)
        RGB1 = [X, 0, C];
    else if (5 <= H1 && H1 < 6)
        RGB1 = [C, 0, X];
    else
        RGB1 = [0, 0, 0];
    var m = V - C;
    return [Math.floor((RGB1[0] + m) * 256), Math.floor((RGB1[1] + m) * 256), Math.floor((RGB1[2] + m) * 256)];
}
function ict_generate(canvas, content) {
    var ctx = canvas.getContext('2d'); //object representing a two-dimensional rendering context.
    ctx.fillStyle = '#ffffff';  //sets white to fill the drawing.
    ctx.fillRect(0, 0, canvas.width, canvas.width); //draws a "filled" rectangle
    ctx.font = 'italic bold 280px"Comic Sans MS"'; //font and font size of content to be written
    ctx.textAlign = 'center'; //Centers content
    ctx.textBaseline = 'middle'; //
    ctx.fillStyle = '#000000'; //render the text in colour black
    ctx.fillText(content, 180, 200); //(text, x,y to start painting the text)
    var ICT_DOTS = 330; //number of bubbles
    var ICT_DOT_SIZE_mean = 0.06; //average bubble size
    var ICT_DOT_SIZE_var = 0.00014;
    var dots = [];
    var mag = Math.log(Math.random() * Math.PI) / Math.log(Math.PI);
    mag = (mag > 0) ? mag : 1 / (1 - mag);
    var arg = Math.random() * 2 * Math.PI;
    radius = Math.abs(normal_rand(ICT_DOT_SIZE_mean, ICT_DOT_SIZE_var));
    x = mag * Math.cos(arg);
    y = mag * Math.sin(arg);
    var highlight = (ctx.getImageData(x * 200 + 200, 200 - y * 200, 1, 1).data[0] == 0);
    var imgData = ctx.getImageData(x * 200 + 200, 200 - y * 200, 1, 1);
    if (highlight)
        color = hsv_to_rgb(148 + Math.random() * 48, 0.67, 0.66);
    else
        color = hsv_to_rgb(22 + Math.random() * 36, 0.58, 0.91);
    dots.push([x, y, radius, highlight, color]);
    for (var i = 1; i < ICT_DOTS; i++) {
        var x, y, radius, j;
        do {
            var mag = Math.log(Math.random() * Math.PI) / Math.log(Math.PI);
            mag = (mag > 0) ? mag : 1 / (1 - mag);
            var arg = Math.random() * 2 * Math.PI;
            radius = Math.abs(normal_rand(ICT_DOT_SIZE_mean, ICT_DOT_SIZE_var));
            x = mag * Math.cos(arg);
            y = mag * Math.sin(arg);
            j = 0;
            for (; j < i; j++) {
                if (ict_distance_check([x, y, radius], dots[j]))
                    break;
            }
        } while (j != i);
        var highlight = (ctx.getImageData(x * 200 + 200, 200 - y * 200, 1, 1).data[0] == 0);
        if (highlight)
            color = hsv_to_rgb(148 + Math.random() * 48, 0.67, 0.66);
        else
            color = hsv_to_rgb(22 + Math.random() * 36, 0.58, 0.91);
        dots.push([x, y, radius, highlight, color]);
    }
    dots.sort(function (a, b) {
        return a[2] - b[2]
    });
    for (var i = 0; i < 2; i++) {
        for (var j = 0; j < dots.length; j++) {
            var small_d = 99999;
            for (var k = 0; k < dots.length; k++) {
                if (j == k)
                    continue;
                var d = ict_distance(dots[j], dots[k]) - (dots[j][2] + dots[k][2] + ICT_MIN_DISTANCE);
                if (d < small_d)
                    small_d = d;
            }
            if (small_d > 0)
                dots[j][2] += small_d;
        }
        dots.sort(function (a, b) {
            return a[2] - b[2]
        });
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ict_draw(canvas, dots, true);
}
function ict_draw(canvas, dots, highlight) {
    var ctx = canvas.getContext('2d');
    var radius = canvas.width / 2.2;
    for (var i = 0; i < dots.length; i++) {
        var dot = dots[i];
        var color = dot[4];
        ctx.globalAlpha = 1.0;
        if (!dot[3] && highlight) //dot[3]=highlight is boolean
            ctx.globalAlpha = 0.25; //transparency value 0.0 (fully transparent) and 1.0 (no transparancy)
        ctx.fillStyle = 'rgb(' + color[0] + ',' + color[1] + ',' + color[2] + ')';
        ctx.beginPath();
        ctx.arc(20 + radius + dot[0] * radius, 20 + radius - dot[1] * radius, dot[2] * radius, 0, 2 * Math.PI, false);
        //context.arc(x,y,r,sAngle,eAngle,counterclockwise);
        ctx.closePath();
        ctx.fill();
    }
}