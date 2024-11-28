% isRed determines if an image predominantly features the color red.
% The function converts the image to the HSV color space and applies a threshold to 
% isolate regions with red hues. It then calculates the percentage of red in the image
% and returns a boolean value indicating if red is the predominant color.
%
% Inputs:
%   image - RGB image to be analyzed
%
% Outputs:
%   isCarRed - Boolean indicating if the image is predominantly red
%   percentageRed - The percentage of the image that is red

function percentageRed = checkRedDominance(image)
    
    % HSV image
    hsvImage = rgb2hsv(image);

    % Red color range in HSV
    lowerHSV = [0, 0.4, 0.2]; 
    upperHSV = [0.1, 1, 1];  

    % Thresholding the HSV image to get the red color
    binaryImage = (hsvImage(:, :, 1) >= lowerHSV(1)) & (hsvImage(:, :, 1) <= upperHSV(1)) & ...
                  (hsvImage(:, :, 2) >= lowerHSV(2)) & (hsvImage(:, :, 2) <= upperHSV(2)) & ...
                  (hsvImage(:, :, 3) >= lowerHSV(3)) & (hsvImage(:, :, 3) <= upperHSV(3));

    % Check the red percentage on the picture
    percentageRed = sum(binaryImage(:)) / numel(binaryImage) * 100;
     
end

