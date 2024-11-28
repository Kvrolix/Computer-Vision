function [resultIsSpeeding,speedMiles,length, width] = CombinedCheckSpeedAndSize(image1,image2,startMeasures,endMeasures,bottomLineCenters,topLineCenters,topRightCorner,topLeftCorner)

%Camera Settings
cameraHeight = 7;
degUnderCamera = 60;
degreesPerPixel = 0.042;

%Picture interval
timeInterval = 0.1;

%Picture setings
imageHeight = 640; %Y
imageWidth = 480; %X
imageCenterWidth = imageWidth/2;
imageCenter = imageHeight/2;

%Getting the values

%Image 1 values
startX = startMeasures(1);
startY = startMeasures(2);

%Image 2 values
endX = endMeasures(1);
endY = endMeasures(2);

%Calulating the difference in px
startDiffPx = imageCenter - startY; %-195
endDiffPx = imageCenter - endY; % -132

 
%Car Width calculations
carStartWidthPx = imageCenterWidth - topRightCorner(1);
carEndWidthPx =  imageCenterWidth - topLeftCorner(1);

carWidthStartDeg = degUnderCamera + (carStartWidthPx * degreesPerPixel);
carWidthEndDeg = degUnderCamera + (carEndWidthPx * degreesPerPixel);

startWidth = cameraHeight * tand(carWidthStartDeg);
endWidth = cameraHeight * tand(carWidthEndDeg);
width = (endWidth - startWidth) / 2;


%Car length calculations
carStartDiffPx = imageCenter - bottomLineCenters(2);
carEndDiffPx = imageCenter - topLineCenters(2);

carLengthStartDeg = degUnderCamera + (carStartDiffPx * degreesPerPixel);
carLengthEndDeg = degUnderCamera + (carEndDiffPx * degreesPerPixel);

startLength = cameraHeight * tand(carLengthStartDeg);
endLength = cameraHeight * tand(carLengthEndDeg);
length = endLength - startLength;

%Convertion of the difference in pixels to difference in degrees
startDiffDeg = degUnderCamera + (startDiffPx * degreesPerPixel);
endDiffDeg = degUnderCamera + (endDiffPx * degreesPerPixel);

%Convertion including the degree
startDistance = cameraHeight * tand(startDiffDeg);
endDistance = cameraHeight * tand(endDiffDeg);

%Compare distance 
distanceTravelled = endDistance - startDistance;
speedMeteres = distanceTravelled / timeInterval;

% Convertion from miles per second to miles per hour
speedMiles = speedMeteres * 2.24;

% Boolean check if the car is speeding
isSpeeding = speedMiles > 30;

% Transform to 'Y' or 'N'
resultIsSpeeding = 'N'; % Default value
if isSpeeding
    resultIsSpeeding = 'Y';
end
