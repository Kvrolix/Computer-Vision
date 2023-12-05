function [centers,bottomLineCenters,topLineCenters,topRightCorner,topLeftCorner] = FINAL_getMeasures(image)

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
stats = regionprops(labeledImage, 'BoundingBox','Area');

% Filter regions based on area (you may adjust the threshold)
minAreaThreshold = 5;  % Adjust as needed
selectedRegions = stats([stats.Area] > minAreaThreshold);

centers = zeros(numel(selectedRegions), 2);
% Initialize measurements structure
measurements = struct('BoundingBox', [], 'Width', [], 'Height', [],'Centroid',[]);

% Loop through selected regions and draw bounding boxes
for i = 1:numel(selectedRegions)
    boundingBox = selectedRegions(i).BoundingBox;
   
     % Calculate centroid (handle the case where Centroid is not present)
        if isfield(selectedRegions(i), 'Centroid')
            centers(i, :) = selectedRegions(i).Centroid;
        else
            centers(i, 1) = boundingBox(1) + boundingBox(3) / 2;
            centers(i, 2) = boundingBox(2) + boundingBox(4) / 2;
        end  
        % Calculate center of the bottom line
        bottomLineCenters(i, 1) = boundingBox(1) + boundingBox(3) / 2;
        bottomLineCenters(i, 2) = boundingBox(2) + boundingBox(4);

        % Calculate center of the top line
        topLineCenters(i, 1) = boundingBox(1) + boundingBox(3) / 2;
        topLineCenters(i, 2) = boundingBox(2);

        % Calculate top right corner
        topRightCorner(i, 1) = boundingBox(1) + boundingBox(3);
        topRightCorner(i, 2) = boundingBox(2);

        % Calculate top left corner
        topLeftCorner(i, 1) = boundingBox(1);
        topLeftCorner(i, 2) = boundingBox(2);
end



