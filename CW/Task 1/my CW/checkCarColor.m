%Function to check the percentage of the red colour on the picture to
%determine wether it is present or not
function colourResult = checkCarColor(percentageRed)
    if percentageRed > 10
        colourResult = 'Y';
    else
        colourResult = 'N';
    end
end