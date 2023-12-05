function [ratio,resultBool] = checkRatio(width, length)
   
    % Set the tolerance
    tolerance = 0.10;  % You can adjust this value based on your requirements

    % Check if the actual ratio is within the tolerance of the target ratio
    ratio = (width/length) - tolerance;
  
    % Return 'true' if the ratio condition is met, 'false' otherwise
    if ratio > 0.40
        resultBool = true;
    else
        resultBool = false;
    end
end