function [outputArg1,outputArg2] = 23(inputArg1,inputArg2)
%23 Summary of this function goes here
%   Detailed explanation goes here
outputArg1 = inputArg1;
outputArg2 = inputArg2;
end

% %Get measures
% if strcmp(type,'car')
%     image1=imread(imagePath1);
%     [startMeasures,bottomLineCenters,topLineCenters,topRightCorner,topLeftCorner] = getMeasures(image1);
% 
%     image2=imread(imagePath2);
%     endMeasures = getMeasures(image2);
% elseif strcmp(type,'truck')
%     % image1=imread(imagePath1);
%     % [startMeasures,bottomLineCenters,topLineCenters,topRightCorner,topLeftCorner] = fireTruckMeasures(image1);
% 
%     % image2=imread(imagePath2);
%     % endMeasures = fireTruckMeasures(image2);
% else
%     error('Invalid type. Supported types are "car" and "truck".')
% end
