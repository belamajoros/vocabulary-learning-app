import '../styles/LandingPage.css';
import { Link } from 'react-router-dom';
import useWindowDimensions from '../hooks/useWindowDimensions'

function LandingPage() {
  const { width } = useWindowDimensions();

  return (
    <>
      <div className="main-section">
      <nav className="navbar navbar-expand-lg navbar-dark custom-navbar">
        <div className="container">
          <a className="navbar-brand text-white font-weight-bold">
            <img
              src={require('../img/Group 3.svg').default}
              alt=""
              className="mx-4"
            />
            ReadBud
          </a>
          <div id="navbarNav">
            <ul className="navbar-nav ml-auto mr-4">
              <li className="nav-item ">
                <Link to='/login' className="nav-link h5 text-white font-weight-bold">
                  Login
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>
      <section className="d-flex justify-content-center align-items-center" style={{
            position: 'absolute', left: '50%', top: '45%',
            transform: 'translate(-50%, -50%)',
          }} className="w-100">
        <div className="container" style={{ textAlign: width < 992 ? 'center' : null}}>
          <div className="row mt-4">
            <div className="col-12 col-lg-6 d-flex justify-content-lg-start justify-content-center">
              <h1 className="text-white font-weight-bold text-center main-heading">
                Welcome to <br /> Readbud!
              </h1>
            </div>
            <div className="col-12 col-lg-6  pl-lg-5 ">
              <h4 className="text-white  font-weight-bold secondary-content ">
                Do you enjoy reading ?
              </h4>
              <h4 className="text-white  font-weight-bold secondary-content ">
                Upload a text and learn <br /> unfamiliar vocabulary before{' '}
                <br /> you start reading!
              </h4>
              <div className="d-flex justify-content-center justify-content-lg-start">
                <Link to='/register' className="btn main-btn text-primary btn-lg ">
                  Join now
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
      </div>
    </>
  );
}

export default LandingPage;