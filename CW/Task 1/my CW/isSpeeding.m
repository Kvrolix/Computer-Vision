% function [outputArg1,outputArg2] = isSpeeding(image1,image2)


imageStart = getMeasures("001.jpg");
imageEnd = getMeasures("006.jpg");


bottomCornerStartX = imageStart(1);
bottomCornerStartY = imageStart(2);

bottomCornerEndX = imageEnd(1);
bottomCornerEndY = imageEnd(2);

distance = sqrt((bottomCornerEndX - bottomCornerStartX)^2 +(bottomCornerEndY - bottomCornerStartY)^2);

timeInterval = 0.1;
speed = distance / timeInterval;

speedMph = convertToMph(speed);
disp(['The speed is: ' num2str(speedMph) ' mph']);



function speedMph = convertToMph(speed)

pixelsPerDegree = 640 / 30;
degreesPerPixel = 1 / pixelsPerDegree;

% 0.042 degreees per pixel
degreesPerSecond = speed * 0.042;

speedMph = degreesPerSecond * 3600 / degreesPerPixel / 5280;

end


% imageStart = getMeasures(image1);
% imageEnd = getMeasures(image2);



%SPEED LIMIT IS 30 MPH



% end

