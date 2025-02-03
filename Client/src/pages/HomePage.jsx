import React, { useState } from 'react';
import styles from './HomePage.module.css';
import SignUp from '../components/SignUp';
import SignIn from '../components/SignIn';
function HomePage() {
    const [signForm,setSignForm]=useState(true);
  return (
    <div className={styles.container}>
        <div className={styles.box}>    
            <div className={styles.header}>
                <h1>Chat App</h1>
            </div>
            <div className={styles.body}>
                <div className={styles.pageSelector}>
                    <button onClick={()=>setSignForm(true)} className={signForm ?styles.active:styles.on}>Login</button>
                    <button onClick={()=>setSignForm(false)} className={signForm ?styles.on:styles.active}>Sign Up</button>
                </div>
                <div className={styles.signForm}>
                    {
                        signForm?<SignIn/>:<SignUp/>
                    }
                </div>
            </div>
        </div>
    </div>
  )
}

export default HomePage
