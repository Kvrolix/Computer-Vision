% isFireTruck determines if a vehicle in an image is a fire truck.
% The function checks if the red color percentage and the vehicle's aspect ratio
% meet specific criteria for fire trucks. It returns 'Y' if the criteria are met,
% indicating a fire truck, and 'N' otherwise.
%
% Inputs:
%   corrRatio - Numeric value representing the aspect ratio (width:length) of the vehicle
%   percentageRed - Numeric value representing the percentage of red color in the image
% Outputs:
%   isFireEngine - String 'Y' if the vehicle is a fire truck, 'N' otherwise

function isFireTruck = isFireTruck(corrRatio,percentageRed)

    isFireTruck = corrRatio < 0.40 && percentageRed > 10;
    if isFireTruck
        isFireTruck = 'Y';
    else
        isFireTruck = 'N';
    end
end

