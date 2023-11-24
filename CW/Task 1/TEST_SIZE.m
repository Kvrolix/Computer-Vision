clear
% Load image
image = imread('002.jpg');


% Convert to grayscale
image_gray = rgb2gray(image);

threshold = 70;

%Thresholding operation
image_binary = image_gray > threshold;

inverted_img = 1 - image_binary;
% 


% Use the gaussian filter on that 
 a = 10;
 sig = 3;
 gaussian_filter = fspecial('gaussian', [a, a], sig);
 smoothed_img = imfilter(inverted_img, gaussian_filter, 'replicate');
imshow(smoothed_img);

% image_binary2 

%Create a structuring element to use with imdilate. 
% To dilate a geometric object, you typically create a structuring element that is the same shape as the object.

% Erosion is a minus

erosion_structEl = strel('square',4);

dilation_structEl = strel('square',25);

erosion2_structEl = strel('square',3);

% • Opening: Erosion followed by dilation
img_erosion =imerode(inverted_img,erosion_structEl);
img_dilation = imdilate(img_erosion,dilation_structEl);


% imclose play with that 
closing_img = imopen(img_erosion,erosion_structEl); 

% imshow(closing_img)


 % imshow(img_erosion_2);




%for checking the section later
% imshow(label2rgb(labeled_img));
% image_bw = im2bw(image_gray,threshold_level);

