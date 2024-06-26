import React, { useEffect, useState } from "react";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  setDoc,
} from "firebase/firestore";
import { publicIpv4 } from "public-ip";
import { db } from "../firebase.js";
import Uploader from "./Uploader.js";

const IndexPage = () => {
  const [ip, setIp] = useState(undefined);
  const [userData, setUserData] = useState(undefined);
  const [isUserData, setIsUserData] = useState(false);
  const [userUrl, setUserUrl] = useState(false);

  const getUserData = async () => {
    const docRef = doc(db, "nrchanger", ip);
    const docSnapshot = await getDoc(docRef);

    if (docSnapshot.exists()) {
      const userData = { ...docSnapshot.data(), id: docSnapshot.id };
      setIsUserData(true);
      setUserData(userData);
    } else {
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
    document.title = "Welcome Index Page";
  }, [userData, userUrl]);

  const addUserData = async () => {
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
          image: "",
        });
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

  console.log("hi here is the data", isUserData, userData);

  return (
    <div className="App">
      <Uploader />
      {/* Other components */}
    </div>
  );
};

export default IndexPage;
