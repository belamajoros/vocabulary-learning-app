import React, { useState, useRef, useContext } from 'react';
import ReactFlagsSelect from 'react-flags-select';
import { useHistory } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { IoMdSettings } from 'react-icons/io'
import { FiLogOut } from 'react-icons/fi'
import { FaUser } from 'react-icons/fa'
import { Modal, Container, Row, Col, Form, Button, Alert } from 'react-bootstrap'
import { LanguageContext } from "../context/LanguageContext"
import useWindowDimensions from './windowDimension';


const Navbar = () => {
  const emailRef = useRef()
  const passwordRef = useRef()
  const passwordConfirmRef = useRef()
  const { logout, currentUser, updateEmail, updatePassword } = useAuth()
  const [error, setError] = useState("")
  const history = useHistory()
  const [modal, setModal] = useState(false)
  const [updateProfile, setUpdateProfile] = useState(false)
  const [loading, setLoading] = useState(false)
  const { language, setLanguage } = useContext(LanguageContext)
  const { width } = useWindowDimensions()

  async function handleLogout(e){

    setError('')
    try{
      await logout()
      history.push("/login")
    } catch {
      setError("Failed to log out")
    }
  }


  function handleSubmit(e) {
    e.preventDefault()
    if (passwordRef.current.value !== passwordConfirmRef.current.value) {
      return setError("Passwords do not match")
    }

    const promises = []
    setLoading(true)
    setError("")

    if (emailRef.current.value !== currentUser.email) {
      promises.push(updateEmail(emailRef.current.value))
    }
    if (passwordRef.current.value) {
      promises.push(updatePassword(passwordRef.current.value))
    }

    Promise.all(promises)
      .then(() => {
        history.push("/login")
      })
      .catch(() => {
        setError("Failed to update account")
      })
      .finally(() => {
        setLoading(false)
      })
  }

  function handleSelectFirst(code){
    setLanguage(prev => ({
      ...prev,
      first: code
    }))
  }

  function handleSelectLearn(code){
    setLanguage(prev => ({
      ...prev,
      learn: code
    }))
  }


  return (
    <nav className="navbar navbar-expand-lg navbar-dark  navbar-style">
      <Modal show={modal} onHide={() => setModal(false)} centered className="align-items-center justify-content-center rounded-0">
            <Modal.Header className="align-items-center justify-content-center text-white text-center" style={{backgroundColor: '#447BD4'}}>
              <Modal.Title> Please select your first language and the language you want to learn </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Container>
                  <Row>
                    <Col sm={6} className="d-flex align-items-center justify-content-center">
                      <h4 className="mr-2">I speak:</h4>
                        <ReactFlagsSelect
                                    defaultCountry="SK"
                                    selected={language.first}
                                    onSelect={(code) => handleSelectFirst(code)}
                                    countries={['SK', 'HU', 'CZ', 'PL', 'DE', 'ES']}
                                    customLabels={{
                                      SK: 'SK',
                                      HU: 'HU',
                                      CZ: 'CZ',
                                      PL: 'PL',
                                      DE: 'DE',
                                      ES: 'ES',
                                    }}
                                    placeholder=" "
                                    showSelectedLabel={false}
                                    showOptionLabel={false}
                                    selectedSize={30}
                                    optionsSize={30}
                                    id="speak"
                                    />
                    </Col>
                    <Col sm={6} className="d-flex align-items-center justify-content-center">
                      <h4 className="mr-2">I want to learn:</h4>
                      <ReactFlagsSelect
                        defaultCountry="GB"
                        selected={language.learn} 
                        onSelect={(code) => handleSelectLearn(code)}
                        countries={['GB']}
                        customLabels={{
                          GB: 'EN-GB',
                        }}
                        placeholder=" "
                        showSelectedLabel={false}
                        showOptionLabel={false}
                        selectedSize={30}
                        optionsSize={30}
                        id="learn"
                      />
                    </Col>
                  </Row>
                </Container>
            </Modal.Body>
          </Modal>
      <div className="container-fluid">
      <Modal show={updateProfile} onHide={() => setUpdateProfile(false)} centered className="align-items-center justify-content-center rounded-0">
        <Modal.Header className="align-items-center justify-content-center text-white text-center" style={{backgroundColor: '#447BD4'}}>
          <Modal.Title> Update Profile </Modal.Title>
            </Modal.Header>
            <Modal.Body>
            {error && <Alert variant="danger">{error}</Alert>}
              <Form onSubmit={handleSubmit}>
                <Form.Group id="email">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    ref={emailRef}
                    required
                    defaultValue={currentUser.email}
                    className="input-style w-100 mb-2"
                  />
                </Form.Group>
                <Form.Group id="password">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    ref={passwordRef}
                    placeholder="Leave blank to keep the same"
                    className="input-style w-100 mb-2"
                  />
                </Form.Group>
                <Form.Group id="password-confirm">
                  <Form.Label>Password Confirmation</Form.Label>
                  <Form.Control
                    type="password"
                    ref={passwordConfirmRef}
                    placeholder="Leave blank to keep the same"
                    className="input-style w-100 mb-2"
                  />
                </Form.Group>
                <Button disabled={loading} className="w-100" type="submit">
                  Update
                </Button>
              </Form>
            </Modal.Body>
          </Modal>
        <div className="navbar-brand text-white fw-bold">
          <img
            src={require('../img/logo.svg').default}
            alt=""
            className="mx-3"
          />
          ReadBud
        </div>
        {/* <button
            className="navbar-toggler"
            type="button"
            data-toggle="collapse"
            data-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
        </button> */}
        <div /* className="collapse navbar-collapse" */ id="navbarNav">
          <div className="ml-auto d-flex align-items-center">
            { window.location.pathname === '/home' && width >= 910 ?
            <React.Fragment>
              <div className="d-flex align-items-center pt-2">
                <label htmlFor="speak" className="text-white fw-bold mr-2">
                  I speak:
                </label>
                <ReactFlagsSelect
                  defaultCountry="SK"
                  selected={language.first}
                  onSelect={(code) => handleSelectFirst(code)}
                  countries={['SK', 'HU', 'CZ', 'PL', 'DE', 'ES']}
                  customLabels={{
                    SK: 'SK',
                    HU: 'HU',
                    CZ: 'CZ',
                    DE: 'DE',
                    ES: 'ES',
                  }}
                  placeholder=" "
                  showSelectedLabel={false}
                  showOptionLabel={false}
                  selectedSize={30}
                  optionsSize={30}
                  id="speak"
                />
              </div>
              <div className="d-flex align-items-center mx-4 pt-2">
                <label htmlFor="learn" className="text-white fw-bold mr-2">
                  I want to learn:
                </label>
                <ReactFlagsSelect
                  defaultCountry="GB"
                  selected={language.learn}
                  onSelect={(code) => handleSelectLearn(code)}
                  countries={['GB']}
                  customLabels={{
                    GB: 'EN-GB',
                  }}
                  placeholder=" "
                  showSelectedLabel={false}
                  showOptionLabel={false}
                  selectedSize={30}
                  optionsSize={30}
                  id="learn"
                />
              </div>
            </React.Fragment> : null }
            <div className="dropdown" style={{float: 'right'}}>
              <div className="d-flex select-wrapper px-2 py-1">
                <img
                  src={require('../img/account.svg').default}
                  alt=""
                  className="mx-1"
                />
                <button className="select-style border-0 fw-bold dropdown-toggle bg-white d-flex flex-row justify-content-center align-items-center" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                  <p className="d-none d-lg-block p-0 m-0">
                  { currentUser && currentUser.email}
                  </p>
                </button>
                <div className="dropdown-menu  justify-content-center align-items-center dropdown-menu-right" aria-labelledby="dropdownMenuButton">
                  <button className="dropdown-item"  type="button" onClick={() => setUpdateProfile(true)}>
                    <FaUser style={{color: 'grey', marginRight: 5}}/>
                    Profile
                  </button>
                  <button className="dropdown-item" type="button" onClick={() => setModal(true)}>
                    <IoMdSettings style={{color: 'grey', marginRight: 5}}/>
                    Settings
                  </button>
                  <div className="dropdown-divider"></div>
                  <button className="dropdown-item" type="button" onClick={handleLogout}>
                    <FiLogOut style={{color: 'grey', marginRight: 5}}/>
                    Log Out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
