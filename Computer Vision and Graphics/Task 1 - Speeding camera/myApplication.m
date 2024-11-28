% myApplication processes two vehicle images and determines various attributes 
% such as if the vehicle is speeding, its size, color, and if it's a fire engine.


function myApplication(image1,image2)
    % Initialize variables and settings
    [cameraSettings, percentageRed, percentageRed2] = init(image1, image2);

  % Validate that the images are suitable for comparison
if (percentageRed < 1 && percentageRed2 > 1) || (percentageRed > 1 && percentageRed2 <1)
    error('Error: The images do not match. Please try with matching images.');

% Processing for fire trucks
elseif percentageRed > 10
  
    [startMeasures, bottomLineCenters, topLineCenters,topRightCorner,topLeftCorner] = fireTruckMeasures(image1);
    endMeasures = fireTruckMeasures(image2);
    [length, width] = measureVehicleSize(bottomLineCenters, topLineCenters, topRightCorner, topLeftCorner, cameraSettings);

    speedInMiles = calculateVehicleSpeed(startMeasures,endMeasures,cameraSettings.timeInterval,cameraSettings);
    [ratio,isWithinRan] = calculateAspectRatio(width, length);
    isFireEngine = isFireTruck(isWithinRan,percentageRed);
    oversizedResult = isCarOversized(width);
    colourResult = isCarRed(percentageRed); 
    isSpeeding = isCarSpeeding(speedInMiles);
  

% Processing for non-red cars
elseif percentageRed < 10 

    [startMeasures,bottomLineCenters,topLineCenters,topRightCorner,topLeftCorner] = extractCarMeasurements(image1);
    endMeasures = extractCarMeasurements(image2);
    [length, width] = measureVehicleSize(bottomLineCenters, topLineCenters, topRightCorner, topLeftCorner, cameraSettings);

    speedInMiles = calculateVehicleSpeed(startMeasures,endMeasures,cameraSettings.timeInterval,cameraSettings);
    [ratio,isWithinRan] = calculateAspectRatio(width, length);
    isFireEngine = isFireTruck(isWithinRan,percentageRed);
    oversizedResult = isCarOversized(width);
    colourResult = isCarRed(percentageRed);
    isSpeeding = isCarSpeeding(speedInMiles);
  
else
    error('Error: Unable to determine the vehicle type from the images.')
end



% Display the results
fprintf('\nThe width: %.2f metres \n', width);
fprintf('The length: %.2f metres \n', length);
fprintf('Car width/length ratio: %.2f \n', ratio); 
fprintf('Car colour: Is the car red? %s \n', colourResult); 
fprintf('Car speed: %.f mph \n', speedInMiles);
fprintf('Car is speeding (Y/N): %s\n', isSpeeding);
fprintf('Car is oversized (Y/N): %s\n', oversizedResult) 
fprintf('Car is a fire engine (Y/N): %s\n', isFireEngine);


