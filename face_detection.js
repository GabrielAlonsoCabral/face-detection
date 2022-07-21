const cv = require("opencv4nodejs");
const gm = require("gm");
const path = require("path");
const fs = require("fs-extra");

if (process.argv.length < 3) {
  return console.log(`Usage:
    node face_detection.js <path_to_image>`);
}

const blur = (imagePath, faceDetails) => {
  const extension = path.extname(imagePath);
  const name = path.basename(imagePath, extension);
  let img = gm(imagePath);

  img.size((err, value) => {
    if (err) return console.log(err);

    faceDetails.forEach((faceDetail) => {
      const box = faceDetail,
        width = box.width,
        height = box.height,
        left = box.x,
        top = box.y;

      img.region(width, height, left, top).blur(25, 45);
    });

    console.log(img);

    img.write(
      __dirname + `/pictures/${name}_blured${extension}`,
      function (err) {
        if (!err) {
          console.log("done Wrting .....");
        } else {
          console.error(err);
        }
      }
    );
  });
};

const main = async () => {
  const imagePath = process.argv[2];
  const isExist = fs.existsSync(imagePath);

  if (!isExist)
    return console.error(`Image in path ${imagePath} does not exist.`);

  const image = cv.imread(imagePath);
  const classifier = new cv.CascadeClassifier(cv.HAAR_FRONTALFACE_ALT2);
  const { objects, numDetections } = classifier.detectMultiScale(
    image.bgrToGray()
  );

  console.log("faceRects:", objects);
  console.log("confidences:", numDetections);

  if (!objects.length) {
    return new Error("No faces detected!");
  }

  return blur(imagePath, objects);
};

main();
