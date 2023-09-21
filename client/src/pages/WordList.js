import React, {useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../component/Navbar';
import SecondNavbar from '../component/SecondNavbar';
import '../styles/Library.css';
import { useAuth } from '../context/AuthContext'
import { Button, Container, Spinner, Modal, Row } from 'react-bootstrap';
import { LanguageContext } from '../context/LanguageContext'
import Pagination from '../component/Pagination'
import { FcCheckmark } from "react-icons/fc"
import UseFPLoader from '../hooks/UseFPLoader';
import useWindowDimensions from '../hooks/useWindowDimensions';
import ReactTooltip from "react-tooltip";

const WordList = () => {

  const [words, setWords] = useState([])
  const [load, showLoader, hideLoader] = UseFPLoader()


  const [soundLoader, setSoundLoader] = useState({
    show: false,
    item: '',
  })
  const [currentWords, setCurrentWords] = useState({
    words: [],
    actualLenght : 0,
  })
  const { currentUser } = useAuth()
  const { width } = useWindowDimensions();
  const userid = currentUser.uid;
  const [loader, setLoader] = useState(true)
  const [selected, setSelected] = useState('notlearned')
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [wordModal, setWordModal] = useState(false)
  const [selectedWordDefinitions, setSelectedWordDefinitions] = useState([])
  const [wordExample, setWordExample] = useState({
    show: false,
    example: '',
  })
  const [selectedWord, setSelectedWord] = useState({
    word: '',
    translation: '',
    definitions: [],
    loader: false
  })
  const [wordsToUpdate, setWordsToUpdate] = useState([])
  const [error, setError] = useState({
    show: false,
    msg: '',
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

  const getUserWords = async() => {
    setLoader(true)
    var arr = []
    try {
      const res = await fetch(`/words_translations/${userid}/${language_learn}/${language_first}`);
      arr = await res.json()
    } catch (err) {
      console.error(err.message)
    }
    setWords(arr)
    setLoader(false)
    if (arr.filter(item => !item.learned).length > 0){
      setCurrentWords({ words: arr.filter(item => !item.learned).slice(0, 10), actualLenght: arr.filter(item => !item.learned).length })
    } else {
      setSelected('all')
      setCurrentWords({ words: arr.slice(0, 10), actualLenght: arr.length })
    }
  }

  useEffect(() => {
    document.title= "Readbud - WordList"
    async function fetchData(){
      await getUserWords()
    }
    fetchData()
  }, []);

  async function handlePlay(item){
    setSoundLoader({ show: true, word: item })
    let languageCode = '';
    if(lang.language.learn === 'GB'){
      languageCode = 'en'
    }
    const data = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/${languageCode}/${item}`, {
        method: 'GET'
    })
    const res = await data.json()
    var sound = new Audio(await res[0].phonetics[0].audio)
    setSoundLoader(false)
    return sound.play()
  }

  function pageChange(){
    const indexOfLastWord = currentPage * perPage;
    const indexOfFirstWord = indexOfLastWord - perPage;
    if(selected === 'all'){
      setCurrentWords({ words: words.slice(indexOfFirstWord, indexOfLastWord), actualLenght: words.length })
    } else if (selected === 'learned') {
      setCurrentWords({ words: words.filter(item => item.learned).slice(indexOfFirstWord, indexOfLastWord), actualLenght: words.filter(item => item.learned).length })
    } else if (selected === 'notlearned') {
      setCurrentWords({ words: words.filter(item => !item.learned).slice(indexOfFirstWord, indexOfLastWord), actualLenght: words.filter(item => !item.learned).length })
    }
  }

  function handleChange(e){
    if(e.target.value) { setSelected(e.target.value) }
    setWordsToUpdate([])
    setCurrentWords({ words: [] , actualLenght: 0 })
    const indexOfLastWord = 1 * 10;
    const indexOfFirstWord = 10 - 10;
    if(e.target.value === 'all'){
      setCurrentWords({ words: words.slice(indexOfFirstWord, indexOfLastWord), actualLenght: words.length })
    } else if (e.target.value === 'learned') {
      setCurrentWords({ words: words.filter(item => item.learned).slice(indexOfFirstWord, indexOfLastWord), actualLenght: words.filter(item => item.learned).length })
    } else if (e.target.value === 'notlearned') {
      setCurrentWords({ words: words.filter(item => !item.learned).slice(indexOfFirstWord, indexOfLastWord), actualLenght: words.filter(item => !item.learned).length })
    }
  }

  useEffect(() => {
    pageChange()
  }, [currentPage])

  const paginateHandler = (pageNum) => {
    setCurrentPage(pageNum)
  };

  function handleCheck(id, e){
    if(e.target.checked){
      setWordsToUpdate(wordsToUpdate => wordsToUpdate.concat(id))
    } else if (!e.target.checked){
      setWordsToUpdate(wordsToUpdate => wordsToUpdate.filter(item => item !== id))
    }
  }

  const handleWordClick = async(word) => {
    setSelectedWordDefinitions([])
    setSelectedWord({
      word: word,
      translation: '',
      definitions: [],
      loader: true
    })
    setWordModal(true)
    var translate = ''
    var data = []
    try {
      translate = await fetch(`/translate/${word}/${language_learn.toLowerCase()}/${language_first.toLowerCase()}`)
      data = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/${language_learn.toLowerCase()}/${word}`, {
        method: 'GET'
      })
      translate = await translate.json()
      var arr = await data.json()
      arr = arr[0].meanings
      setSelectedWord({
        word: word,
        translation: translate,
        definitions: arr,
        loader: false
      })
    } catch (error) {
      setWordModal(false)
      setError({ show: true, message: "There was an error while getting the selected word"})
    }
  }

  function handleDefClick(part){
    const selected = selectedWord.definitions.filter(element => element.partOfSpeech === part)
    setSelectedWordDefinitions(selected[0].definitions)
    setWordExample({show: false, example: ''})
  }



  const handleUpdate = async() => {
    if(wordsToUpdate.length === 0) {
      setError({
        show: true,
        message: 'You have not selected any words to update'
      })
    } else {
      showLoader()
      try {
        const body = { idOfWords: wordsToUpdate };
          await fetch('/updateWords', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(body)
          }).then((res) => {
            hideLoader()
            if(!res.ok){
              setError({
                show: true,
                message: 'There was an error while updating the words'
              })
            } else {
              setSuccess({
                show: true,
                message: 'Selected words were successfully updated'
              })
              getUserWords()
            }
          })
      } catch (err) {
        setError({
          show: true,
          message: 'There was an error while updating the words',
        })
      }
      setWordsToUpdate([])
    }
  }

  function handleExampleClick(item){
    setWordExample({
      show: true,
      example: item
    })
  }

  return (
    <>
      <div className="main-section">
      <Navbar/>
        <SecondNavbar />
        { error &&
        <Modal onHide={() => setError({ show: false })} centered show={error.show} className="align-items-center justify-content-center rounded-lg">
            <Modal.Header className="align-items-center justify-content-center text-white text-center" style={{backgroundColor: '#AA4139'}}>
               <Modal.Title> Error! </Modal.Title>
            </Modal.Header>
            <Modal.Body className="d-flex flex-row  justify-content-center">
              <h5> {error.message} </h5>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setError({ show: false})}>
                Close
              </Button>
            </Modal.Footer>
          </Modal>
        }
        { success &&
          <Modal onHide={() => { setSuccess({ show: false }) }} centered show={success.show} className="align-items-center justify-content-center rounded-lg">
            <Modal.Header className="align-items-center justify-content-center text-white text-center" style={{backgroundColor: '#67E46F'}}>
              <Modal.Title> Success! </Modal.Title>
            </Modal.Header>
            <Modal.Body className="d-flex flex-row  justify-content-center">
              <h5> {success.message} </h5>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setSuccess({ show: false})}>
                Close
              </Button>
            </Modal.Footer>
          </Modal>
        }
        {wordModal ?
          <Modal onHide={() => { setWordModal(false) }} centered show={wordModal} className="align-items-center justify-content-center rounded-lg">
            <Modal.Header className="align-items-center justify-content-center text-white text-center" style={{backgroundColor: '#447BD4'}}>
              <Modal.Title >
                {width > 750 ?
                <>
                  Translation and definition of the word: <b><i>{selectedWord.word}</i></b>
                </>
                :
                <h6>Translation and definition of the word: <b><i>{selectedWord.word}</i></b></h6>
                }
              </Modal.Title>
            </Modal.Header>
            { selectedWord.loader ?
              <Modal.Body className="d-flex flex-row justify-content-center align-items-center">
                <Spinner animation="border" variant="dark" />
              </Modal.Body>
            :
              <Modal.Body className="d-flex flex-row text-left">
                <Row className="d-flex flex-column">
                  {width > 450 ?
                    <h4 className="p-1 m-1 ml-1">Translation: </h4>
                  :
                    <h6 className="p-1 m-1 ml-1">Translation: </h6>
                  }
                  <ul className="ml-4">
                    <li className="p-1" style={width < 430 ? { fontSize: '0.9rem' } : null}>{selectedWord.translation}</li>
                  </ul>
                  {width > 450 ?
                    <h4 className="p-1 m-1 ml-1">Definition: </h4>
                  :
                    <h6 className="p-1 m-1 ml-1">Definition: </h6>
                  }
                  <div className="flex-column">
                    { selectedWord.definitions && selectedWord.definitions.map((item, key) => {
                        return(
                        <button key={item+key} type="button" class="btn btn-outline-primary ml-2 resp" onClick={() => handleDefClick(item.partOfSpeech)}>{item.partOfSpeech}</button>)
                      })
                    }
                    <ul className="mt-2">
                    { selectedWordDefinitions.length !== 0 && selectedWordDefinitions.map((item,key) => {
                      return(
                          <li className="p-1 ml-4" key={key+item} style={width < 430 ? { fontSize: '0.9rem' } : null}>
                            {item.definition}
                            {item.example && wordExample.example !== item.example ?
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
                  </div>
                </Row>
              </Modal.Body>
            }
          </Modal>
        :null}
        { loader ?
        <React.Fragment>
          <div style={{
            position: 'absolute', left: '50%', top: '50%',
            transform: 'translate(-50%, -50%)',
          }} className="w-100">
          <Container className="justify-content-center align-items-center container-fluid h-100 text-center d-flex">
            <Spinner animation="border" variant="dark" />
          </Container>
          </div>
        </React.Fragment>
        :
        <React.Fragment>
          <div className="w-100" style={{marginTop: '8vh'}}>
          { words.length === 0 ?
            <Container className="justify-content-center align-items-center container-fluid h-100 text-center d-flex">
              <div class="d-flex flex-column" style={{
        position: 'absolute', left: '50%', top: '35%',
        transform: 'translate(-50%, -50%)',
        }} style={{marginTop: '10vh'}}>
                <div class="p-2">
                  <h3 className="text-white"> You have not added a single word to your word list yet for this language combination ({language_first}, {language_learn})</h3>
                </div>
                <div class="p-2">
                  <Link to="/upload">
                    <Button className="p-2 m-2 btn btn-secondary">
                      Upload text with known words
                    </Button>
                  </Link>
                  <Link to="/upload2">
                    <Button className="p-2 m-2 btn btn-secondary">
                      Upload text you want to read
                    </Button>
                  </Link>
                </div>
              </div>
            </Container>
          :
          <>
          <div className="container-fluid h-100 d-flex flex-column align-items-center justify-content-center">
            <table className="w-100 custom-table text-center">
              <thead className="text-white">
                <tr>
                  <th className="text-left px-md-4 px-2">Word</th>
                  {width > 450 ?
                  <th>Translation/Definiton</th>
                  :
                  null}

                  <th className="pt-2">
                    <label className="d-flex flex-row justify-content-center align-items-center px-2 px-md-4">
                      <p style={{fontSize: 16, marginTop: 12}} className="hideThis">Words:</p>
                      <select value={selected} onChange={(e) => handleChange(e)} className="rounded-pill justify-content-center align-items-center">
                        { words.some(e => e.learned === true) ?
                        <option value="learned">Learned</option> : null }
                        { words.some(e => e.learned === false) ?
                        <option value="notlearned">Not learned</option>: null }
                        <option value="all">All</option>
                      </select>
                    </label>
                  </th>
                  <th className="text-right">
                    <button className="btn text-white rounded-pill updateButton" data-for="update-tooltip" data-tip="Add selected words to the category 'learned'" style={{backgroundColor: '#67E46F'}} onClick={() => handleUpdate()}>
                      Update
                    </button>
                    <ReactTooltip id='update-tooltip' type='dark'/>
                  </th>
                </tr>
              </thead>
              <tbody>
                { words && currentWords &&
                    currentWords.words.map((word, key) => {
                        if (selected === 'all') return(
                          <tr key={key}>
                            {width > 450 ?
                              <>
                                <td className="py-2 text-left px-md-4 px-2" >{word.word}</td>
                                <td>
                                  <Link>
                                    <a onClick={() => handleWordClick(word.word)}>Show...</a>
                                  </Link>
                                </td>
                              </>
                            :
                            <>
                              <>
                                <td className="py-2 text-left px-md-4 px-2" >
                                  <Link>
                                    <a onClick={() => handleWordClick(word.word)}>{word.word}</a>
                                  </Link>
                                </td>
                              </>
                            </>
                            }
                            <td>
                              { soundLoader.show && soundLoader.word === word.word  ?
                              <Spinner animation="border" variant="dark"/>
                              :
                              <img src={require('../img/sound.svg').default} alt="" onClick={() => handlePlay(word.word)} className="soundSize" />
                              }
                            </td>
                            <td style={{ textAlign: 'right', marginRight: '0.8rem', paddingRight: '0.8rem' }}>
                              { word.learned ?
                              <div className="d-flex flex-row-reverse mt-1">
                                <FcCheckmark/>
                                <h6 className="mr-1 text-success hideThis">Learned</h6>
                              </div>
                              :
                                <input style={{ textAlign: 'right', marginRight: '1.1rem', paddingRight: '1.1rem' }} type="checkbox" onChange={(e) => handleCheck(word.id, e)}/>
                              }
                            </td>
                          </tr>)
                        else if (selected === 'learned' && word.learned) return(
                          <tr key={key}>
                            {width > 450 ?
                              <>
                                <td className="py-2 text-left px-md-4 px-2" >{word.word}</td>
                                <td>
                                  <Link>
                                    <a onClick={() => handleWordClick(word.word)}>Show...</a>
                                  </Link>
                                </td>
                              </>
                            :
                            <>
                              <>
                                <td className="py-2 text-left px-md-4 px-2" >
                                  <Link>
                                    <a onClick={() => handleWordClick(word.word)}>{word.word}</a>
                                  </Link>
                                </td>
                              </>
                            </>
                            }
                            <td>
                              { soundLoader.show && soundLoader.word === word.word  ?
                              <Spinner animation="border" variant="dark"/>
                              :
                              <img src={require('../img/sound.svg').default} alt="" onClick={() => handlePlay(word.word)} className="soundSize"/>
                              }
                            </td>
                            <td style={{ textAlign: 'right', marginRight: '0.8rem', paddingRight: '0.8rem' }}>
                              { word.learned ?
                              <div className="d-flex flex-row-reverse mt-1">
                                <FcCheckmark/>
                                <h6 className="mr-1 text-success hideThis">Learned</h6>
                              </div>
                              :
                                <input type="checkbox" onChange={(e) => handleCheck(word.id, e)}/>
                              }
                            </td>
                          </tr>)
                        else if (selected === 'notlearned' && !word.learned) return(
                          <tr className="rounded-pill" key={key}>
                            {width > 450 ?
                              <>
                                <td className="py-2 text-left px-md-4 px-2" >{word.word}</td>
                                <td>
                                  <Link>
                                    <a onClick={() => handleWordClick(word.word)}>Show...</a>
                                  </Link>
                                </td>
                              </>
                            :
                            <>
                              <>
                                <td className="py-2 text-left px-md-4 px-2" >
                                  <Link>
                                    <a onClick={() => handleWordClick(word.word)}>{word.word}</a>
                                  </Link>
                                </td>
                              </>
                            </>
                            }
                            <td>
                              { soundLoader.show && soundLoader.word === word.word  ?
                              <Spinner animation="border" variant="dark"/>
                              :
                              <img src={require('../img/sound.svg').default} alt="" onClick={() => handlePlay(word.word)} className="soundSize"/>
                              }
                            </td>
                            <td style={{ textAlign: 'right', marginRight: '1.7rem', paddingRight: '1.7rem' }}>
                              { word.learned ?
                              null
                              :
                                <input type="checkbox" onChange={(e) => handleCheck(word.id, e)}/>
                              }
                            </td>
                          </tr>)
                      })
                }
              </tbody>
            </table>
            <div>
            { currentWords.actualLenght > 0 ?
                <Pagination perPage={perPage} total={currentWords.actualLenght} paginate={paginateHandler}/>
              :null
            }
            </div>
          </div>
          </> }
          </div>
        </React.Fragment>}
        </div>
        {load}
    </>
  );
};

export default WordList;
