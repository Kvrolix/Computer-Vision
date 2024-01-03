% isCarRed determines if a car in an image is red.
% This function analyzes the percentage of red color in the image and returns 'Y' if
% the red color exceeds 10%, indicating a red car, and 'N' otherwise.
% 
% Inputs:
%   percentageRed - Numeric value representing the percentage of red color in the image
% Outputs:
%   colourResult - String 'Y' if red color is more than 10%, 'N' otherwise

function isRed = isCarRed(percentageRed)
    isRed = percentageRed > 10;
    if isRed
        isRed = 'Y';
    else
        isRed = 'N';
    end
end