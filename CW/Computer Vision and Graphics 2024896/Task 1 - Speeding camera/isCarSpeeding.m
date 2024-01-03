% isCarSpeeding checks if a car is exceeding the speed limit.
% The function compares the provided speed of the car with a predefined speed limit.
% It returns 'Y' if the car is speeding and 'N' otherwise.
%
% Input:
%   speed - Value representing the speed of the car in miles per hour.
%   
%
% Output:
%   isSpeeding - String 'Y' if the car's speed exceeds 30 mph (or the defined limit),
%   'N' if the speed is within the limit.

function isSpeeding = isCarSpeeding(speed)

    speedLimit = 30;

    % Check if the car's speed exceeds the limit
    isSpeeding = speed > speedLimit;

    % Convert the boolean result to 'Y' or 'N'
    if isSpeeding
        isSpeeding = 'Y';
    else
        isSpeeding = 'N';
    end

end

