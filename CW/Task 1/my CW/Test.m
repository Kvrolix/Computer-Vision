% Main Script for Speeding Camera Application
% This script loads images, initializes settings, and processes the images to determine vehicle attributes.

clear,
close all,


% Load images
try
    image1 = imread('001.jpg');
    image2 = imread('005.jpg');
catch ME
    fprintf('Error loading images: %s\n', ME.message);
    return;
end

% Call the application function
try
    myApplication(image1, image2);
catch ME
    fprintf('Error during processing: %s\n', ME.message);
    return;
end