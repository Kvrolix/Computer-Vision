'use strict;';

//Draw box
// var c = document.getElementById('myCanvas');
// var ctx = c.getContext('2d');
// ctx.fillStyle = '#FF0000';
// ctx.fillRect(0, 0, 150, 75);

//Draw paths
// var c = document.getElementById('myCanvas');
// var ctx = c.getContext('2d');
// ctx.moveTo(0, 0);
// ctx.lineTo(200, 100);
// ctx.stroke();

//Draw a Circle
// var c = document.getElementById('myCanvas');
// var ctx = c.getContext('2d');
// ctx.beginPath(); //begins a path
// ctx.arc(95, 50, 40, 0, 2 * Math.PI);
// ctx.fillStyle = '#333';
// ctx.fill();
// ctx.stroke();
// or use ctx.fill() to draw a solid circle.

//Draw text
// var c = document.getElementById('myCanvas');
// var ctx = c.getContext('2d');
// ctx.font = '30px Arial'; //30 pixels in height
// ctx.fillText('Hello World', 10, 35);
// ctx.rotate((20 * Math.PI) / 180); //rotate the canvas by 20 degrees
// ctx.strokeText('Hello World', 10, 35);

//Draw gradients
var c = document.getElementById('myCanvas');
var ctx = c.getContext('2d');
// Create a gradient use one of the following method
var grd = ctx.createLinearGradient(0, 0, 200, 0); //linear gradient
//var grd=ctx.createRadialGradient(75, 50, 5, 90, 60, 100);//radial gradient;
grd.addColorStop(0, 'red');
grd.addColorStop(1, 'white');
// Fill with gradient
ctx.fillStyle = grd;
ctx.fillRect(10, 10, 150, 80);

//Draw images
var c = document.getElementById('myCanvas2');
var ctx = c.getContext('2d');
var image = new Image();
// When the image has loaded, draw it to the canvas
image.onload = function () {
	ctx.drawImage(image, 0, 0);
};
image.src = 'scream.png';
