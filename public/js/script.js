// Example starter JavaScript for disabling form submissions if there are invalid fields
(() => {
  'use strict'

  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  const forms = document.querySelectorAll('.needs-validation')

  // Loop over them and prevent submission
  Array.from(forms).forEach(form => {
    form.addEventListener('submit', event => {
      if (!form.checkValidity()) {
        event.preventDefault()
        event.stopPropagation()
      }

      form.classList.add('was-validated')
    }, false)
  })
})()

// //For left right button for filters 
// document.addEventListener('DOMContentLoaded', () => {
//   const filters = document.getElementById('filters')
//   const scrollRightButton = document.querySelector('[data-filter-scroll-right]')
//   const scrollLeftButton = document.querySelector('[data-filter-scroll-left]')

//   if (!filters || !scrollRightButton || !scrollLeftButton) return

//   const updateButtonVisibility = () => {
//     const isScrollable = filters.scrollWidth > filters.clientWidth
//     const atStart = filters.scrollLeft <= 1
//     const atEnd = filters.scrollLeft + filters.clientWidth >= filters.scrollWidth - 1

//     scrollLeftButton.classList.toggle('d-none', !isScrollable || atStart)
//     scrollRightButton.classList.toggle('d-none', !isScrollable || atEnd)
//   }

//   scrollLeftButton.addEventListener('click', () => {
//     filters.scrollBy({
//       left: -(filters.clientWidth * 0.75),
//       behavior: 'smooth'
//     })
//   })

//   scrollRightButton.addEventListener('click', () => {
//     filters.scrollBy({
//       left: filters.clientWidth * 0.75,
//       behavior: 'smooth'
//     })
//   })

//   filters.addEventListener('scroll', updateButtonVisibility)
//   window.addEventListener('resize', updateButtonVisibility)

//   updateButtonVisibility()
// })