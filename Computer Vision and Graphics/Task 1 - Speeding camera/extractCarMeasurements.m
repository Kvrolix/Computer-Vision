% extractCarMeasurements extracts various measurements from an image of a car.
% The function applies image processing techniques to identify the car in the image
% and calculates its centroid and corner positions.
%
% Input:
%   image - RGB image of a car
%
% Outputs:
%   centers - The centroid coordinates of the detected car
%   bottomLineCenters - Coordinates of the center of the bottom line of the car
%   topLineCenters - Coordinates of the center of the top line of the car
%   topRightCorner - Coordinates of the top right corner of the car
%   topLeftCorner - Coordinates of the top left corner of the car

function [centers,bottomLineCenters,topLineCenters,topRightCorner,topLeftCorner] = extractCarMeasurements(image)

    % Convert the image to grayscale
    imgGray = rgb2gray(image);

    % Apply a Gaussian filter to smooth the image
    a = 3;
    sig = 3;
    gaussianFilter = fspecial('gaussian', [a, a], sig);
    smoothedImg = imfilter(imgGray, gaussianFilter, 'replicate');
        
    % Binary image
    threshold = 0.15;
    imgBinary = imbinarize(smoothedImg, threshold);

    % Invert the binary image
    imgInverted = 1 - imgBinary;
    
    % Apply morphological operations to enhance features
    dilationStructEl = strel('square', 70);
    closedImg = imclose(imgInverted, dilationStructEl);
    erosionStructEl = strel('square', 5);
    imgErosion = imerode(closedImg, erosionStructEl);

    % figure, imshow(imgErosion), title('Morphologically Processed Image');
    
    % Use regionprops to get properties for each region
    labeledImage = bwlabel(imgErosion);
    
    stats = regionprops(labeledImage, 'BoundingBox','Area');

     % figure, imshow(label2rgb(labeledImage)), title('Labeled Regions');
    
    % Filter regions based on area
    minAreaThreshold = 5;  
    selectedRegions = stats([stats.Area] > minAreaThreshold);
    
    % Initialize measurements structure
    centers = zeros(numel(selectedRegions), 2);
    
    bottomLineCenters = zeros(numel(selectedRegions), 2);
    topLineCenters = zeros(numel(selectedRegions), 2);
    topRightCorner = zeros(numel(selectedRegions), 2);
    topLeftCorner = zeros(numel(selectedRegions), 2);
    
    % Loop through selected regions and draw bounding boxes
       for i = 1:numel(selectedRegions)
        boundingBox = selectedRegions(i).BoundingBox;
       
         % Calculate centroid 
            if isfield(selectedRegions(i), 'Centroid')
                centers(i, :) = selectedRegions(i).Centroid;
            else
                centers(i, 1) = boundingBox(1) + boundingBox(3) / 2;
                centers(i, 2) = boundingBox(2) + boundingBox(4) / 2;
            end 

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



