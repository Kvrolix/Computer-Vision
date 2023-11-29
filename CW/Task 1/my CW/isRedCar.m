function isRedCar = isRedCar(imagePath)

    %Read image
    image = imread(imagePath);


    % Convert image to HSV color space
    hsvImage = rgb2hsv(image);

    % Define red color range in HSV
    lowerHSV = [0, 0.4, 0.2]; 
    upperHSV = [0.1, 1, 1];  

    % Threshold the HSV image to get the red color only
    binaryImage = (hsvImage(:, :, 1) >= lowerHSV(1)) & (hsvImage(:, :, 1) <= upperHSV(1)) & ...
                  (hsvImage(:, :, 2) >= lowerHSV(2)) & (hsvImage(:, :, 2) <= upperHSV(2)) & ...
                  (hsvImage(:, :, 3) >= lowerHSV(3)) & (hsvImage(:, :, 3) <= upperHSV(3));

    % Check the red percentage on the picture
    percentageRed = sum(binaryImage(:)) / numel(binaryImage) * 100;

    isRedCar = percentageRed > 1;    
end

