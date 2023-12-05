function myApplication(image1,image2)
% image 1 and 2 are the images already remeber that as it solves all the issues
% ADD FINAL TO ALL THE FUNCTIONS THAT I AM GOING TO USE 
% AND REMOVE THE READING THE IMAGE FROM INSIDE OF THE FUNCTION
% if the error appers maybe you could of selected wrong picture e,g image not image1
% check for 2 blue cars on two images

% check for 2 red cars 
% [isCarRed, binaryImage]=FINAL_isRed(image1);
% imshow(binaryImage);
% [isCarRed, ~]=FINAL_isRed(image1);

% if isCarRed > 0
[startMeasures, bottomLineCenters, topLineCenters,topRightCorner,topLeftCorner] = FINAL_fireTruckMeasures(image1);
endMeasures = FINAL_fireTruckMeasures(image2);
[resultIsSpeeding,speedMiles,length, width] = FINAL_CombinedCheckSpeedAndSize(image1,image2,startMeasures,endMeasures,bottomLineCenters,topLineCenters,topRightCorner,topLeftCorner);
% end


%NORMAL BLUE CAR WORKS
% [startMeasures,bottomLineCenters,topLineCenters,topRightCorner,topLeftCorner] = FINAL_getMeasures(image1);
% endMeasures = FINAL_getMeasures(image2);
% [resultIsSpeeding,speedMiles,length, width] = FINAL_CombinedCheckSpeedAndSize(image1,image2,startMeasures,endMeasures,bottomLineCenters,topLineCenters,topRightCorner,topLeftCorner);



%FIRE TRUCK 




%check ratio




%check If a colour is red


function redCarCheck = checkColour(isCarRed) 
    redCarCheck ='N';
if isCarRed
    redCarCheck = 'T';
end


%Check if a car is a fire engine



%check if a car is oversized on image 1

isOversized = width > 2.5;
oversizedResult = 'N';

if isOversized
    oversizedResult = 'Y';
end


% check if they are in the ridght order
fprintf('The length is: %.2f metres\n',length);
fprintf('The width is: %.2f metres \n',width);
fprintf('The speed is: %.2f mph \n',speedMiles);
fprintf('Car width/length ratio: %.2f\n', width / length); %fix
fprintf('Car colour: Is the car red? %d\n',redCarCheck); 
fprintf('Car is speeding: %s\n', resultIsSpeeding);
% fprintf('Car is a fire engine: %s\n', isFireEngine);
% fprintf('Car is oversized: %s\n', isOversized) %fix




%get the measureements



% [isCarRed,~] = isRed(image1);
% [isCarRed2,~] = isRed(image2);

%get measures works only for blue cars

%add check for oversized

% if isCarRed && isCarRed2 
    %Fire truck
    % [startMeasures, bottomLineCenters, topLineCenters,topRightCorner,topLeftCorner] = fireTruckMeasures(image1);
    % endMeasures = fireTruckMeasures(image2);
    % [isSpeeding,speedMiles,length, width,endMeasures] = CombinedCheckSpeedAndSize(image1,image2,startMeasures,endMeasures,bottomLineCenters,topLineCenters,topRightCorner,topLeftCorner);
% end
    %call the measure function with extra argument
% else
%     normalCarMeasures(image1)
%     %Normal car
%     [startMeasures,bottomLineCenters,topLineCenters,topRightCorner,topLeftCorner] = getMeasures('001.jpg');
%     endMeasures = getMeasures('002.jpg');
%     [isSpeeding,speedMiles,length, width,endMeasures] = CombinedCheckSpeedAndSize('001.jpg','002.jpg',startMeasures,endMeasures,bottomLineCenters,topLineCenters,topRightCorner,topLeftCorner);
% 
% end





% 
% if isCarRed 
%     %Fire truck
%     [startMeasures, bottomLineCenters, topLineCenters,topRightCorner,topLeftCorner] = fireTruckMeasures('fire01.jpg');
%     endMeasures = getMeasures('fire02.jpg');
%     [isSpeeding,speedMiles,length, width,endMeasures] = CombinedCheckSpeedAndSize('001.jpg','002.jpg',startMeasures,endMeasures,bottomLineCenters,topLineCenters,topRightCorner,topLeftCorner);
% 
%     %call the measure function with extra argument
% else
%     normalCarMeasures(image1)
%     %Normal car
%     [startMeasures,bottomLineCenters,topLineCenters,topRightCorner,topLeftCorner] = getMeasures('001.jpg');
%     endMeasures = getMeasures('002.jpg');
%     [isSpeeding,speedMiles,length, width,endMeasures] = CombinedCheckSpeedAndSize('001.jpg','002.jpg',startMeasures,endMeasures,bottomLineCenters,topLineCenters,topRightCorner,topLeftCorner);
% 
% end


