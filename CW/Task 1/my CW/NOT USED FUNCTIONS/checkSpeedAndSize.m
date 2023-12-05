function [isSpeeding,speedMiles,length, width,endMeasures] = checkSpeedAndSize(image1,image2)

%Get measures

% [bottomLineCenters,topLineCenters] = getMeasures(image1);
[startMeasures,bottomLineCenters,topLineCenters,topRightCorner,topLeftCorner] = getMeasures(image1);
endMeasures = getMeasures(image2); % The coords of the second image as there's no need for the rest of calucations

cameraHeight = 7;
degUnderCamera = 60;
degreesPerPixel = 0.042;
timeInterval = 0.1;


% size(image1) %%%%%% add it
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

 
%Do the same for the width %COMPLETED
carStartWidthPx = imageCenterWidth - topRightCorner(1);
carEndWidthPx =  imageCenterWidth - topLeftCorner(1);

carWidthStartDeg = degUnderCamera + (carStartWidthPx * degreesPerPixel);
carWidthEndDeg = degUnderCamera + (carEndWidthPx * degreesPerPixel);

startWidth = cameraHeight * tand(carWidthStartDeg);
endWidth = cameraHeight * tand(carWidthEndDeg);
width = (endWidth - startWidth) /2;


%Car length calculations % COMPLETED
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

%Boolean value for checks
isSpeeding = speedMiles > 30;



