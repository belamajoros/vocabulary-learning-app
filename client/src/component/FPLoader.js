import React from 'react'
import '../styles/FPLoader.css';
import Spinner from '../img/spinner.gif'

const FPLoader = () => {
    return (
        <div className="fp-container">
            <img src={Spinner} className="fp-loader" alt="loading"/>
        </div>
    )
}

export default FPLoader
