// const base64String = fileToBase64('image.png');



// content = `INSERT INTO OUTFITS(NAME, TAGS, IMAGE) VALUES("Shirt", "BLUE, STRIPES", "data:image/png;base64,` +base64String + `");`;

// fs.writeFile('output.sql', content, (err) => {
//     if (err) {
//       console.error(err);
//       return;
//     }
//     console.log('File has been written successfully.');
//   });

/*
// STEPS TO RUN THIS!
1.If you upload an image to img, make sure you add it to image array as an object!!
2. Run 'node toBase64.js' in terminal when in Data_Conversion folder
3. Put all of output.sql into insert.sql in src/init_data
4. Then docker compose up, yay!!
*/

// NEED TO RUN  node toBase64.js IF YOU ADD TO THIS!!!
const fs = require('fs');


// CONVERTS FILE PATH TO BASE64
function fileToBase64(filePath) {
  const fileData = fs.readFileSync(filePath);
  return fileData.toString('base64');
}


// IMAGE ARRAY WITH TAGS AND FILE PATH
image_array = [
    {
        name: 'Skirt',
        tag: 'green',
        filename: 'img/image1.jpeg'
    },
    {
        name: 'Shirt',
        tag: 'blue',
        filename: 'img/image2.jpeg'
    },
    {
        name: 'Dress',
        tag: 'blue',
        filename: 'img/image3.jpeg'
    },
    {
        name: 'Dress',
        tag: 'blue',
        filename: 'img/image4.jpeg'
    },
    {
        name: 'Skirt',
        tag: 'green',
        filename: 'img/image5.jpeg'
    },
]

// make insert into file that will go into insert.sql!!!
let inserts = "";
for(let i = 0; i < image_array.length; i++) {
    const base64String = fileToBase64(image_array[i].filename);
    content = `INSERT INTO OUTFITS(NAME, TAGS, IMAGE) VALUES('${image_array[i].name}', '${image_array[i].tag}', "data:image/png;base64,${base64String}')'`;
    inserts += content + '\n';
    
}

// write all inserts into output.sql!!!
fs.writeFile('output.sql', inserts, (err) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log('File has been written successfully.');
  });





