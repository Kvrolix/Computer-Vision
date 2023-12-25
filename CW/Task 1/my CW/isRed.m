%Function to check wether an image is a red image, returning the boolean
%value if the percentage is greater than 10% meaning that the red object is
%present, it return the percentage of the red colour. Taking the image as
%an input

function [isCarRed,percentageRed] = isRed(image)
    
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
    isCarRed = percentageRed > 1;  
end

