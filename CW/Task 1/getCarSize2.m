clear;
% Read the image
img = imread('002.jpg');
imshow(img)


%convert to GrayScale
gray_img = rgb2gray(img);

% Compute a threshold level
threshold_level = 0.3;

%Convert the grayscale image ot binary by thresholding

binary_img = im2bw(gray_img,threshold_level);


%Measure the object

stats = regionprops(binary_img,'BoundingBox','Area');
object_area= stats.Area;
boundingBox = stats.BoundingBox;

figure;
rectangle('Position', boundingBox, 'EdgeColor', 'r', 'LineWidth', 2);
hold off;
title(['Object Area: ' num2str(object_area)]);