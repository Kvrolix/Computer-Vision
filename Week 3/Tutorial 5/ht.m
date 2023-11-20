rgb_cube = imread("Week 3\Tutorial 5\images\cube.png");

 I= rgb2gray(rgb_cube); % conver to intensity
 BW = edge(I,"canny"); % extract edges
 imshow(BW)

 [H,T,R]= hough(BW,"RhoResolution",0.5,"ThetaResolution",0.5);

 % Display the original image

% 2: The number of rows in the grid.
% 1: The number of columns in the grid.
% 1: The position of the current subplot in the grid.
 subplot(2,1,1)
 imshow(rgb_cube)
 title('cube.png')

% display the hough matrix
subplot(2,1,2)
% Matrix H, the numbers of votes in the bins, is converted into a grayscale
imshow(imadjust(mat2gray(H)),'Colormap',hot,'XData',T,'YData',R,'InitialMagnification','fit');
title('Hough transform of cube.png');
xlabel('\theta'), ylabel('\rho');
axis on, axis normal, hold on;

% Step 3: Find Hough peaks using function houghpeaks

P = houghpeaks(H, 6);

plot(T(P(:,2)),R(P(:,1)),'s','color','yellow');



% Step 4: Find the lines from the peaks using houghline
% Houghline works out the lines longer than the specified minimum length and links short
% segments to form longer lines.

lines = houghlines(BW,T,R,P,'FillGap',5,'MinLength',10);

figure, imshow(rgb_cube ), hold on
max_len = 0;
for k = 1:length(lines)
xy = [lines(k).point1; lines(k).point2];
 % plot all the lines found in green color
plot(xy(:,1),xy(:,2),'LineWidth',2,'Color','green');
 % Plot beginnings and ends of lines
 plot(xy(1,1),xy(1,2),'x','LineWidth',2,'Color','yellow');
 plot(xy(2,1),xy(2,2),'x','LineWidth',2,'Color','red');
 % Determine the endpoints of the longest line segment
 len = norm(lines(k).point1 - lines(k).point2);
 if ( len > max_len)
 max_len = len;
 xy_long = xy;
 end
end
% highlight the longest line segment in blue
plot(xy_long(:,1),xy_long(:,2),'LineWidth',2,'Color','blue');


% Load the image
image = imread("Week 3\Tutorial 5\images\011.jpg");

% Convert the image to grayscale
gray_image = rgb2gray(image);

% Use a canny edge detection method to detect the edges of the car
canny_edges = edge(gray_image, 'Canny');

% Create a binary mask for the detected edges
binary_mask = canny_edges ~= 0;

% Dilate the binary mask to fill in the gaps between the edges
dilated_mask = imdilate(binary_mask, strel('disk', 5));

% Apply the binary mask to the original image to create a border around the visible car
bordered_image = repmat(dilated_mask, [1 1 3]);
final_image = image;
final_image(repmat(~dilated_mask, [1 1 3])) = 0;
final_image = final_image + 255 * bordered_image;

% Display the final result
imshow(final_image);


