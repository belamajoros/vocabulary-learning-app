import React, {useEffect, useState, useContext} from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../component/Navbar';
import SecondNavbar from '../component/SecondNavbar';
import '../styles/Library.css';
import { useAuth } from '../context/AuthContext'
import { LanguageContext } from '../context/LanguageContext'
import { Button, Container, Spinner, Modal} from 'react-bootstrap';
import Pagination from '../component/Pagination';
import UseFPLoader from '../hooks/UseFPLoader';
import useWindowDimensions from '../hooks/useWindowDimensions'

const Library = () => {

  const { currentUser } = useAuth()
  const userid = currentUser.uid;
  const [texts, setTexts] = useState([])
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [error, setError] = useState({
    show: false,
    message: '',
  })
  const { width } = useWindowDimensions();
  const [load, showLoader, hideLoader] = UseFPLoader()
  const [success, setSuccess] = useState({
    show: false,
    message: '',
  })
  const [textsToDelete, setTextsToDelete] = useState([])
  const [loader, setLoader] = useState(false)
  const [currentTexts, setCurrentTexts] = useState([])
  const lang = useContext(LanguageContext)
  let language_learn = lang.language.learn;
  let language_first = lang.language.first;
  if(language_learn === "GB") {
    language_learn = "EN"
  }
  const indexOfLastText = currentPage * perPage;
  const indexOfFirstText = indexOfLastText - perPage;

  useEffect(() => {
    document.title= "Readbud - Read"
    async function fetchData(){
      await getUserTexts()
    }
    fetchData()
  }, []);

  useEffect(() => {
    setCurrentTexts(texts.slice(indexOfFirstText, indexOfLastText))
  }, [currentPage])


  const getUserTexts = async() => {
    setLoader(true)
    var arr = []
    try {
      const res = await fetch(`/library/${userid}/${language_learn}/${language_first}`);
      arr = await res.json()
    } catch (err) {
      console.error(err.message)
    }
    setTexts(await arr)
    setLoader(false)
    setCurrentTexts(await arr.slice(0, 10))
  }

  const paginateHandler = (pageNum) => {
    setCurrentPage(pageNum)
  };

  function handleCheck(id, e){
    if(e.target.checked){
      setTextsToDelete(textsToDelete => textsToDelete.concat(id))
    } else if (!e.target.checked){
      setTextsToDelete(textsToDelete => textsToDelete.filter(item => item !== id))
    }
  }

  const handleDelete = async() => {
    if(textsToDelete.length === 0) {
      setError({
        show: true,
        message: 'You have not selected any texts to delete'
      })
    } else {
        showLoader()
        try {
          const body = { idOfTexts: textsToDelete };
          await fetch('/library', {
            method: 'DELETE',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(body)
          }).then((res) => {
            if(!res.ok){
              setError({
                show: true,
                message: 'There was an error while deleting the texts'
              })
            } else {
              setSuccess({
                show: true,
                message: 'Selected texts were deleted from the database'
              })
            }
          })
        } catch (err) {
          console.log(err.message)
        }
        setTextsToDelete([])
        await getUserTexts()
        hideLoader()
      }
    }



  return (
    <>
      <div className="main-section">
      <Navbar />
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
          <Modal onHide={() => setSuccess({ show: false })} centered show={success.show} className="align-items-center justify-content-center rounded-lg">
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
          <div style={{marginTop: '8vh'}}>
          { texts.length === 0 ?
            <Container className="justify-content-center align-items-center container-fluid h-100 text-center d-flex">
              <div class="d-flex flex-column" style={{
        position: 'absolute', left: '50%', top: '35%',
        transform: 'translate(-50%, -50%)',
        }} style={{marginTop: '10vh'}}>
                <div class="p-2">
                  <h3 className="text-white"> You have not added a single text to your library yet for this language combination ({language_first}, {language_learn})</h3>
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
          <div className="container-fluid h-100 d-flex justify-content-center align-items-center">
            <table className="w-100 custom-table text-center ">
              <thead className="text-white ">
                <tr>
                  <th className="text-left px-md-4 px-2">Name</th>
                  <th>Added on</th>
                  <th>Word Count</th>
                  {width > 520 ?
                  <th></th>
                  :null
                  }
                  <th className="text-right">
                    <button className="btn btn-danger text-white rounded-pill updateButton" onClick={() => handleDelete()}>
                      Delete
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody>
                { texts && currentTexts &&
                    currentTexts.map((item, key) => {
                      return (
                        <tr key={key}>
                          { (item.title).length > 28 ?

                          <td className="py-2 text-left px-md-4 px-2 title" >{ width > 520 ? <>{item.title.substr(0,25)}...</> :
                          <Link to={{
                            pathname:"/read",
                            state: { title: item.title, text: item.text, buttonShow: false }}}>{item.title.substr(0,25)}...</Link>
                          }</td>
                          :
                          <td className="py-2 text-left px-md-4 px-2 title" >{ width > 520 ? <>{item.title}</> :
                          <Link to={{
                            pathname:"/read",
                            state: { title: item.title, text: item.text, buttonShow: false }}}>{item.title}</Link>}
                          </td>
                          }
                          <td>{item.added_on.slice(0,10)}</td>
                          <td>{item.word_count}</td>
                          {width > 520 ?
                          <td>
                            <Link to={{
                              pathname:"/read",
                              state: { title: item.title, text: item.text, buttonShow: false }}}>Read...</Link>
                          </td>
                          :
                          null }
                          <td style={{ textAlign: 'right', marginRight: '1.7rem', paddingRight: '1.7rem' }}>
                            <input type="checkbox" onChange={(e) => handleCheck(item.id, e)}/>
                          </td>
                        </tr>
                    )})
                }
              </tbody>
            </table>
          </div> }
          { texts.length > 0 ?
          <div className="w-100 d-flex justify-content-center align-items-center">
            <Pagination perPage={perPage} className="justify-content-center align-items-center" total={texts.length} paginate={paginateHandler}/>
          </div>
          : null}
          </div>
          </React.Fragment> }
      </div>
      {load}
    </>
  );
};

export default Library;
