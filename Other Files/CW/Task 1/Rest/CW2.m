
clear;
% Load the first image and the second image
img_start =imread("images/002.jpg");
img_end = imread("/images/011.jpg");

imshow(img_start)
%There should be a warning from the system if 

% 1) Car > 2.5m width
% 2) Speed > 30 mph
% 3) Therefore: Car > 2.5m width || Speed > 30 mph

% the only exempt are the fire trucks of wide length radio 1:3
% are mainly red colour AND have a width length ratio to 1:3, 1 width is ==
% 3 lenghts



%Basic functionality 
% 1) Detect car size 
% 2) Detect speed 
% 3) Detect type of the car


%My plan:
% Detect the colour of the car by creating a seperate function for it

% Detect the size of the car


% For detecting the size of the fire truck i need to send some approximate
% value of up and down let's say 0.5 m or smth like that


% Detect the size of the car
% Detect the speed by compairing two images