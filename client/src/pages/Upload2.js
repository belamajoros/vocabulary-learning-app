import React, {useEffect, useState, useRef, useContext} from 'react';
import Navbar from '../component/Navbar';
import SecondNavbar from '../component/SecondNavbar';
import '../styles/Upload.css';
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Container, Modal, Row, Col, Button, Spinner } from 'react-bootstrap'
import { LanguageContext } from '../context/LanguageContext'
import UseFPLoader from '../hooks/UseFPLoader';
import useWindowDimensions from '../hooks/useWindowDimensions'

const Upload2 = () => {

  const [loader, setLoader] = useState(false)
  const [modal, setModal] = useState(false)
  const [first, setFirst] = useState(true)
  const [words, setWords] = useState([])
  const [error, setError] = useState({
    show: false,
    message: ''
  })
  const [dictData, setDictData] = useState([])
  const [knownWords, setKnownWords] = useState([]);
  const [translatedWord, setTranslatedWord] = useState('')
  const [wordListModal, setWordListModal] = useState(false)
  const [selectedWordDefinitions, setSelectedWordDefinitions] = useState([])
  const [loader2, setLoader2] = useState(false)
  const btnRef = useRef()
  const [wordExample, setWordExample] = useState({
    show: false,
    example: '',
  })
  const [selected, setSelected] = useState('')
  const [load, showLoader, hideLoader] = UseFPLoader()
  const [error1, setError1] = useState(false)
  var textRef = useRef()
  const { width } = useWindowDimensions();
  const titleRef = useRef()
  const [selectedAudio, setSelectedAudio] = useState('')
  const [wordsToAdd, setWordsToAdd] = useState([])
  const { currentUser } = useAuth()
  const userid = currentUser.uid;
  const lang = useContext(LanguageContext)
  let language_learn = lang.language.learn;
  let language_first = lang.language.first;
  if(language_learn === "GB") {
    language_learn = "EN"
  }

  useEffect(() => {
    document.title= "Readbud - Upload Text";
    getKnownWords()
  }, []);

  function separateWords(text){
    var string = text.replace(/[^A-Za-z0-9\s]/g,"").replace(/\s{2,}/g, " ")
    var array = string.replace(/[^a-zA-Z0-9]+/g," ").split(/\s+/).map(v => v.toLowerCase());
    return Array.from(new Set(array))
  }

  async function getKnownWords(){
    let learned = true;
    const res = await fetch(`/words/${userid}/${learned}/${language_learn}/${language_first}`);
    const wordsArray = await res.json()
    setKnownWords(wordsArray);
  }

  const googleDictApi = async (selectedWord) => {
    setError1(false)
    let languageCode = '';
    if(lang.language.learn === 'GB'){
      languageCode = 'en'
    }
    try {
      const data = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/${languageCode}/${selectedWord}`, {
        method: 'GET'
      })
      if(data.ok){
        var arr = await data.json()
        setDictData(arr[0].meanings)
        setSelectedAudio(arr[0].phonetics[0].audio)
      } else {
        setError1(true)
      }
    } catch (error) {
      console.error(error.message)
    }
  };

  const wordTranslate = async (word) => {
    const res = await fetch(`/translate/${word}/${language_learn.toLowerCase()}/${language_first.toLowerCase()}`);
    setTranslatedWord(await res.json())
    setLoader(false)
  };

  function extractUnknowWords(array) {
    let arr = []
    for(let i = 0; i < array.length ; i++){
      if(!knownWords.some(x => x === array[i]) && array[i].length > 2){
        arr.push(array[i])
      }
    }
    setWords(arr)
    setModal(true)
  }

  const changeWordForm = async(arr) => {
    const body = { words: arr }
    const res = await fetch(`/wordform`,
    {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(body)
    })
    let array = await res.json()
    return array
  }

  const handleSubmit = async() => {
    showLoader()
    if (btnRef.current){
      btnRef.current.setAttribute("disabled", "disabled")
    }
    if(textRef.current.value !== '') {
      setWords([])
      setError('')
      setFirst(true)
      extractUnknowWords(await changeWordForm(separateWords(textRef.current.value)))
    } else {
      if (textRef.current.value == ''){
        setError({
          message: 'Please upload a text before clicking on submit',
          show: true})
      } else if (titleRef.current.value == ''){
        setError({
          message: 'Please provide a title for your text',
          show: true})
      }
    }
    btnRef.current.removeAttribute("disabled", "disabled")
    hideLoader()
  }

  const handleWordClick = async(item) => {
    setWordExample({show: false, example: ''})
    setSelectedWordDefinitions([])
    setLoader(true)
    setSelected(item)
    setFirst(false)
    await googleDictApi(item)
    await wordTranslate(item)
  }

  function handlePlay(){
    var sound = new Audio(selectedAudio)
    return sound.play()
  }

  const wordListHandler = async(learned) => {
    try {
      const body = { userid, words: wordsToAdd, learned, language_learn, language_first };
      await fetch('/addWords', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(body)
      }).then((res) => {
        var arr = words.filter( (el) => !wordsToAdd.includes(el) )
        setWords(arr)
        setWordListModal(false)
      })
    } catch {
      setError({ show: true, message: "There was an error while uploading the words"})
    }
  }

  function handleExampleClick(item){
    setWordExample({
      show: true,
      example: item
    })
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
    } else if (extension === 'pdf' | extension === 'docx') {
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

  function handleCheck(id, e){
    if(e.target.checked){
      setWordsToAdd(wordsToAdd => wordsToAdd.concat(id))
    } else if (!e.target.checked){
      setWordsToAdd(wordsToAdd => wordsToAdd.filter(item => item !== id))
    }
  }

  function handleAddToWL() {
    if (wordsToAdd.length == 0){
      setError({ show: true, message: "You have not selected any words to add"})
      return
    }
    setWordListModal(true)
  }

  function handleDefClick(part){
    const selected = dictData.filter(element => element.partOfSpeech === part)
    setSelectedWordDefinitions(selected[0].definitions)
    setWordExample({show: false, example: ''})
  }

  function handleSelectUnselect(e){
    if(e.target.checked){
      setWordsToAdd(words)
    } else if (!e.target.checked){
      setWordsToAdd([])
    }
  }

  return (
    <>
      <div className="main-section">
      <Navbar/>
        <SecondNavbar />
        <Modal onHide={() => setModal(false)} centered show={modal} className="align-items-center justify-content-center rounded-lg" dialogClassName="modal-90w">
          <Modal onHide={() => setWordListModal(false)} centered show={wordListModal} className="align-items-center justify-content-center rounded-lg" style={{background: '#f8f8f8ad'}}>
            <Modal.Header className="align-items-center justify-content-center text-white text-center" style={{backgroundColor: '#447BD4'}}>
               <Modal.Title>Please select how you want the selected words to appear in the word list</Modal.Title>
            </Modal.Header>
            <Modal.Body className="d-flex flex-row  justify-content-center">
              <Button onClick={() => wordListHandler(true)} className="col-sm m-3 p-2">
                Add as 'learned'
              </Button>
              <Button onClick={() => wordListHandler(false)} className="col-sm m-3 p-2">
                Add as 'not learned yet'
              </Button>
            </Modal.Body>
          </Modal>
         { words.length !== 0 ?
         <React.Fragment>
           <div className="minh65">
            <Modal.Header className="align-items-center justify-content-center text-white text-center" style={{backgroundColor: '#447BD4'}}>
              <Modal.Title >
                {width > 750 ?
                <>
                  The system has detected unfamiliar vocabulary in the text
                </>
                :
                <h6>The system has detected unfamiliar vocabulary in the text</h6>
                }
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
            { loader2 ?
            <div className="d-flex justify-content-center align-items-center">
              <Spinner animation="border" variant="primary" centered/>
            </div>
            :
            <Container>
              <Row>
                { modal ?
                <React.Fragment>
                  <Col className="border-right">
                    <div className="trim-text of-scroll h--88">
                      <div className="d-inline-flex align-items-center w-100 border-bottom">
                        <p className="p-1 m-1" style={width < 430 ? { fontSize: '0.7rem' } : null}>Select/Unselect all</p>
                        <input type="checkbox" className="m-2" color="green" onChange={(e) => handleSelectUnselect(e)}/>
                      </div>
                      { words && words.map((item, key) => {
                        return (
                          <>
                          <div key={key+item} className={ width < 750 ? 'p-1 m-1 wordDiv d-inline-flex' : 'p-2 m-2 wordDiv d-inline-flex'}>
                            <button className="btnClick" onClick={() => handleWordClick(item)} style={width < 430 ? { fontSize: '0.7rem' } : null}>
                              {item}
                            </button>
                            <input type="checkbox" className="m-2" color="green" onChange={(e) => handleCheck(item, e)} checked={wordsToAdd.some(v => v === item)}/>
                          </div>
                          </>
                        )
                      })}
                    </div>
                    <div className="h-auto d-flex flex-row mb-2 mt-2">
                      <Button className="p-3 m-2 resp" onClick={() => handleAddToWL()}>Add to word list</Button>
                    </div>
                  </Col>
                </React.Fragment>
                : null}

                { first ?
                <React.Fragment>
                  <Col>
                    <Row className="text-center h-50">
                      {width > 750 ?
                      <h4 className="p-1 m-1">Click on any word to start learning</h4>
                      :
                      <h6 className="p-1 m-1">Click on any word to start learning</h6>
                      }
                    </Row>
                  </Col>
                </React.Fragment>
                :
                <React.Fragment>
                  { loader ?
                    <Col className="d-flex justify-content-center align-items-center">
                      <Spinner animation="border" variant="primary"/>
                    </Col>
                  :
                  <Col>
                    <React.Fragment>
                      <div className="text-center d-flex flex-column h--88 of-scroll">
                        {translatedWord ?
                          <React.Fragment>
                            {width > 751 ?
                            <h4 className="p-1 m-1 text-left">Translation: </h4>
                            :
                            <h6 className="p-1 m-1 text-left">Translation: </h6>
                            }
                              <ul>
                                <li className="p-1 ml-4 text-left" style={width < 750 ? { fontSize: '0.9rem' } : null}>{translatedWord}</li>
                              </ul>
                          </React.Fragment>
                        : null}
                        { error1 ?
                          <h4 className="p-1 m-1 text-left">No definitons found for the selected word</h4>
                        :
                        <>
                        { !first && dictData ?
                        <>
                          {width > 751 ? <h4 className="p-1 m-1 text-left">Definition: </h4> : <h6 className="p-1 m-1 text-left">Definition: </h6>}
                        </>
                        : null }
                        { !first && dictData ?
                          <React.Fragment>
                            <div className="flex-column text-left">
                              { dictData && dictData.map((item, key) => {
                                return(
                                  <button key={item+key} type="button" class="btn btn-outline-primary ml-2 mt-1 resp" onClick={() => handleDefClick(item.partOfSpeech)}>{item.partOfSpeech}</button>)
                                })
                              }
                            </div>
                            <ul className="mt-2 text-left">
                              { selectedWordDefinitions.length != 0 && selectedWordDefinitions.map((item,key) => {
                                return(
                                    <li className="p-1 ml-4" style={width < 750 ? { fontSize: '0.9rem' } : null} key={key+item} >
                                      {item.definition}
                                      {item.example && wordExample.example != item.example ?
                                        <Link className="ml-2">
                                          <a onClick={() => handleExampleClick(item.example)}>Show example</a>
                                        </Link>
                                        : null
                                      }
                                      { wordExample.show && wordExample.example == item.example ?
                                        <div>
                                          <b>Example: </b>{item.example}.
                                          <Link className="ml-2">
                                            <a onClick={() => setWordExample({ show: false, example: ''})}>Hide example</a>
                                          </Link>
                                        </div>
                                        : null
                                      }
                                    </li>
                                    )
                              }) }
                            </ul>
                          </React.Fragment>
                        : null }
                        </>
                        }
                      </div>
                      <div className="h-auto d-flex align-items-center justify-content-between mb-2 mr-1">
                        { !first ?
                        <React.Fragment>
                            <a href="#">
                              <img
                                src={require('../img/sound.svg').default}
                                alt=""
                                className={error1 ? 'p-2 d-none' : 'p-2'}
                                onClick={() => handlePlay()}
                              />
                            </a>
                        </React.Fragment>
                      : null }
                        { modal ?
                        <Link to={{
                          pathname:"/read",
                          state: { title: titleRef.current.value, text: textRef.current.value, buttonShow: true }}}
                        >
                          <Button className="p-3 m-1 resp">Start reading</Button>
                        </Link>: null }
                      </div>
                    </React.Fragment>
                  </Col>
                  }
                </React.Fragment>
                }
              </Row>
            </Container> }
            </Modal.Body>
            </div>
          </React.Fragment>
          :
          <React.Fragment>
            <Modal.Header className="align-items-center justify-content-center text-white text-center" style={{backgroundColor: '#55AA55'}}>
                <Modal.Title> Congratulations!</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <h4 className="text-center font-weight-normal "> You know all the words that are in the text </h4>
            </Modal.Body>
            <Modal.Footer>
            { modal ?
              <Link to={{
                pathname:"/read",
                state: { title: titleRef.current.value, text: textRef.current.value, buttonShow: true }}}
              >
                <Button className="p-3 m-2">Start reading</Button>
              </Link>: null }
            </Modal.Footer>
          </React.Fragment> }
        </Modal>
        <Modal onHide={() => setError({ show: false})} centered show={error.show} className="align-items-center justify-content-center rounded-lg" style={{background: '#f8f8f8ad'}}>
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
            Please upload text <br /> you want to read
          </h1>

          <div className="row">
            <div className="col-12 col-md-6 d-flex justify-content-between flex-column align-items-end">
              <div class='form-group'>
                <label className="text-white font-weight-bold"> Title: </label>
                <input type="text" size="70" id="title" class="form-control" ref={titleRef}/>
              </div>
              <div class='form-group'>
                <label className="text-white font-weight-bold"> Text: </label>
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
              <button ref={btnRef} className="btn text-primary d-flex justify-content-center align-items-center input-style font-weight-bold mb-4" onClick={() => handleSubmit()}>
                {loader2 ?
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

export default Upload2;
