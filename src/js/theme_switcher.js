document.querySelector('#btn_switch_theme').addEventListener('click',()=>{
    if (document.querySelector("html").getAttribute('data-bs-theme') == 'dark') {
        document.querySelector("html").setAttribute('data-bs-theme','light')
    }
    else {
        document.querySelector("html").setAttribute('data-bs-theme','dark')
    }
  })