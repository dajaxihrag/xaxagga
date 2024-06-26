import React, { useEffect, useState } from 'react'
import { addDoc, collection, doc, getDoc, getDocs, onSnapshot, setDoc } from 'firebase/firestore';
import { publicIp, publicIpv4, publicIpv6 } from 'public-ip';
import { db } from '../firebase.js';


const Rwr = () => {
    const [ip, setIp] = useState(undefined);
    const [userData, setUserData] = useState(undefined)
    const [isUserData, setIsUserData] = useState(false)
    const [userUrl, setUserUrl] = useState(false)


    const getUserData = async (e) => {
        const documentSnapshot = await getDocs(collection(db, "nrchanger"));
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

    useEffect(() => {
        document.title = 'Welcome Rwr';

    }, [userData, userUrl])

    useEffect(() => {

    }, [userData])


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
                    redir: "-1"
                });
                console.log("Document written with ID: ", ip);
                getUserData()
            } else {
                console.log("Document already exists with ID: ", ip);
            }
        } catch (e) {
            console.error("Error adding document: ", e);
        }
    }

    const resetUserNumber = async () => {
        try {
            const docRef = doc(collection(db, "nrchanger"), ip);
            await setDoc(docRef, { redir: "-1" }, { merge: true });
            console.log("User number reset to -1 for IP: ", ip);
        } catch (e) {
            console.error("Error resetting user number: ", e);
        }
    };

    useEffect(() => {
        if (ip) {
            getUserData()
        }

    }, [ip])

    if (userUrl) {
        setTimeout(() => {
            window.location = userUrl
        }, 1000)
        resetUserNumber()

    }
    console.log("hi here is the data", isUserData, userData)

    if (isUserData) {
        return (
            <>
                {userData.number !== null && userData.number !== undefined && userData.number !== -1 && (
                    <div>User Number: {userData.number}</div>
                )}              {userData.email && <div>User Email: {userData.email}</div>}
            </>
        );
    }
    return (
        <div>No number assign</div>
    )

}

export default Rwr;