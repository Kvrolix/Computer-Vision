function [length, width] = measureVehicleSize(bottomLineCenters, topLineCenters, topRightCorner, topLeftCorner, cameraSettings)
    % measureVehicleSize estimates the size of a vehicle from images.
    % It calculates the vehicle's length and width using the positions of various points
    % on the vehicle in the images and the camera settings.
    %
    % Inputs:
    %   bottomLineCenters - Array containing the positions of bottom line centers of the vehicle
    %   topLineCenters - Array containing the positions of top line centers of the vehicle
    %   topRightCorner, topLeftCorner - Arrays containing positions of top corners of the vehicle
    %   cameraSettings - A structure containing parameters such as camera height, degree under camera, and degrees per pixel
    %
    % Outputs:
    %   length - The estimated length of the vehicle
    %   width - The estimated width of the vehicle

    % Camera settings
    cameraHeight = cameraSettings.cameraHeight;
    degUnderCamera = cameraSettings.degUnderCamera;
    degreesPerPixel = cameraSettings.degreesPerPixel;
    imageCenterWidth = cameraSettings.imageWidth / 2;
    imageCenter = cameraSettings.imageCenter;

    % Width calculation
    carStartWidthPx = imageCenterWidth - topRightCorner(1);
    carEndWidthPx =  imageCenterWidth - topLeftCorner(1);
    carWidthStartDeg = degUnderCamera + (carStartWidthPx * degreesPerPixel);
    carWidthEndDeg = degUnderCamera + (carEndWidthPx * degreesPerPixel);
    startWidth = cameraHeight * tand(carWidthStartDeg);
    endWidth = cameraHeight * tand(carWidthEndDeg);
    width = (endWidth - startWidth) / 2;

    % Length calculation
    carStartDiffPx = imageCenter - bottomLineCenters(2);
    carEndDiffPx = imageCenter - topLineCenters(2);
    carLengthStartDeg = degUnderCamera + (carStartDiffPx * degreesPerPixel);
    carLengthEndDeg = degUnderCamera + (carEndDiffPx * degreesPerPixel);
    startLength = cameraHeight * tand(carLengthStartDeg);
    endLength = cameraHeight * tand(carLengthEndDeg);
    length = endLength - startLength;
end
