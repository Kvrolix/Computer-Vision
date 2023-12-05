function isFireEngine = checkFireEngine(corrRatio,colour)

if corrRatio < 0.40 & colour > 10
    isFireEngine = 'Y';
else
    isFireEngine = 'N';
end

