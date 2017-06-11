#!/bin/bash

# generates the 18 gtown dummy images for a single dummy image
imageName="marker-industrial.png"
prefixes=("hist" "land" "parks" "qual" "safe" "transp")
suffixes=("_complete" "_no-prog-or-dead" "_prog")
destPath="static/css/images/markers/"

for p in "${prefixes[@]}"
do
    echo "at $p"
    for s in "${suffixes[@]}"
    do
        newFile="${destPath}marker-${p}${s}.png"
        echo "creating new image at ${newFile}"
        cp $imageName $newFile
    done
        
done
