import React, { useEffect, useState, useContext} from 'react';
import Navbar from '../component/Navbar';
import SecondNavbar from '../component/SecondNavbar';
import { Button } from 'react-bootstrap'
import { useAuth } from '../context/AuthContext'
import { Modal } from 'react-bootstrap'
import { LanguageContext } from '../context/LanguageContext'
import '../styles/Upload.css';
import useWindowDimensions from '../hooks/useWindowDimensions'

const Read = (props) => {

  const { text, title, buttonShow } = props.location.state;
  const { currentUser } = useAuth()
  const userid = currentUser.uid;
  const { height, width } = useWindowDimensions();
  const [clicked, setClicked] = useState(false)
  const [error, setError] = useState({
    show: false,
    message: ''
  })
  const [success, setSuccess] = useState({
    show: false,
    message: '',
  })
  const lang = useContext(LanguageContext)
  let language_learn = lang.language.learn;
  let language_first = lang.language.first;
  if(language_learn === "GB") {
    language_learn = "EN"
  }

  useEffect(() => {
    document.title= "Readbud - Read"
  }, []);

  function count(text) {
    return text.split(" ").length;
  }

  const handleAddToLibrary = async(e) => {
    setError('')
    try {
      const word_count = count(text);
      const body = { userid, title, text, word_count, language_learn, language_first };
      const response = fetch('/library', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(body)
      }).then(res => {
        if (!res.ok){
          setError({
            show: true,
            message: 'This text was already added to the library'
          })
        } else {
          setSuccess({
            show: true,
            message: 'The text was successfully added to the library'
          })
        }
      })
    } catch (err) {
      console.error(err.message)
    }
    setClicked(true)

  }



  return (
    <>
      <div className="main-section">
      <Navbar />
        <SecondNavbar />
        <Modal onHide={() => setError({ show: false})} centered show={error.show} className="align-items-center justify-content-center rounded-lg">
            <Modal.Header className="align-items-center justify-content-center text-white text-center" style={{backgroundColor: '#AA4139'}}>
              <Modal.Title> Error! </Modal.Title>
            </Modal.Header>
            <Modal.Body className="m-1 text-center font-weight-normal ">
              <h6>{error.message}</h6>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setError({ show: false})}>
                Close
              </Button>
            </Modal.Footer>
        </Modal>
        <Modal onHide={() => setSuccess({ show: false})} centered show={success.show} className="align-items-center justify-content-center rounded-lg">
            <Modal.Header className="align-items-center justify-content-center text-white text-center" style={{backgroundColor: '#68DA57'}}>
              <Modal.Title> Success! </Modal.Title>
            </Modal.Header>
            <Modal.Body className="m-1 text-center font-weight-normal ">
              <h6> {success.message} </h6>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setSuccess({ show: false})}>
                Close
              </Button>
            </Modal.Footer>
        </Modal>
        <div className="w-100" className="container-fluid h-100 d-flex justify-content-center align-items-center flex-column read-area">
          {width > 550 ?
          <h1 className="text-center text-white mt-4">{title}</h1> : <h3 className="text-center text-white mt-4">{title}</h3> }
          <div className="bg-white read-area w-100 pl-2 overflow-hidden">
            <div className="of-scroll">
              <p className="main-content">
                {text} {buttonShow}
              </p>
            </div>
          </div>
          { buttonShow && !clicked ?
          <div className="d-flex justify-content-end align-self-end my-3">
            <Button
              variant="dark"
              onClick={handleAddToLibrary}
              style={{backgroundColor: '#2A364C'}}
            >
              Add text to the library
            </Button>
          </div>
            : null
          }
        </div>
      </div>
    </>
  );
};

export default Read;
