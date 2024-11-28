%Function to get all measurements for the fire truck taking the image as the input
function [centers, bottomLineCenters, topLineCenters,topRightCorner,topLeftCorner] = fireTruckMeasures(image)
   
    % Convert image to HSV color space
    hsvImage = rgb2hsv(image);

    % Define red color range in HSV
    lowerHSV = [0, 0.4, 0.2];
    upperHSV = [0.1, 1, 1];

    % Threshold the HSV image to get the red color
    binaryImage = (hsvImage(:, :, 1) >= lowerHSV(1)) & (hsvImage(:, :, 1) <= upperHSV(1)) & ...
                  (hsvImage(:, :, 2) >= lowerHSV(2)) & (hsvImage(:, :, 2) <= upperHSV(2)) & ...
                  (hsvImage(:, :, 3) >= lowerHSV(3)) & (hsvImage(:, :, 3) <= upperHSV(3));

    % Regionprops to get properties for each region
    labeledImage = bwlabel(binaryImage);
    stats = regionprops(labeledImage, 'BoundingBox', 'Area', 'Centroid');

    % Filter regions based on area 
    minAreaThreshold = 750;  % 750 to detect the biggest object
    selectedRegions = stats([stats.Area] > minAreaThreshold);

    % Variables
    centers = zeros(numel(selectedRegions), 2);
    bottomLineCenters = zeros(numel(selectedRegions), 2);
    topLineCenters = zeros(numel(selectedRegions), 2);

    for i = 1:numel(selectedRegions)
        boundingBox = selectedRegions(i).BoundingBox;

        % Calculating centroid
        if isfield(selectedRegions(i), 'Centroid')
            centers(i, :) = selectedRegions(i).Centroid;
        else
            centers(i, 1) = boundingBox(1) + boundingBox(3) / 2;
            centers(i, 2) = boundingBox(2) + boundingBox(4) / 2;
        end

        % Center of the bottom line
        bottomLineCenters(i, 1) = boundingBox(1) + boundingBox(3) / 2;
        bottomLineCenters(i, 2) = boundingBox(2) + boundingBox(4);

        % Center of the top line
        topLineCenters(i, 1) = boundingBox(1) + boundingBox(3) / 2;
        topLineCenters(i, 2) = boundingBox(2);

        % Top right corner
        topRightCorner(i, 1) = boundingBox(1) + boundingBox(3);
        topRightCorner(i, 2) = boundingBox(2);

        % Top left corner
        topLeftCorner(i, 1) = boundingBox(1);
        topLeftCorner(i, 2) = boundingBox(2);
    
    end
end

