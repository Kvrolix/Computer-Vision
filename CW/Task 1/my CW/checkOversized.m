% Function to check whether the car is oversized taking the width as the
% input
function oversizedResult = checkOversized(width)
    isOversized = width > 2.5; 
    if isOversized
        oversizedResult = 'Y';
    else
        oversizedResult = 'N';
    end
end