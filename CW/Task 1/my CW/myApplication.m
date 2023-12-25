function myApplication(image1,image2)
% image 1 and 2 are the images already remeber that as it solves all the issues
% ADD FINAL TO ALL THE FUNCTIONS THAT I AM GOING TO USE 
% AND REMOVE THE READING THE IMAGE FROM INSIDE OF THE FUNCTION
% if the error appers maybe you could of selected wrong picture e,g image not image1
% check for 2 blue cars on two images

% check for 2 red cars 
% [isCarRed, binaryImage]=FINAL_isRed(image1);
% imshow(binaryImage);
% [isCarRed, ~,percentageRed]=FINAL_isRed(image1);

[~,percentageRed]=isRed(image1);
[~,percentageRed2]=isRed(image2);

if (percentageRed < 1 & percentageRed2 > 1) | (percentageRed > 1 & percentageRed2 <1)
    error('Error. Try matching images! ')
elseif percentageRed > 10
    [startMeasures, bottomLineCenters, topLineCenters,topRightCorner,topLeftCorner] = fireTruckMeasures(image1);
    endMeasures = fireTruckMeasures(image2);
    [resultIsSpeeding, speedMiles, length, width] = CombinedCheckSpeedAndSize(image1,image2,startMeasures,endMeasures,bottomLineCenters,topLineCenters,topRightCorner,topLeftCorner);

    [ratio,resCorrRatio] = checkRatio(width, length);
    isFireEngine = checkFireEngine(resCorrRatio,percentageRed);
    oversizedResult = checkOversized(width);
    colourResult = checkCarColor(percentageRed);  
  
%check for NOT Red Cars
elseif percentageRed < 10
    [startMeasures,bottomLineCenters,topLineCenters,topRightCorner,topLeftCorner] = getMeasures(image1);
    endMeasures = getMeasures(image2);
    [resultIsSpeeding,speedMiles,length, width] = CombinedCheckSpeedAndSize(image1,image2,startMeasures,endMeasures,bottomLineCenters,topLineCenters,topRightCorner,topLeftCorner);
    
    [ratio,resCorrRatio] = checkRatio(width, length);
    isFireEngine = checkFireEngine(resCorrRatio,percentageRed);
    oversizedResult = checkOversized(width);
    colourResult = checkCarColor(percentageRed);
  
else
    % image 1 percentage is 0 and the other > 1 check the input images and try again
    error('Error. Check if you have not made any typos!')
end

fprintf('\nThe width: %.2f metres \n', width);
fprintf('The length: %.2f metres \n', length);
fprintf('Car width/length ratio: %.2f \n', ratio); 
fprintf('Car colour: Is the car red? %s \n', colourResult); 
fprintf('Car speed: %.2f mph \n', speedMiles);
fprintf('Car is speeding (Y/N): %s\n', resultIsSpeeding);
fprintf('Car is oversized (Y/N): %s\n', oversizedResult) 
fprintf('Car is a fire engine (Y/N): %s\n', isFireEngine);


