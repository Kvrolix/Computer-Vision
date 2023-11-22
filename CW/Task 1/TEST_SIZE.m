clear
% Load image
image = imread('002.jpg');

% Convert to grayscale
image_gray = rgb2gray(image);

threshold = 50;

%Thresholding operation
image_binary = image_gray > threshold;

inverted_img = 1 - image_binary;

labeled_img = bwlabel(inverted_img);



%Create a structuring element to use with imdilate. 
% To dilate a geometric object, you typically create a structuring element that is the same shape as the object.
SE = strel('square',3);

bw2= imdilate()

%for checking the section later
imshow(label2rgb(labeled_img));
% image_bw = im2bw(image_gray,threshold_level);

