import '../styles/Login.css';
import { Link, useHistory } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import React, { useRef, useState, useEffect } from 'react';
import { Alert, Form, Button, Modal } from 'react-bootstrap';

function Login() {

  useEffect(() => {
    document.title= "Readbud - Login"
  }, []);

  const emailRef = useRef()
  const passwordRef = useRef()
  const { login, resetPassword } = useAuth()
  const [error, setError] = useState('')
  const [resetError, setResetError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const history = useHistory()
  const [modal, setModal] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()

    try{
      setError('')
      setLoading(true)
      await login(emailRef.current.value, passwordRef.current.value)
      history.push("/home")
    } catch {
      setError('Failed to sign in')
    }

    setLoading(false)
  }

  async function handlePasswordReset(e) {
    e.preventDefault()

    try{
      setResetError('')
      setSuccess('')
      setLoading(true)
      await resetPassword(emailRef.current.value)
      setSuccess('Password reset link has been sent to your email')
    } catch {
      setResetError('Failed to reset password')
    }

    setLoading(false)
  }

  function handleModal(e){
    e.preventDefault()
    setSuccess('')
    setResetError('')
    setModal(true)
  }

  return (
    <div className="w-100 d-flex justify-content-center align-items-center login">
      <div className="container">
        <h4 className="text-white my-3">Readbud</h4>
        <div className="main-container bg-white text-center mx-auto p-4">
          <img src={require('../img/Group 3logo.svg').default} alt=""/>
          { error && <Alert variant="danger" className="mt-1 mb-1">{error}</Alert>}
          <h4 className="primary-color font-weight-bold">Log In</h4>
          <h5 className="primary-color font-weight-bold">
            Sign in to your account
          </h5>
          <Modal show={modal} onHide={() => setModal(false)} centered>
            <Modal.Header>
              <Modal.Title> Enter your email to reset your password </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              { resetError && <Alert variant="danger" className="d-flex flex-column align-items-center">{resetError}</Alert>}
              { success && <Alert variant="success" className="d-flex flex-column align-items-center">{success}</Alert>}
              <Form onSubmit={handlePasswordReset} className="d-flex flex-column align-items-center">
                <Form.Group id="email" className="label-style mb-0 text-left">
                  <Form.Label> Email Address </Form.Label>
                  <Form.Control className="input-style p-3 mb-2" type="email" ref={emailRef} required/>
                </Form.Group>
                <Button type="submit" disabled={loading} className="btn primary-btn text-white fs-16 font-weight-bold my-2">
                  Reset Password
                </Button>
              </Form>
            </Modal.Body>
          </Modal>
          <Form onSubmit={handleSubmit} className="d-flex flex-column align-items-center">
            <Form.Group id="email" className="label-style mb-0 text-left">
              <Form.Label> Email Address </Form.Label>
              <Form.Control className="input-style p-3 mb-2" type="email" ref={emailRef} required/>
            </Form.Group>
            <Form.Group id="password" className="label-style mb-0 text-left">
              <Form.Label> Password </Form.Label>
              <Form.Control className="input-style p-3 mb-2" type="password" ref={passwordRef} required/>
            </Form.Group>
            <Button type='submit' disabled={loading} className="btn primary-btn text-white fs-16 font-weight-bold my-2">
              Log In
             </Button>
          </Form>
            <div className="w-100 text-center mt-1 mb-1">
              <Link onClick={handleModal}>Forgot your password?</Link>
            </div>
            <Link to='/register' className="btn primary-btn text-white fs-16 font-weight-bold my-2">
              Register a new account
            </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
