% fireTruckMeasures extracts measurements specific to identifying fire trucks.
% The function processes an image to detect regions with red color and 
% calculates various geometric properties of these regions.
%
% Inputs:
%   image - RGB image of a vehicle, expected to be a fire truck
%
% Outputs:
%   centers - Centroids of the detected red regions
%   bottomLineCenters - Center positions of the bottom lines of the red regions
%   topLineCenters - Center positions of the top lines of the red regions
%   topRightCorner - Coordinates of the top right corners of the red regions
%   topLeftCorner - Coordinates of the top left corners of the red regions


function [centers, bottomLineCenters, topLineCenters,topRightCorner,topLeftCorner] = fireTruckMeasures(image)
   
    % Converting image to HSV color space
    hsvImage = rgb2hsv(image);

    %  Red color range in HSV
    lowerHSV = [0, 0.4, 0.2];
    upperHSV = [0.1, 1, 1];

    % Binary mask where red regions are marked
    binaryImage = (hsvImage(:, :, 1) >= lowerHSV(1)) & (hsvImage(:, :, 1) <= upperHSV(1)) & ...
                  (hsvImage(:, :, 2) >= lowerHSV(2)) & (hsvImage(:, :, 2) <= upperHSV(2)) & ...
                  (hsvImage(:, :, 3) >= lowerHSV(3)) & (hsvImage(:, :, 3) <= upperHSV(3));

    % Regionprops to get properties for each region
    labeledImage = bwlabel(binaryImage);
    stats = regionprops(labeledImage, 'BoundingBox', 'Area', 'Centroid');

    % Filter regions based on area 
    minAreaThreshold = 750;  % 750 Threshold to detect larger objects
    selectedRegions = stats([stats.Area] > minAreaThreshold);

    % Variables
    centers = zeros(numel(selectedRegions), 2);
    bottomLineCenters = zeros(numel(selectedRegions), 2);
    topLineCenters = zeros(numel(selectedRegions), 2);
    topRightCorner = zeros(numel(selectedRegions), 2);
    topLeftCorner = zeros(numel(selectedRegions), 2);

    % Calculate measurements for each significant red region detected
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

