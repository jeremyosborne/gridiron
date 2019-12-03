/* global interact */
(function () {
  // Gridiron internals as old fashioned invoke immediate function.

  // Async load an image from URI `src` and invokes callback with signature
  // callback(error, ImgElement) when done.
  const imagePreloader = function (src, callback) {
    const preloader = document.createElement('img')
    preloader.src = src
    preloader.style.left = '-9000px'
    preloader.style.position = 'fixed'
    preloader.style.top = '-9000px'
    // Good enough job of determining dimensions.
    preloader.onload = function () {
      callback(null, this)
    }
  };

  // Grid controllers for the prototype.
  (function () {
    // Pixels between gridlines...
    const MIN_DEFAULT_DISTANCE = 100

    // Get dimensions of the container. For prototype, ignore browser resize and zoom.
    const mapDimensions = function () {
      const el = document.querySelector('#gridiron-map')
      return {height: el.offsetHeight, width: el.offsetWidth}
    }

    // axis is `x` or `y`
    const draggableGridlines = function (axis) {
      interact('.gridiron-gridline-' + axis).draggable({
        inertia: true,
        modifiers: [
          interact.modifiers.restrictRect({
            restriction: 'parent',
            endOnly: true,
          })
        ],
        autoScroll: true,
        onmove: function (event) {
          var target = event.target
          var location = (parseFloat(target.getAttribute('data-' + axis)) || 0) + event['d' + axis]

          // translate the element
          target.style.webkitTransform =
            target.style.transform =
              'translate' + axis.toUpperCase() + '(' + location + 'px)'

          // update the posiion attributes in `data-x` or `data-y`
          target.setAttribute('data-' + axis, location)
        }
      })
    }

    // axis is `x` or `y`
    const renderGridlines = function (axis) {
      const dims = mapDimensions()
      const offset = axis === 'x' ? dims.width : dims.height
      const gridlineLength = axis === 'x' ? dims.height : dims.width
      const container = document.querySelector('#gridiron-map-gridlines-' + axis)
      const num = Math.floor(offset / MIN_DEFAULT_DISTANCE)
      for (let i = 1; i < num; i++) {
        const gridline = document.createElement('div')
        gridline.className = 'gridiron-gridline-' + axis
        // Dynamically set height since gridline is child of a positioned container.
        if (axis === 'x') {
          gridline.style.height = gridlineLength + 'px'
          gridline.style.left = (i * MIN_DEFAULT_DISTANCE) + 'px'
        } else {
          gridline.style.width = gridlineLength + 'px'
          gridline.style.top = (i * MIN_DEFAULT_DISTANCE) + 'px'
        }
        container.appendChild(gridline)
      }
    }
    renderGridlines('x')
    draggableGridlines('x')

    renderGridlines('y')
    draggableGridlines('y')
  })();

  // Image loader (form) for the prototype.
  (function () {
    // Development/debug
    document.querySelector('#gridiron-image-loader-src').value = 'http://placekitten.com/800/600'

    document.querySelector('#gridiron-image-loader').addEventListener('submit', function (e) {
      e.preventDefault()

      const src = this.querySelector('#gridiron-image-loader-src').value
      if (src) {
        imagePreloader(src, function (error, preloaded) {
          if (error) {
            // Shouldn't actually get here.
            throw error
          }
          const img = document.querySelector('#gridiron-map-image')
          img.src = src
          img.style.maxHeight = preloaded.height + 'px'
          img.style.maxWidth = preloaded.width + 'px'
        })
      }
    }, false)
  })()
})()
