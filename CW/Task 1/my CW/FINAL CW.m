


%{

if the car is red
    if not then run 




Check for oversized cars
if the car width > 2.5m
if the function ratio 1:3 will give false
if the car is not red


Fire Truck logic:

FOR FIRE TRUCK I NEED TO CALL IT WIDTH DIFFERENT THRESHOLD
E.G function measurements = measureCar(imagePath, edgeThreshold, minCarArea)

if the car is red
if the car has ratio 1:3

if the car is speeding? (Only check, it doesn't brake the rules) 
create output 

Speeding:
compare picture 1 and 2 

get the bottom left and right corners and measure it's distance, actually i
need just either left or giht doesn't need two


002
Region 1: Width = 166.00, Height = 182.00, Area = 24419.00
Top-Left Corner: (149.50, 361.50)
Top-Right Corner: (315.50, 361.50)
Bottom-Left Corner: (149.50, 543.50)
Bottom-Right Corner: (315.50, 543.50)


Region 1: Width = 105.00, Height = 124.00, Area = 11697.00
Top-Left Corner: (197.50, 201.50)
Top-Right Corner: (302.50, 201.50)
Bottom-Left Corner: (197.50, 325.50)
Bottom-Right Corner: (302.50, 325.50)


006



APP LOGIC:

IF THE CAR IS RED, THEN RETURN TRUE AND BINARY IMAGE so i can work on it
here 
    PERFOM A CHECK WITH THE HSV


IF THE CAR IS NOT RED 
    PERFORM A CHECK WITH THE GREY


%}

% [isSpeeding, speed] = checkSpeed('001.jpg','002.jpg');

% [isSpeeding, speedMiles, startWidthMeters, startLengthMeters] = Copy_of_checkSpeed('001.jpg','002.jpg');

% [isSpeeding, speedMiles,difference, widthDifference] = Copy_of_checkSpeed('001.jpg','002.jpg');


% [isCarRed, centers, bottomLineCenters, topLineCenters]=Copy_of_isRed('fire01.jpg');
% [isSpeeding, speedMiles,difference, widthDifference,ratio] = Copy_of_checkSpeed('fire01.jpg','fire02.jpg','truck');

% [isSpeeding,speedMiles,length, width, endMeasures] = checkSpeedAndSize('001.jpg','002.jpg');

% call the function check speed and size with the values from the another
% function

% endMeasures = fireTruckMeasures('fire01.jpg');



%WORK
% [centers, bottomLineCenters, topLineCenters,topRightCorner,topLeftCorner] = fireTruckMeasures('fire01.jpg');

%WORKS
% [centers,bottomLineCenters,topLineCenters,topRightCorner,topLeftCorner] = getMeasures('001.jpg');


%THE PROBLEM IS WITH READING THE IMAGES INSIDE THE FUNCTIONS
image1 = '001.jpg';
% image2 = imread('002.jpg');

[centers,bottomLineCenters,topLineCenters,topRightCorner,topLeftCorner] = FINAL_getMeasures(image1);

% [startMeasures,bottomLineCenters,topLineCenters,topRightCorner,topLeftCorner] = CombinedCheckSpeedAndSize(image1);

% [isSpeeding,speedMiles,length, width,endMeasures] = CombinedCheckSpeedAndSize(image1,image2,startMeasures,endMeasures,bottomLineCenters,topLineCenters,topRightCorner,topLeftCorner);
% Copy_of_getMeasures('fire01.jpg')
