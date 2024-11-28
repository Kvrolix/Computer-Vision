% isCarOversized determines if a car is oversized based on its width.
% The function returns 'Y' if the car's width exceeds 2.5 meters, indicating an oversized car,
% and 'N' otherwise.
%
% Inputs:
%   width - Numeric value representing the width of the car in meters
% Outputs:
%   oversizedResult - String 'Y' if the car is oversized, 'N' otherwise

function isOversized = isCarOversized(width)
    isOversized = width > 2.5; 
    if isOversized
        isOversized = 'Y';
    else
        isOversized = 'N';
    end
end