clear

% Make the variables more clear or adjust them slightly

% Load image
image = imread('fire01.jpg');

%Gaussian
a = 3;
sig = 3;
gaussian_filter = fspecial('gaussian', [a, a], sig);
smoothed_img = imfilter(image, gaussian_filter, 'replicate');

%Gray image
img_gray = im2gray(smoothed_img);
threshold = 0.15;
img_bw = imbinarize(img_gray,threshold);

% To invert the colour  background/foreground
img_inverted = 1 - img_bw;


dilation_structEl = strel('square',70);
closed_img = imclose(img_inverted,dilation_structEl)

 erosion_structEl = strel('square',5);
 img_erosion =imerode(closed_img,erosion_structEl);
 imshow(img_erosion)

