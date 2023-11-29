%%%%%%%%%%%%%%%%%%%%
%It does work only for blue cars, for the red cars ot will be different 
%%%%%%%%%%%%%%%%%%%%%%

% image = imread('oversized.jpg');
% image = imread('fire01.jpg');
image= imread("006.jpg");

% image= imread("002.jpg")

% Gaussian
a = 3;
sig = 3;
gaussian_filter = fspecial('gaussian', [a, a], sig);
smoothed_img = imfilter(image, gaussian_filter, 'replicate');

% Convert to grayscale
img_gray = rgb2gray(smoothed_img);

% Binarize the image
threshold = 0.15;
img_bw = imbinarize(img_gray, threshold);

% Invert the binary image
img_inverted = 1 - img_bw;

% Perform morphological operations (closing and erosion)
dilation_structEl = strel('square', 70);
closed_img = imclose(img_inverted, dilation_structEl);

erosion_structEl = strel('square', 5);
img_erosion = imerode(closed_img, erosion_structEl);

% Use regionprops to get properties for each region
labeledImage = bwlabel(img_erosion);
stats = regionprops(labeledImage, 'BoundingBox', 'Area');

% Filter regions based on area (you may adjust the threshold)
minAreaThreshold = 5;  % Adjust as needed
selectedRegions = stats([stats.Area] > minAreaThreshold);

% Display the original image
figure;
imshow(image);
hold on;

% Initialize measurements structure
measurements = struct('BoundingBox', [], 'Width', [], 'Height', [], 'Area', []);

% Loop through selected regions and draw bounding boxes
for i = 1:numel(selectedRegions)
    boundingBox = selectedRegions(i).BoundingBox;
    rectangle('Position', boundingBox, 'EdgeColor', 'r', 'LineWidth', 2);

    % Store measurements
    measurements(i).BoundingBox = boundingBox;
    measurements(i).Width = boundingBox(3);
    measurements(i).Height = boundingBox(4);
    measurements(i).Area = selectedRegions(i).Area;

    % Display measurements
    fprintf('Region %d: Width = %.2f, Height = %.2f, Area = %.2f\n', ...
        i, measurements(i).Width, measurements(i).Height, measurements(i).Area);

% Get coordinates of top-left, top-right, bottom-left, and bottom-right corners
    topLeft = [boundingBox(1), boundingBox(2)];
    topRight = [boundingBox(1) + boundingBox(3), boundingBox(2)];
    bottomLeft = [boundingBox(1), boundingBox(2) + boundingBox(4)];
    bottomRight = [boundingBox(1) + boundingBox(3), boundingBox(2) + boundingBox(4)];

    % Print coordinates to console
    fprintf('Top-Left Corner: (%.2f, %.2f)\n', topLeft(1), topLeft(2));
    fprintf('Top-Right Corner: (%.2f, %.2f)\n', topRight(1), topRight(2));
    fprintf('Bottom-Left Corner: (%.2f, %.2f)\n', bottomLeft(1), bottomLeft(2));
    fprintf('Bottom-Right Corner: (%.2f, %.2f)\n', bottomRight(1), bottomRight(2));

    % Plot corners
    plot([topLeft(1), topRight(1), bottomRight(1), bottomLeft(1), topLeft(1)], ...
         [topLeft(2), topRight(2), bottomRight(2), bottomLeft(2), topLeft(2)], 'r*-');
end



hold off;


