import { CSSTransition } from "react-transition-group";
import { useState, useEffect } from 'react';
import './SplashScreen.css';
import React from "react";

function SplashScreen() {
    const [isEnter, setIsEnter] = useState(true)
    const [isExit, setIsExit] = useState(true)

    useEffect(() => {
        setTimeout(() => setIsEnter(false), 3000)
    }, [])

    useEffect(() => {
        setTimeout(() => setIsExit(false), 3000)
    }, [])

    return (
        <CSSTransition
            in={isExit}
            timeout={3000}
            appear={true}
            classNames="splash-screen">
            <div className="splash-screen">
                <CSSTransition
                    in={isEnter}
                    timeout={3000}
                    appear={true}
                    classNames="logo">
                    <div className='logo'>
                        <svg width="124" height="169" viewBox="0 0 124 169" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <style></style>
                            <path fillRule="evenodd" clipRule="evenodd" d="M123.012 61.5059C123.012 95.4747 95.4747 123.012 61.5059 123.012C27.5371 123.012 0 95.4747 0 61.5059C0 27.5371 27.5371 0 61.5059 0C95.4747 0 123.012 27.5371 123.012 61.5059ZM85.3162 61.5075C85.3162 74.6567 74.6567 85.3163 61.5075 85.3163C48.3583 85.3163 37.6987 74.6567 37.6987 61.5075C37.6987 48.3583 48.3583 37.6988 61.5075 37.6988C74.6567 37.6988 85.3162 48.3583 85.3162 61.5075ZM62.4931 133.926C48.6047 133.926 39.6764 130.95 39.6764 130.95L62.4931 168.647L85.3098 130.95C85.3098 130.95 76.3816 133.926 62.4931 133.926Z" fill="white" />
                        </svg>
                    </div>
                </CSSTransition>
                <mi-spinner inverse></mi-spinner>
            </div>
        </CSSTransition>)
}

export default SplashScreen;