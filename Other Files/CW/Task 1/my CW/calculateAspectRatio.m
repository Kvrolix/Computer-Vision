% calculateAspectRatio calculates the aspect ratio of a vehicle and determines
% if it falls within an acceptable range considering a tolerance. It returns the
% actual ratio and a boolean indicating if the ratio is within the acceptable range.
%
% Inputs:
%   width - Numeric value representing the width of the vehicle
%   length - Numeric value representing the length of the vehicle
% Outputs:
%   ratio - Calculated aspect ratio (width/length) of the vehicle
%   resultBool - Boolean indicating if the ratio is within the acceptable range (1:3)

function [aspectRatio,isWithinRange] = calculateAspectRatio(width, length)
   
    tolerance = 0.10; 
    aspectRatio = width / length;
    isWithinRange = (aspectRatio >= (1/3 - tolerance)) && (aspectRatio <= (1/3 + tolerance));
end