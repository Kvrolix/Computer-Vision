%Function to check whether the car is a fire truck, taking the percentage
%of the red colour on the picture and and correct ratio of +-
%(1:3)(width:length)
function isFireEngine = checkFireEngine(corrRatio,colour)

if corrRatio < 0.40 & colour > 10
    isFireEngine = 'Y';
else
    isFireEngine = 'N';
end

