import React, { useState } from 'react';
import { storage, db } from "../firebase.js";
import { ref, getDownloadURL, uploadBytesResumable } from "firebase/storage";
import { addDoc, collection, doc, getDoc, getDocs, onSnapshot, setDoc } from 'firebase/firestore';


const Uploader = () => {
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [textValue, setTextValue] = useState('');
  const [uploading, setUploading] = useState(false);
  const [randomNumber, setRandomNumber] = useState('');
  const [isValidUrl, setIsValidUrl] = useState(false);

  // Function to handle file input changes
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImageUrl(''); // Clear image URL when a file is selected
      setIsValidUrl(false); // Reset URL validation
    }
  };

  // Function to handle image URL input changes
  const handleImageUrlChange = (e) => {
    const url = e.target.value.trim();
    setImage(null); // Clear selected image when URL is entered
    setImageUrl(url);
    checkImage(url);
  };

  // Function to validate if a URL points to an image
  const checkImage = (url) => {
    if (!url) {
      setIsValidUrl(false);
      return;
    }
    fetch(url)
      .then(response => {
        if (response.ok && response.headers.get('content-type').startsWith('image')) {
          setIsValidUrl(true);
        } else {
          setIsValidUrl(false);
        }
      })
      .catch(() => {
        setIsValidUrl(false);
      });
  };

  // Function to handle text input changes
  const handleTextChange = (e) => {
    setTextValue(e.target.value);
  };

  // Function to handle image upload to Firebase Storage
  const handleUpload = async () => {
    const randomNumber = Math.floor(1000000000000000 + Math.random() * 9000000000000000); 
    if ((!image || !textValue.trim()) && !isValidUrl) {
      alert('Please select an image file and enter some text, or enter a valid image URL');
      return;
    }

    setUploading(true);

    if (image) {
      // Handle file upload
      const storageRef = ref(storage, `images/${randomNumber.toString()}_${image.name}`);
      const uploadTask = uploadBytesResumable(storageRef, image);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`Upload is ${progress}% done`);
        },
        (error) => {
          console.error('Error uploading image: ', error);
          alert('Error uploading image');
          setUploading(false);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then(async (downloadURL) => {
            console.log('File available at', downloadURL);
            setImageUrl(downloadURL);
            setRandomNumber(randomNumber);
            setUploading(false);

            // Save additional information to Firestore
            try {
              const docRef = await addDoc(collection(db, "uploads"), {
                number: randomNumber,
                text: textValue
              });
              console.log("Document written with ID: ", docRef.id);
            } catch (e) {
              console.error("Error adding document: ", e);
            }
          });
        }
      );
    } else if (isValidUrl) {
      // Handle URL upload
      fetch(imageUrl)
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], `${randomNumber.toString()}_${imageUrl.split('/').pop()}`, { type: blob.type });
          const storageRef = ref(storage, `images/${file.name}`);
          const uploadTask = uploadBytesResumable(storageRef, file);

          uploadTask.on(
            'state_changed',
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              console.log(`Upload is ${progress}% done`);
            },
            (error) => {
              console.error('Error uploading image: ', error);
              alert('Error uploading image');
              setUploading(false);
            },
            () => {
              getDownloadURL(uploadTask.snapshot.ref).then(async (downloadURL) => {
                console.log('File available at', downloadURL);
                setImageUrl(downloadURL);
                setRandomNumber(randomNumber);
                setUploading(false);

                // Save additional information to Firestore
                try {
                  const docRef = await addDoc(collection(db, "uploads"), {
                    number: randomNumber,
                    text: textValue
                  });
                  console.log("Document written with ID: ", docRef.id);
                } catch (e) {
                  console.error("Error adding document: ", e);
                }
              });
            }
          );
        })
        .catch(error => {
          console.error('Error fetching image from URL: ', error);
          alert('Error fetching image from URL');
          setUploading(false);
        });
    } else {
      alert('Please select an image file or enter a valid image URL');
      setUploading(false);
    }
  };

  return (
    <div className="container">
      <div className="upload-section">
        <h2>Image Upload</h2>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
        />
        <div className="image-preview">
          {imageUrl && (
            <img src={imageUrl} alt="Selected" style={{ maxWidth: '100%', maxHeight: '200px' }} />
          )}
          {!imageUrl && (
            <div className="preview-text">Please select an image for preview</div>
          )}
        </div>
      </div>
      <div className="info-section">
        <h2>Additional Information</h2>
        <input
          type="text"
          placeholder="Enter additional information..."
          value={textValue}
          onChange={handleTextChange}
        />
        <input
          type="text"
          placeholder="Enter image URL..."
          value={imageUrl}
          onChange={handleImageUrlChange}
        />
        <button
          onClick={handleUpload}
          disabled={!((image && textValue.trim()) || isValidUrl)}
        >
          {uploading ? 'Uploading...' : 'Upload Image'}
        </button>
        {randomNumber && (
          <div>
            <h3>Random Number</h3>
            <input type="text" value={randomNumber} readOnly />
          </div>
        )}
      </div>
    </div>
  );
};

export default Uploader;
