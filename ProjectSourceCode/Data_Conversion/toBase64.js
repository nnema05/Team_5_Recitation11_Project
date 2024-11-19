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
    {
        name: 'Shoes',
        tag: 'brown',
        filename: 'img/image6.jpeg'
    },
    {
        name: 'Shirt',
        tag: 'brown',
        filename: 'img/image7.jpeg'
    },
    {
        name: 'Cardigan',
        tag: 'tan',
        filename: 'img/image8.jpeg'
    },
    {
        name: 'Sweater',
        tag: 'multicolor',
        filename: 'img/image9.jpeg'
    },
    {
        name: 'Shirt',
        tag: 'red',
        filename: 'img/image10.jpeg'
    },
    {
        name: 'Overalls',
        tag: 'blue',
        filename: 'img/image11.jpeg'
    },
    {
        name: 'Shirt',
        tag: 'tan',
        filename: 'img/image12.jpeg'
    },
    {
        name: 'Sweatshirt',
        tag: 'gray',
        filename: 'img/image13.jpeg'
    },
    {
        name: 'Cardigan',
        tag: 'blue',
        filename: 'img/image14.jpeg'
    },
    {
        name: 'Sweater',
        tag: 'white',
        filename: 'img/image15.jpeg'
    },
    {
        name: 'Sweater',
        tag: 'multicolor',
        filename: 'img/image16.jpeg'
    },
    {
        name: 'Dress',
        tag: 'green',
        filename: 'img/image17.jpeg'
    },
    {
        name: 'Vest',
        tag: 'blue',
        filename: 'img/image18.jpeg'
    },
    {
        name: 'Sweater',
        tag: 'green',
        filename: 'img/image12.jpeg'
    },
    {
        name: 'Shirt',
        tag: 'black',
        filename: 'img/image19.jpeg'
    },
    {
        name: 'Shirt',
        tag: 'black',
        filename: 'img/image20.jpeg'
    },
    {
        name: 'Pants',
        tag: 'purple',
        filename: 'img/image21.jpeg'
    },
    {
        name: 'Dress',
        tag: 'green',
        filename: 'img/image22.jpeg'
    },
    {
        name: 'Jacket',
        tag: 'brown',
        filename: 'img/image23.jpeg'
    },
    {
        name: 'Shirt',
        tag: 'green',
        filename: 'img/image24.jpeg'
    },
    {
        name: 'Overalls',
        tag: 'blue',
        filename: 'img/image25.jpeg'
    },
    {
        name: 'Vest',
        tag: 'multicolor',
        filename: 'img/image26.jpeg'
    },
    {
        name: 'Jacket',
        tag: 'blue',
        filename: 'img/image27.jpeg'
    },
    {
        name: 'Dress',
        tag: 'blue',
        filename: 'img/image28.jpeg'
    },
    {
        name: 'Vest',
        tag: 'tan',
        filename: 'img/image29.jpeg'
    },
    {
        name: 'Shirt',
        tag: 'white',
        filename: 'img/image30.jpeg'
    },

























    
]

// make insert into file that will go into insert.sql!!!
let inserts = "";
for(let i = 0; i < image_array.length; i++) {
    const base64String = fileToBase64(image_array[i].filename);
    content = `INSERT INTO OUTFITS(NAME, TAGS, IMAGE) VALUES('${image_array[i].name}', '${image_array[i].tag}', 'data:image/png;base64,${base64String}');`;
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





