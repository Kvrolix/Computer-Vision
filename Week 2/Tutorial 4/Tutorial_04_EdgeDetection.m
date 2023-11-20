% Exercise 1

% We are using this filter throught this exercise
sx =[-1 0 1; -2 0 2; -1 0 1];
sy=sx';

%Read image
img = imread("building.tif");

% This gives me the horizontal edges
edge_x = filter2(sx,img);
out_image_x = edge_x / 255;
% figure, imshow(out_image)

% This gives me the vertical edges
edge_y = filter2(sy,img);
out_image_y = edge_y / 255;


% All edges combined
building_edge = sqrt(out_image_x.^2 + out_image_y.^2);
% figure, imshow(building_edge)

ang=atan2(out_image_x,out_image_y);

figure, imshow(ang)
colormap jet 



% Exercise 2

img_2 = imread('cameraman.tif');
imshow(img_2);


