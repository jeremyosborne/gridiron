// Image loader (form) for the prototype.
(function () {
  // Development/debug
  document.querySelector('#gridiron-image-loader-src').value = 'http://placekitten.com/800/600'
  document.querySelector('#gridiron-image-loader').addEventListener('submit', function (e) {
    e.preventDefault()

    const src = this.querySelector('#gridiron-image-loader-src').value
    if (src) {
      const preloader = document.createElement('img')
      preloader.src = src
      preloader.className = 'gridiron-preloader'
      // Good enough job of determining dimensions.
      preloader.onload = function () {
        const img = document.querySelector('#gridiron-map-image')
        img.src = src
        img.style.maxHeight = this.height + "px"
        img.style.maxWidth = this.width + "px"
      }
    }
  }, false)
})();

// Grid controllers for the prototype.
(function () {
  // Pixels between gridlines...
  const MIN_DEFAULT_DISTANCE = 100

  // Get dimensions of the container. For prototype, ignore browser resize and zoom.
  const mapDimensions = function () {
    const el = document.querySelector('#gridiron-map')
    return {height: el.offsetHeight, width: el.offsetWidth}
  }

  // Constrain this to the actual image, for now use the container.
  const renderGridlinesForX = function () {
    const dims = mapDimensions()
    const distance = dims.width
    const gridlineLength = dims.height
    const container = document.querySelector('#gridiron-map-gridlines-x')
    const num = Math.floor(distance / MIN_DEFAULT_DISTANCE)
    for (let i = 1; i < num; i++) {
      const gridline = document.createElement('div')
      gridline.className = 'gridiron-gridline-x'
      // Dynamically set height since gridline is child of a positioned container.
      gridline.style.height = gridlineLength + 'px'
      gridline.style.left = (i * MIN_DEFAULT_DISTANCE) + 'px'
      container.appendChild(gridline)
    }
  }
  renderGridlinesForX()
  interact('.gridiron-gridline-x').draggable({
    inertia: true,
    modifiers: [
      interact.modifiers.restrictRect({
        // Due to the sizing of the element, restricting to parent does the
        // constraint we want.
        restriction: 'parent',
        endOnly: true
      })
    ],
    autoScroll: true,
    onmove: function (event) {
      var target = event.target
      // keep the dragged position in the data-x/data-y attributes
      var x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx
      var y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy

      // translate the element
      target.style.webkitTransform =
        target.style.transform =
          'translate(' + x + 'px, ' + y + 'px)'

      // update the posiion attributes
      target.setAttribute('data-x', x)
      target.setAttribute('data-y', y)
    }
  })

  const renderGridlinesForY = function () {
    const dims = mapDimensions()
    const distance = dims.height
    const gridlineLength = dims.width
    const container = document.querySelector('#gridiron-map-gridlines-y')
    const num = Math.floor(distance / MIN_DEFAULT_DISTANCE)
    for (let i = 1; i < num; i++) {
      const gridline = document.createElement('div')
      gridline.className = 'gridiron-gridline-y'
      // Dynamically set height since gridline is child of a positioned container.
      gridline.style.width = gridlineLength + 'px'
      gridline.style.top = (i * MIN_DEFAULT_DISTANCE) + 'px'
      container.appendChild(gridline)
    }
  }
  renderGridlinesForY()
  interact('.gridiron-gridline-y').draggable({
    inertia: true,
    modifiers: [
      interact.modifiers.restrictRect({
        // Due to the sizing of the element, restricting to parent does the
        // constraint we want.
        restriction: 'parent',
        endOnly: true
      })
    ],
    autoScroll: true,
    onmove: function (event) {
      var target = event.target
      // keep the dragged position in the data-x/data-y attributes
      var x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx
      var y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy

      // translate the element
      target.style.webkitTransform =
        target.style.transform =
          'translate(' + x + 'px, ' + y + 'px)'

      // update the posiion attributes
      target.setAttribute('data-x', x)
      target.setAttribute('data-y', y)
    }
  })

})();
