import React, {useState} from 'react';
import { Link } from 'react-router-dom';

const SecondNavbar = () => {

  const [active, setActive] = useState({
    first: false,
    sec: false,
    third: false,
  })
  return (
    <div className="w-100 d-flex ">
      <Link
        to="/home"
        className={
          window.location.pathname === '/home' || active.first
            ? 'active-btn btn'
            : 'inactive-btn btn'
        }
        onMouseEnter={() => setActive({ first: true})}
        onMouseLeave={() => setActive({ first: false})}
      >
        <img src={require('../img/home.png').default} alt="" className="mx-2" />
        Home
      </Link>
      <Link
        to="/wordlist"
        className={
          window.location.pathname === '/wordlist' || active.sec
            ? 'active-btn btn'
            : 'inactive-btn btn'
        }
        onMouseEnter={() => setActive({ sec: true})}
        onMouseLeave={() => setActive({ sec: false})}
      >
        <img
          src={require('../img/option.svg').default}
          alt=""
          className="mx-2"
        />
        Word List
      </Link>
      <Link
        to="/library"
        className={
          window.location.pathname === '/library' || active.third
            ? 'active-btn btn'
            : 'inactive-btn btn'
        }
        onMouseEnter={() => setActive({ third: true})}
        onMouseLeave={() => setActive({ third: false })}
      >
        <img src={require('../img/lib.svg').default} alt="" className="mx-2" />
        Library
      </Link>
    </div>
  );
};

export default SecondNavbar;
