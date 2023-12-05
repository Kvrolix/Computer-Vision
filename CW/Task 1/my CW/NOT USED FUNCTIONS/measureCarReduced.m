
function measuremements = measureCar3(imagePath)

image=imread(imagePath);


%Thresholding based on a grayscale
image_grey = rgb2gray(image);

% image_binary = imbinarize(image_grey,'adaptive')
threshold = 0.2;

edgeImage= edge(image_grey,'Canny',threshold);
imshow(edgeImage);
% Region props to get properties for each region



labeledImage = bwlabel(edgeImage);

imshow(labeledImage)

stats = regionprops(labeledImage,'BoundingBox','Area');

%measurements
measurements = struct('BoundingBox',[],'Area',[]);

if ~isempty(stats)
        % Find the region with the maximum area
        [~, maxAreaIndex] = max([stats.Area]);

        % Retrieve bounding box and area information for the largest region
        measurements.BoundingBox = stats(maxAreaIndex).BoundingBox;
        measurements.Area = stats(maxAreaIndex).Area;

        % Optional: Display the original image and the bounding box with blue color
        figure;
        % imshow(image);
        hold on;

        % Draw the bounding box for the largest region with blue color
        rectangle('Position', measurements.BoundingBox, 'EdgeColor', 'b', 'LineWidth', 2);

        hold off;
    else
        disp('No car found in the image.');
end
end




