INSERT INTO OUTFITS(NAME, TAGS, IMAGE) VALUES('Skirt', 'green', 'img/image1.jpeg');
INSERT INTO OUTFITS(NAME, TAGS, IMAGE) VALUES('Shirt', 'blue', 'img/image2.jpeg');
INSERT INTO OUTFITS(NAME, TAGS, IMAGE) VALUES('Dress', 'blue', 'img/image3.jpeg');
INSERT INTO OUTFITS(NAME, TAGS, IMAGE) VALUES('Skirt', 'green', 'img/image5.jpeg');
INSERT INTO OUTFITS(NAME, TAGS, IMAGE) VALUES('Shoes', 'brown', 'img/image6.jpeg');
INSERT INTO OUTFITS(NAME, TAGS, IMAGE) VALUES('Shirt', 'brown', 'img/image7.jpeg');
INSERT INTO OUTFITS(NAME, TAGS, IMAGE) VALUES('Cardigan', 'tan', 'img/image8.jpeg');
INSERT INTO OUTFITS(NAME, TAGS, IMAGE) VALUES('Sweater', 'multicolor', 'img/image9.jpeg');
INSERT INTO OUTFITS(NAME, TAGS, IMAGE) VALUES('Shirt', 'red', 'img/image10.jpeg');
INSERT INTO OUTFITS(NAME, TAGS, IMAGE) VALUES('Overalls', 'blue', 'img/image11.jpeg');
INSERT INTO OUTFITS(NAME, TAGS, IMAGE) VALUES('Shirt', 'tan', 'img/image12.jpeg');
INSERT INTO OUTFITS(NAME, TAGS, IMAGE) VALUES('Sweatshirt', 'gray', 'img/image13.jpeg');
INSERT INTO OUTFITS(NAME, TAGS, IMAGE) VALUES('Cardigan', 'blue', 'img/image14.jpeg');
INSERT INTO OUTFITS(NAME, TAGS, IMAGE) VALUES('Sweater', 'white', 'img/image15.jpeg');
INSERT INTO OUTFITS(NAME, TAGS, IMAGE) VALUES('Sweater', 'multicolor', 'img/image16.jpeg');
INSERT INTO OUTFITS(NAME, TAGS, IMAGE) VALUES('Dress', 'green', 'img/image17.jpeg');
INSERT INTO OUTFITS(NAME, TAGS, IMAGE) VALUES('Vest', 'blue', 'img/image18.jpeg');
INSERT INTO OUTFITS(NAME, TAGS, IMAGE) VALUES('Sweater', 'green', 'img/image12.jpeg');
INSERT INTO OUTFITS(NAME, TAGS, IMAGE) VALUES('Shirt', 'black', 'img/image19.jpeg');
INSERT INTO OUTFITS(NAME, TAGS, IMAGE) VALUES('Shirt', 'black', 'img/image20.jpeg');
INSERT INTO OUTFITS(NAME, TAGS, IMAGE) VALUES('Pants', 'purple', 'img/image21.jpeg');
INSERT INTO OUTFITS(NAME, TAGS, IMAGE) VALUES('Dress', 'green', 'img/image22.jpeg');
INSERT INTO OUTFITS(NAME, TAGS, IMAGE) VALUES('Jacket', 'brown', 'img/image23.jpeg');
INSERT INTO OUTFITS(NAME, TAGS, IMAGE) VALUES('Shirt', 'green', 'img/image24.jpeg');
INSERT INTO OUTFITS(NAME, TAGS, IMAGE) VALUES('Overalls', 'blue', 'img/image25.jpeg');
INSERT INTO OUTFITS(NAME, TAGS, IMAGE) VALUES('Vest', 'multicolor', 'img/image26.jpeg');
INSERT INTO OUTFITS(NAME, TAGS, IMAGE) VALUES('Jacket', 'blue', 'img/image27.jpeg');
INSERT INTO OUTFITS(NAME, TAGS, IMAGE) VALUES('Dress', 'blue', 'img/image28.jpeg');
INSERT INTO OUTFITS(NAME, TAGS, IMAGE) VALUES('Vest', 'tan', 'img/image29.jpeg');
INSERT INTO OUTFITS(NAME, TAGS, IMAGE) VALUES('Shirt', 'white', 'img/image30.jpeg');

ALTER TABLE users
ADD COLUMN last_seen_id INTEGER DEFAULT 1; -- Default to 1 (first outfit)