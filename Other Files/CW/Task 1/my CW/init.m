function [cameraSettings, percentageRed, percentageRed2] = init(image1,image2)
     % Initialize camera settings
    cameraSettings = initializeCameraSettings();

    % Check red dominance in both images
    percentageRed = checkRedDominance(image1);
    percentageRed2 = checkRedDominance(image2);
end

