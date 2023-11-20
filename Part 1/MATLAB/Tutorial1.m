
%{
img = imread('circles.jpeg');

% the function takes to parameters, the first one is the picture and the
% second one is the threshold value for black

% the app only works with im2bw
binary_img = im2bw(img, 0.7);


%threshold = 1;
%binary_img = imbinarize(img,8);



%the defualt value is 8 connected neighbourhood
L = bwlabel(binary_img,8);
rgb = label2rgb(L);
figure, imshow(rgb)
%}

function funcTest(imageName)
im = imread(imageName);
bw = im2bw(im,0.7);
[L,num] = bwlabel(bw,4);
rgb = label2rgb(L);
figure, imshow(rgb)
