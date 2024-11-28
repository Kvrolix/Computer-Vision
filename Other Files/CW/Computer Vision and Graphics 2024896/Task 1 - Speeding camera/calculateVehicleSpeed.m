function speedMiles = calculateVehicleSpeed(startMeasures,endMeasures,timeInterval,cameraSettings)
% calculateVehicleSpeed calculates the speed of a vehicle.
% The function uses the difference in vehicle positions between two images and the time interval
% to calculate the speed.
%
% Inputs:
%   startMeasures - A two-element vector [startX, startY] for the starting position
%   endMeasures - A two-element vector [endX, endY] for the ending position
%   timeInterval - Time interval between the two images in seconds
%   cameraSettings - A structure containing camera parameters such as height and angles
%
% Output:
%   speedMiles - The calculated speed of the vehicle in miles per hour

% Camera settings
cameraHeight = cameraSettings.cameraHeight;
degUnderCamera = cameraSettings.degUnderCamera;
degreesPerPixel = cameraSettings.degreesPerPixel;
imageCenter = cameraSettings.imageCenter;

% Calculate the difference in pixels and convert to degrees
startDiffPx = imageCenter - startMeasures(2);
endDiffPx = imageCenter - endMeasures(2);
startDiffDeg = degUnderCamera + (startDiffPx * degreesPerPixel);
endDiffDeg = degUnderCamera + (endDiffPx * degreesPerPixel);

% Convert angles to distances
startDistance = cameraHeight * tand(startDiffDeg);
endDistance = cameraHeight * tand(endDiffDeg);

% Calculate the distance travelled and speed
distanceTravelled = endDistance - startDistance; % in meters
speedMetersPerSecond = distanceTravelled / timeInterval;

% Convert speed from meters per second to miles per hour
speedMiles = speedMetersPerSecond * 2.23694; % 1 meter/sec = 2.23694 miles/hr
end

