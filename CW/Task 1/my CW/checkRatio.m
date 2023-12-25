%Function to check the ratio, taking the width and length of the object as
%the input arguments and returning the actual ratio (width/length) and the
%boolean value which checks if the ratio is correct (1:3)
function [ratio,resultBool] = checkRatio(width, length)
   
    % Tolerance
    tolerance = 0.10; 

    % Ratio calcualtions including the tolerance 
    ratio = (width/length) - tolerance;

    %Returns the boolean value checking wether the ratio is correct (1:3)
    if ratio > 0.40
        resultBool = true;
    else
        resultBool = false;
    end
end