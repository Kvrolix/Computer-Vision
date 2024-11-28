
% Function harris accepts a grayscale image as input
% Typical call to the function would look like this
%[cim, row,col] = harris(im, 1, 1000, 2,1);
% where im is a grayscale image, cim is a binary image that shows the positions of the corners,
% and row and col show the coordinates of the corners.

building_image=imread("Week 3\Tutorial 5\images\building.tif");
gear_image=imread("Week 3\Tutorial 5\images\gear.png");



[cim,row,col] = harris(building_image,1,1000,2,1);


% Exercise 2: Hough Transform
