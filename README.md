# autobahnraser-extractor
A extractor for the game files of Autobahnraser from 1997


## Installation

```bash
git clone https://github.com/jangxx/autobahnraser-extractor
cd autobahnraser-extractor
npm install
```

## Usage

The files are always packaged inside of two files, a .ind and a .img file.
So if you want to extract mrcs.ind and mrcs.img you would do

```bash
node extractor.js -I mrcs
```

The script would then extract the files to a directory named `mrcs`.
You can use the `-O` parameter to change the output directory and the `-D` parameter to set the path of the input files.
