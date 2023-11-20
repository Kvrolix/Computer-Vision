function func_test(image_name)
%read image into variable im
im = imread(image_name);
bw = im2bw(im,0.7);
[L,num] = bwlabel(bw,4);
rgb = label2rgb(L);
figure, imshow(L)
end
