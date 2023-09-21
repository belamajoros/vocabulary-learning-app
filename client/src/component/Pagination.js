import React, { useState, useEffect } from 'react'

const Pagination = ({ perPage, total, paginate }) => {
  const numberOfPages = []
  for (let i = 1; i <= Math.ceil(total / perPage); i++) {
    numberOfPages.push(i)
  }

  const [currentButton, setCurrentButton] = useState(1)

  const [arrOfCurrButtons, setArrOfCurrButtons] = useState([])

  if (arrOfCurrButtons[arrOfCurrButtons.length - 1] !== numberOfPages.length){
    updateButtons(true)
  }

  useEffect(() => {
    updateButtons(false)
  }, [currentButton])


  function updateButtons(bool) {
    let dotsInitial = '...'
    let dotsLeft = '... '
    let dotsRight = ' ...'
    let tempNumberOfPages = [...arrOfCurrButtons]
    if (bool) {
      tempNumberOfPages = []
      setArrOfCurrButtons([])
      if (numberOfPages.length < 6) {
        tempNumberOfPages = numberOfPages
      }
      else if (currentButton >= 1 && currentButton <= 3) {
        tempNumberOfPages = [1, 2, 3, 4, dotsInitial, numberOfPages.length]
      }
      setCurrentButton(1)
      setArrOfCurrButtons(tempNumberOfPages)
      return
    }

    if (numberOfPages.length < 6) {
      tempNumberOfPages = numberOfPages
    }

    else if (currentButton >= 1 && currentButton <= 3) {
      tempNumberOfPages = [1, 2, 3, 4, dotsInitial, numberOfPages.length]
    }

    else if (currentButton === 4) {
      const sliced = numberOfPages.slice(0, 5)
      tempNumberOfPages = [...sliced, dotsInitial, numberOfPages.length]
    }

    else if (currentButton > 4 && currentButton < numberOfPages.length - 2) {
      const sliced1 = numberOfPages.slice(currentButton - 2, currentButton)
      const sliced2 = numberOfPages.slice(currentButton, currentButton + 1)
      tempNumberOfPages = ([1, dotsLeft, ...sliced1, ...sliced2, dotsRight, numberOfPages.length])
    }

    else if (currentButton > numberOfPages.length - 3) {
      const sliced = numberOfPages.slice(numberOfPages.length - 4)
      tempNumberOfPages = ([1, dotsLeft, ...sliced])
    }

    else if (currentButton === dotsInitial) {
      setCurrentButton(arrOfCurrButtons[arrOfCurrButtons.length-3] + 1)
    }
    else if (currentButton === dotsRight) {
      setCurrentButton(arrOfCurrButtons[3] + 2)
    }

    else if (currentButton === dotsLeft) {
      setCurrentButton(arrOfCurrButtons[3] - 2)
    }

    setArrOfCurrButtons(tempNumberOfPages)
    paginate(currentButton)
  }

  if (numberOfPages.length > 0) {
    return (
      <div className="pagination">
        <a
          href="#"
          disabled={currentButton === 1}
          onClick={() => setCurrentButton(prev => prev <= 1 ? prev : prev - 1)}
          className="page-link"
          style={{borderRadius: '5px 0px 0px 5px'}}
        >
          Prev
        </a>

        {arrOfCurrButtons.map(((item, index) => {
          return <a
            href="#"
            key={index}
            className={`${currentButton === item ? 'active' : ''}`}
            onClick={() => setCurrentButton(item)}
            className="page-link"
          >
            {item}
          </a>
        }))}

        <a
          href="#"
          className={`${currentButton === numberOfPages.length ? 'disabled' : ''}`}
          onClick={() => setCurrentButton(prev => prev >= numberOfPages.length ? prev : prev + 1)}
          className="page-link"
          style={{borderRadius: '0px 5px 5px 0px'}}
        >
          Next
        </a>
      </div>
    );
  } else {
    return;
  }
}

export default Pagination
