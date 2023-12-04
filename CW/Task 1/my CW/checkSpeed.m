function [isSpeeding,speedMiles] = checkSpeed(image1,image2)

%Get measures
startMeasures = getMeasures(image1);
endMeasures = getMeasures(image2);

cameraHeight = 7;
degUnderCamera = 60;
degreesPerPixel = 0.042;
timeInterval = 0.1;

imageHeight = 640; %Y
imageWidth = 480; %X
imageCenter = imageHeight/2;

%Getting the values
startX = startMeasures(1);
startY = startMeasures(2);

endX = endMeasures(1);
endY = endMeasures(2);

startDiffPx = imageCenter - startY;
endDiffPx = imageCenter - endY;

%Convertion of the difference in pixels to difference in degrees
startDiffDeg = degUnderCamera + (startDiffPx * degreesPerPixel);
endDiffDeg = degUnderCamera + (endDiffPx * degreesPerPixel);

startDistance = cameraHeight * tand(startDiffDeg);
endDistance = cameraHeight * tand(endDiffDeg);

%Compare distance 
distanceTravelled = endDistance - startDistance;
speedMeteres = distanceTravelled / timeInterval;

% Convertion from miles per second to miles per hour
speedMiles = speedMeteres * 2.24;

%Boolean value for checks
isSpeeding = speedMiles > 30;





