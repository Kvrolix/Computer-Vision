function cameraSettings = initializeCameraSettings()
    % Script to initialize camera settings for the stationary speeding camery
    % Structure to hold camera settings
    cameraSettings = struct;
    
    % Define each camera parameter
    cameraSettings.cameraHeight = 7;             % Height of the camera in meters
    cameraSettings.degUnderCamera = 60;          % Angle under the camera in degrees
    cameraSettings.degreesPerPixel = 0.042;      % Degrees per pixel
    cameraSettings.imageCenter = 640 / 2;        % Center of the image (Y-coordinate)
    cameraSettings.imageWidth = 480;             % Width of the image (X-coordinate)
    cameraSettings.timeInterval = 0.1;           % Time interval between images in seconds

end