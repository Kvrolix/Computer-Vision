img = imread("Week 2/building.tif");

% Exercise 1
sx = [-1 0 1;-2 0 2; -1 0 1];
sy =sx';

img_x = img;
img_y = img_x';

filtered_image = filter2(img_x,img);
%img_filter

out_image = filtered_image /200;
out_image
