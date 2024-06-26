import React, { useState, useEffect } from "react";
import { storage, db } from "../firebase.js";
import { ref, listAll, getDownloadURL } from "firebase/storage";
import { doc, getDoc,collection, query, where, getDocs } from "firebase/firestore";
import { useParams } from "react-router-dom";

const ImageDisplay = () => {
  const { number } = useParams();
  const [imageUrl, setImageUrl] = useState("");
  const [textValue, setTextValue] = useState("");

  useEffect(() => {
    const fetchImageAndText = async () => {
      try {
        // Fetch image from Firebase Storage
        const storageRef = await ref(storage, "images");
        const imagesList = await listAll(storageRef);

        const image = imagesList.items.find(item =>
          item.name.startsWith(`${number}_`)
        );

        if (image) {
          const url = await getDownloadURL(image);
          setImageUrl(url);
        } else {
          setImageUrl("");
          console.log("No image found for this number.");
        }

        // Fetch additional information text from Firestore
        const uploadsRef = collection(db, "uploads");
        const q = query(uploadsRef, where("number", "==", parseInt(number)));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          querySnapshot.forEach(doc => {
            setTextValue(doc.data().text);
          });
         }
          else {
          setTextValue("No additional information found for this number.");
        }
      } catch (error) {
        console.error("Error fetching image or text:", error);
        setImageUrl("");
        setTextValue("Error fetching image or text.");
      }
    };

    fetchImageAndText();
  }, [number]);

  return (
    <div className="image-display">
      <h2>Image Display</h2>
      {imageUrl ? (
        <img
          src={imageUrl}
          alt="Uploaded"
          style={{ maxWidth: "100%", maxHeight: "400px" }}
        />
      ) : (
        <div>No image found for this number.</div>
      )}
      <div className="text-display">
        <h3>Additional Information</h3>
        <textarea
          value={textValue}
          readOnly
          style={{ width: "100%", height: "100px" }}
        />
      </div>
    </div>
  );
};

export default ImageDisplay;
