

% STEP 1: GETTING THE THRESHOLD

%load the image
img = imread('coins.png');

%turn the RGB image into the gray scale
img_grayscale = rgb2gray(img);
threshhold = 0.34;
%turn the gray scale img into binary image(black and white)
img_binary = imbinarize(img_grayscale,threshhold);

%output
%imshow(img_binary)
%imhist(img_grayscale)


% STEP 2: REMOVING NOISE FROM BINARY IMAGE
% We can remove small noise by eroding the image

%fist we need to construct a structural element (It can have various types)
% then we are setting what image we would like to use ofr eroding and their
% settings


structEl = strel('square',2);
img_erode = imerode(img_binary,structEl);
%imshow(img_erode)



%When we have our image cleaned up that it doesn't have any grains of sand
%To remove the insides we need use the closing operation

structEl2 = strel('square',17);

closing_img = imclose(img_erode,structEl2);

%imshow(closing_img);

%If its matter of few pixels then this can be adjusted in the labelling


% STEP 3: Detect coins and their paremeters
% Applying labelling algorithm
% applied only to a final binary image



% L contains label and the coordinates of pixels of regions
%num is the number of regions
[L,num] = bwlabel(closing_img,4);


rgb_img = label2rgb(L);

figure,imshow(rgb_img), hold on

stats = regionprops(L,'ConvexArea','Perimeter','Centroid');
stats.ConvexArea



% STEP4: DRAW LOCATIONS OF THE COINS
% We use centroids of the regions to draw a small cross at eeach location,
% so it can be found by the 'robot'

area = [stats.ConvexArea];
location = [stats.Centroid];

% i - index , step of two, finish at the size of the vector(array)
counter = 1;
for i=1:2:length(location)

    % horizontal bar (x1,x2) (y1,y2)
    x = [location(i)-10,location(i)+10];
    y = [location(i+1),location(i+1)];
    plot(x,y,'LineWidth',1,'Color',[0,0,0]);

    %vertical bar
    x = [location(i),location(i)];
    y = [location(i+1)-10, location(i+1)+10];
    plot(x,y,'LineWidth',1,'Color',[0,0,0])

    if(area(counter) <= 3900)
        text(x(1),y(1)+10,'5 Pence','EdgeColor','red')
    elseif(area(counter) >3900 && area(counter) < 6050)
        text(x(1),y(1)+10,'1 Pound','EdgeColor','red')
    elseif(area(counter) >6050 && area(counter) < 8030 )
        text(x(1),y(1)+10,'2 Pence','EdgeColor','red')
    else
        text(x(1),y(1)+10,'2 Pound','EdgeColor','red')

    end
   counter = counter +1;


end



% Exercise 1 and Exercise 2


% Ex1
