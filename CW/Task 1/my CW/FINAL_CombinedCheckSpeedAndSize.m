function [resultIsSpeeding,speedMiles,length, width] = FINAL_CombinedCheckSpeedAndSize(image1,image2,startMeasures,endMeasures,bottomLineCenters,topLineCenters,topRightCorner,topLeftCorner)

cameraHeight = 7;
degUnderCamera = 60;
degreesPerPixel = 0.042;
timeInterval = 0.1;

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
width = (endWidth - startWidth) /2;


%Car length calculations
carStartDiffPx = imageCenter - bottomLineCenters(2);
carEndDiffPx = imageCenter - topLineCenters(2);

carLengthStartDeg =degUnderCamera + (carStartDiffPx * degreesPerPixel);
carLengthEndDeg = degUnderCamera + (carEndDiffPx * degreesPerPixel);

startLength = cameraHeight * tand(carLengthStartDeg);
endLength = cameraHeight * tand(carLengthEndDeg);
length = endLength - startLength;


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

%% MOVE IT TO A DIFFERENT FUNCTION
% Boolean value for checks
isSpeeding = speedMiles > 30;

% Transform to 'Y' or 'N'
resultIsSpeeding = 'N'; % Default value

if isSpeeding
    resultIsSpeeding = 'Y';
end
%Ratio is oversized bollean value 

% do outside the function 
%fire check test 

%the ratio is 1:3

%and is red
