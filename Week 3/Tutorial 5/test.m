% Load the image
image = imread("Week 3\Tutorial 5\images\011.jpg");


% Load the image
% Replace 'your_image.jpg' with the path to your image file

% Convert the image to grayscale
grayImage = rgb2gray(image);

% Enhance the contrast using histogram equalization
enhancedImage = histeq(grayImage);

% Apply Canny edge detection to find edges
edgeImage = edge(enhancedImage, 'Canny');

% Create a structuring element for dilation
se = strel('disk', 5); % Adjust the size as needed

% Dilate the edge image to create a border
borderImage = imdilate(edgeImage, se);

% Create a copy of the original image
resultImage = image;

% Overlay the border on the result image
resultImage(repmat(borderImage, [1, 1, 3])) = 255; % Set the border pixels to white

% Display the result
imshow(resultImage);
