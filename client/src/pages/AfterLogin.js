import React, { useContext, useEffect } from 'react';
import '../styles/AfterLogin.css';
import { Link } from 'react-router-dom';
import {Button} from 'react-bootstrap'
import SecondNavbar from '../component/SecondNavbar';
import Navbar from '../component/Navbar';
import useWindowDimensions from '../hooks/useWindowDimensions'

function AfterLogin() {

  const { width } = useWindowDimensions();

  return (
    <>
      <div className="main-section">
      <Navbar />
        <SecondNavbar />
        <div style={{
            position: 'absolute', left: '50%', top: '30%',
            transform: 'translate(-50%, -50%)',
          }} className="w-100" style={{marginTop: '10vh'}}>
        <div className="container text-white mt-md-5 pt-md-5">
          <h1>Instructions:</h1>
          <div className="row">
            <div className="col-12 col-md-6">
              <div className="d-flex align-items-center my-3">
                <div className="white-circle mx-3"></div>
                <p className="fw-bold fs-4 mb-0">
                  Set up languages in settings
                </p>
              </div>
              <div className="d-flex align-items-center my-3">
                <div className="white-circle mx-3"></div>
                <p className="fw-bold fs-4 mb-0">
                  Upload self written text with known words
                </p>
              </div>
              <div className="d-flex align-items-center my-3">
                <div className="white-circle mx-3"></div>
                <p className="fw-bold fs-4 mb-0">
                  Upload text that you would like to read
                </p>
              </div>
              <div className="d-flex align-items-center my-3">
                <div className="white-circle mx-3"></div>
                <p className="fw-bold fs-4 mb-0">
                  Learn unfamiliar words before reading{' '}
                </p>
              </div>
            </div>
            <div className="col-12 col-md-6 d-flex flex-column justify-content-center align-items-center">
              <Link to="/upload">
                <Button variant="light" className="d-flex align-items-center justify-content-around px-2 py-1">
                    <p className="primary-color text-center fw-bold mb-0">
                      Upload text with known <br /> words
                    </p>
                    <img
                      src={require('../img/arrow-up.svg').default}
                      alt=""
                      className="mx-2"
                    />
                </Button>
              </Link>

              <Link to="/upload2">
                <Button variant="light" className="d-flex align-items-center justify-content-around px-2 py-1 mt-3">
                  <p className="primary-color text-center fw-bold mb-0">
                    Upload text you want to <br /> read
                  </p>
                  <img
                    src={require('../img/arrow-up.svg').default}
                    alt=""
                    className="mx-2"
                  />
                </Button>
              </Link>
            </div>
          </div>
        </div>
        </div>
      </div>
    </>
  );
}

export default AfterLogin;
