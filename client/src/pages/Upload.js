import React, {useEffect, useRef, useState, useContext} from 'react';
import Navbar from '../component/Navbar';
import SecondNavbar from '../component/SecondNavbar';
import '../styles/Upload.css';
import { useAuth } from '../context/AuthContext'
import { LanguageContext } from '../context/LanguageContext'
import { Modal, Button, Spinner } from 'react-bootstrap'
import UseFPLoader from '../hooks/UseFPLoader';


const Upload = () => {

  useEffect(() => {
    document.title= "Readbud - Upload Text"
  }, []);

  const [error, setError] = useState({
    message: '',
    show: false,
  })

  const [success, setSuccess] = useState({
    message: '',
    show: false,
  })

  const btnRef = useRef()

  const [loader, setLoader] = useState(false)
  const [load, showLoader, hideLoader] = UseFPLoader()

  const lang = useContext(LanguageContext)

  const { currentUser } = useAuth()
  const userid = currentUser.uid;

  const textRef = useRef()

  function separateWords(text){
    var array = text.replace(/[\W_]+/g," ").split(/\s+/).map(v => v.toLowerCase()).filter(v => v.length > 2);
    return Array.from(new Set(array))
  }

  const handleSubmit = async(e) => {
    e.preventDefault()
    if (btnRef.current){
      btnRef.current.setAttribute("disabled", "disabled")
    }
    if (textRef.current.value == '') {
      setError({
        message: 'Please upload a text before clicking on submit',
        show: true})
      btnRef.current.removeAttribute("disabled", "disabled")
      return
    }
    setLoader(true)
    setError({ message: ''})
    setSuccess({ message: ''})
    const array = separateWords(textRef.current.value);
    const learned = true;
    let language_learn = lang.language.learn;
    let language_first = lang.language.first;
    if(language_learn === "GB") {
      language_learn = "EN"
    }
    const body = { userid, words: array, learned, language_learn, language_first};
    await fetch('/words', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(body)
    }).then((res) => {
      setSuccess({
        show: true,
        message: 'The words were successfully saved to the database'
      })
    }).catch(() => {
      setError({
        show: true,
        message: "There was an error while uploading the words"
    })})
    btnRef.current.removeAttribute("disabled", "disabled")
    setLoader(false)
  }

  const fileChange = async(e) => {
    e.preventDefault()
    if (e.target.files.length != 1){
      return
    }
    var extension = e.target.files[0].name.split('.').pop()
    if (extension == 'txt') {
      showLoader()
      const reader = new FileReader()
      reader.onload = async (e) => {
        const text = (e.target.result)
        textRef.current.value = text;
      }
      reader.readAsText(e.target.files[0])
      hideLoader()
    } else if (extension == 'pdf' | extension == 'docx') {
      showLoader()
      var file = e.target.files[0]
      const formData = new FormData();
      formData.append('file', file)
      fetch(`/${extension}`, {
        method: 'POST',
        body: formData
      }).then(async (res) => {
        textRef.current.value = await res.json()
        hideLoader()
      })
    }
  }

  return (
    <>
      <div className="main-section">
      <Navbar />
        <SecondNavbar />
        <Modal onHide={() => setSuccess({ show: false})} centered show={success.show} className="align-items-center justify-content-center rounded-lg">
            <Modal.Header className="align-items-center justify-content-center text-white text-center" style={{backgroundColor: '#67E46F'}}>
              <Modal.Title> Success! </Modal.Title>
            </Modal.Header>
            <Modal.Body className="m-1 text-center font-weight-normal ">
              <h6>{success.message}</h6>
            </Modal.Body>
            <Modal.Footer>
            <Button variant="secondary" onClick={() => { setSuccess({ show: false}); textRef.current.value = '';}}>
              Upload another text
            </Button>
            <Button variant="secondary" onClick={() => setSuccess({ show: false})}>
              Close
            </Button>
            </Modal.Footer>
        </Modal>
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
        <div className="container h-100 d-flex flex-column  justify-content-center" style={{marginTop: 110}}>
          <h1 className="text-white ml-1 mb-4">
            Please upload text <br /> with known words
          </h1>
          <div className="row">
            <div className="col-12 col-md-6 d-flex justify-content-between flex-column align-items-end">
              <div class='form-group'>
                <label for="text" className="text-white font-weight-bold"> Text: </label>
                <textarea type="text" id="text" class="form-control" cols="65" rows="10" className="p-3 text-body w-100 mt-2 rounded" ref={textRef}/>
              </div>
            </div>
            <div className="col-12 col-md-6 d-flex justify-content-between align-items-center flex-column">
              <div className="mt-4">
                <input
                    type="file"
                    className="file-style text-primary font-weight-bold ml-3"
                    accept=".txt, .docx, .pdf"
                    onChange={(e) => fileChange(e)}
                />
                <h4 className="text-white">(.txt, .pdf, .docx)</h4>
              </div>
              <button ref={btnRef} onClick={handleSubmit} className="btn text-primary d-flex justify-content-center align-items-center input-style font-weight-bold mb-4">
                {loader ?
                  <Spinner animation="border" variant="primary" />
                :
                <>
                  Upload{' '}
                  <img src={require('../img/arrow-upward.svg').default} alt="" />
                </>
                }
              </button>
            </div>
          </div>
        </div>
      </div>
      {load}
    </>
  );
};

export default Upload;
