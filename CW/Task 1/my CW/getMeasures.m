%%%%%%%%%%%%%%%%%%%%
%It does work only for blue cars, for the red cars ot will be different 
%%%%%%%%%%%%%%%%%%%%%%
function [bottomLeft] = getMeasures(imagePath)


image=imread(imagePath);

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

% Initialize measurements structure
measurements = struct('BoundingBox', [], 'Width', [], 'Height', [], 'Area', []);

% Loop through selected regions and draw bounding boxes
for i = 1:numel(selectedRegions)
    boundingBox = selectedRegions(i).BoundingBox;
    rectangle('Position', boundingBox, 'EdgeColor', 'g', 'LineWidth', 2);

    % Store measurements
    measurements(i).BoundingBox = boundingBox;
    measurements(i).Width = boundingBox(3);
    measurements(i).Height = boundingBox(4);


% Get coordinates of top-left, top-right, bottom-left, and bottom-right corners
    bottomLeft = [boundingBox(1), boundingBox(2) + boundingBox(4)];


end



