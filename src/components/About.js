import React, { useEffect, useState } from 'react'
import { addDoc, collection, doc, getDoc, getDocs, onSnapshot, setDoc } from 'firebase/firestore';
import { publicIp, publicIpv4, publicIpv6 } from 'public-ip';
import { db } from '../firebase.js';


const About = () => {
    const [ip, setIp] = useState(undefined);
    const [userData, setUserData] = useState(undefined)
    const [isUserData, setIsUserData] = useState(false)
    const [userUrl, setUserUrl] = useState(false)


    const getUserData = async (e) => {
        const documentSnapshot = await getDocs(collection(db, "urlswap"));
        const newData = documentSnapshot.docs
            .map((doc) => ({ ...doc.data(), id: doc.id }));
        const filter = newData.filter(x => {
            if (x.ip === ip) {
                setIsUserData(true)
                setUserData(x);
                return x;
            }

        })
        if (filter.length === 0) {
            addUserData()
        }
    }


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
            onSnapshot(collection(db, "urlswap"), (snapshot) => {
                let isExist = false
                snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })).filter(x => {
                    if (x.ip === ip) {

                        fetch('./data.json').then(
                            function (res) {
                                return res.json();
                            },
                        ).then(function (data) {

                            data.url_data.filter((item) => {
                                if (item.id === x.number) {
                                    setUserUrl(item.url)
                                    isExist = true
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

    useEffect(() => {
        document.title = 'About TAB';

    }, [userData, userUrl])


    const addUserData = async () => {

        try {
            const docRef = doc(collection(db, "urlswap"), ip);
    
            // Check if the document exists
            const docSnap = await getDoc(docRef);
    
            if (!docSnap.exists()) {
                // Document doesn't exist, so set the data
                await setDoc(docRef, {
                    ip: ip,
                    number: -1
                });
                console.log("Document written with ID: ", ip);
            } else {
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

    const resetUserNumber = async () => {
        try {
            const docRef = doc(collection(db, "urlswap"), ip);
            await setDoc(docRef, { number: -1 }, { merge: true });
            console.log("User number reset to -1 for IP: ", ip);
        } catch (e) {
            console.error("Error resetting user number: ", e);
        }
    };

    if (userUrl) {
        setTimeout(()=>{
            window.location = userUrl
        },1000)
        resetUserNumber()
    }

    return (
        <div>Welcome About page
            <h1>This /about</h1>
        </div>

    )

}

export default About;