function [isCarRed,binaryImage] = Copy_of_isRed(imagePath)
    %Read image
    image = imread(imagePath);

    % Convert image to HSV color space
    hsvImage = rgb2hsv(image);

    % Define red color range in HSV
    lowerHSV = [0, 0.4, 0.2]; 
    upperHSV = [0.1, 1, 1];  

    % Threshold the HSV image to get the red color only
    binaryImage = (hsvImage(:, :, 1) >= lowerHSV(1)) & (hsvImage(:, :, 1) <= upperHSV(1)) & ...
                  (hsvImage(:, :, 2) >= lowerHSV(2)) & (hsvImage(:, :, 2) <= upperHSV(2)) & ...
                  (hsvImage(:, :, 3) >= lowerHSV(3)) & (hsvImage(:, :, 3) <= upperHSV(3));

    % Check the red percentage on the picture
    percentageRed = sum(binaryImage(:)) / numel(binaryImage) * 100;
imshow(binaryImage);
    isCarRed = percentageRed > 1;    

 % Use regionprops to get properties for each region
    labeledImage = bwlabel(binaryImage);
    stats = regionprops(labeledImage, 'BoundingBox', 'Area');

    % Filter regions based on area (you may adjust the threshold)
    minAreaThreshold = 50;  % Adjust as needed
    selectedRegions = stats([stats.Area] > minAreaThreshold);

    % Initialize variables
    centers = zeros(numel(selectedRegions), 2);
    bottomLineCenters = zeros(numel(selectedRegions), 2);
    topLineCenters = zeros(numel(selectedRegions), 2);

    % Display the original image
    figure;
    imshow(image);
    hold on;

    % Loop through selected regions and draw bounding boxes and points
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
        topRightCorners(i, 1) = boundingBox(1) + boundingBox(3);
        topRightCorners(i, 2) = boundingBox(2);

        % Draw bounding boxes
        rectangle('Position', boundingBox, 'EdgeColor', 'r', 'LineWidth', 2);

        % Draw points
        plot(centers(i, 1), centers(i, 2), 'g*');
        plot(bottomLineCenters(i, 1), bottomLineCenters(i, 2), 'bo');
        plot(topLineCenters(i, 1), topLineCenters(i, 2), 'ro');
        plot(topRightCorners(i, 1), topRightCorners(i, 2), 'ro');
    end
    hold off;
    
end

