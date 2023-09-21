import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'
import { Alert, Form, Button } from 'react-bootstrap'
import React, { useRef, useState, useEffect} from 'react';

function RegisterPage() {

  useEffect(() => {
    document.title= "Readbud - Sign up"
  }, []);

  const emailRef = useRef()
  const passwordRef = useRef()
  const passwordConfirmRef = useRef()
  const { signup } = useAuth()
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setSuccess(false)
    setError(false)

    if( passwordRef.current.value !== passwordConfirmRef.current.value ) {
      return setError('Passwords do not match')
    }

    try{
      setError('')
      setLoading(true)
      await signup(emailRef.current.value, passwordRef.current.value)
      setSuccess(true)
    } catch {
      setError('Failed to create an account')
      setSuccess(false)
    }

    setLoading(false)
  }

  return (
    <div className="w-100 d-flex justify-content-center align-items-center  login">
      <div className="container">
        <h4 className="text-white my-md-3">Readbud</h4>
        <div className="row">
          <div className="col-12 col-md-6 d-flex align-items-center justify-content-center justify-content-md-start">
            <h1 className="fs-81 font-weight-bold text-white text-center w-75">
              Join now and start learning !
            </h1>
          </div>
          <div className="col-12 col-md-6">
            <div className="main-container bg-white text-center mx-auto p-4 ">
              <img src={require('../img/Group 3logo.svg').default} alt="" />
              <h5 className="primary-color font-weight-bold">
                Register a new account
              </h5>
              { error && <Alert variant="danger">{error}</Alert>}
              { success && <Alert variant="success">Account successfully created</Alert>}
              <Form onSubmit={handleSubmit} className="d-flex flex-column align-items-center">
                <Form.Group id="email" className="label-style mb-0 text-left">
                  <Form.Label> Email Address </Form.Label>
                  <Form.Control className="input-style p-3 mb-2" type="email" ref={emailRef} required/>
                </Form.Group>
                <Form.Group id="password" className="label-style mb-0 text-left">
                  <Form.Label> Password </Form.Label>
                  <Form.Control className="input-style p-3 mb-2" type="password" ref={passwordRef} required/>
                </Form.Group>
                <Form.Group id="password-confirm" className="label-style mb-0 text-left">
                  <Form.Label> Re-enter password </Form.Label>
                  <Form.Control className="input-style p-3 mb-2" type="password" ref={passwordConfirmRef} required/>
                </Form.Group>
                <Button type='submit' disabled={loading} className="btn primary-btn text-white fs-16 font-weight-bold my-2">
                  Register a new account
                </Button>
              </Form>
              <div className="w-100 text-center mt-2">
                Already have an account? <Link to="/login">Log In</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

  );
}

export default RegisterPage;
