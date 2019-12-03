/* global interact */
(function () {
  // Gridiron internals as old fashioned invoke immediate function.
  const gridiron = {};

  (function (exports) {
    // Async helper methods.
    exports.async = {}

    const waterfall = function (funcs) {
      const next = function () {
        const f = funcs.shift()
        if (f) {
          // Support either first call or additional calls...
          const args = Array.prototype.slice.call(arguments)
          // ...assume standard callback is last signature...
          args.push(function (error, data) {
            // ...if error, then throw...
            if (error) {
              throw error
            }
            // ...otherwise next call until task queue is empty.
            next(data)
          })
          // Call the task with the arguments.
          f.apply(null, args)
        }
      }

      // First call allows any number of arguments.
      return function () {
        next.apply(null, Array.prototype.slice.call(arguments))
      }
    }
    exports.async.waterfall = waterfall
  })(gridiron);

  // CRUD operations integration point.
  // At the time of writing, this is stand in code to force thinking of the data
  // IO as a process separate from the app.
  (function (exports) {
    exports.crud = {}

    // This will make an HTTP request to the server and fetch the existing
    // data, either an image URI and no coordinate data (if no grid has been created)
    // or an image URI and coordinate data.
    // Callback is invoked with `callback(error, data)`
    const read = function (callback) {
      // Faux async
      setTimeout(function () {
        // WARNING: Data structure not finalized, and this is faux data (in case
        // the placekitten reference didn't set off your warning signals).
        callback(null, {
          mapURI: 'http://placekitten.com/800/600',
          coords: []
        })
      }, 600)
    }
    exports.crud.read = read

    // TODO
    const write = function (data, callback) {
      // TODO...
      callback(null)
    }
    exports.crud.write = write
  })(gridiron);

  // Map image handling.
  // Once we have a URI for the image, load it, size it appropriately, place
  // it in the page, and signal when done.
  (function (exports) {
    exports.image = {}

    // Async load an image from URI `src` and invokes callback with signature
    // `callback(error, ImgElement)` when done.
    const preload = function (src, callback) {
      const preloader = document.createElement('img')
      preloader.src = src
      preloader.style.left = '-9000px'
      preloader.style.position = 'fixed'
      preloader.style.top = '-9000px'
      // Good enough job of determining dimensions.
      preloader.onload = function () {
        callback(null, this)
      }
    }
    // no need to make this public anymore.
    // exports.image.preload = preload

    // Async load an image from URI `src` and invokes callback when done
    // with signature `callback(error)`.
    // Handles loading message in UI.
    const load = function (src, callback) {
      const loadingMessage = document.querySelector('#gridirion-map-image-loading')
      const img = document.querySelector('#gridiron-map-image')

      // Loading in process.
      loadingMessage.style.display = 'block'
      img.style.display = 'none'

      preload(src, function (error, preloaded) {
        if (error) {
          // Shouldn't actually get here.
          throw error
        }
        img.src = src
        img.style.maxHeight = preloaded.height + 'px'
        img.style.maxWidth = preloaded.width + 'px'

        // Loading done.
        loadingMessage.style.display = 'none'
        img.style.display = 'block'
        callback(null)
      })
    }
    exports.image.load = load

    // What are the dimensions of the loaded map image?
    const dimensions = function () {
      const el = document.querySelector('#gridiron-map')
      return {height: el.offsetHeight, width: el.offsetWidth}
    }
    exports.image.dimensions = dimensions
  })(gridiron);

  // Grid controllers for the prototype.
  (function (exports) {
    // Pixels between gridlines...
    const MIN_DEFAULT_DISTANCE = 100

    // Clears any existing gridlines.
    const clear = function () {
      const nodes = document.querySelectorAll('[class*="gridiron-gridline"]')
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i]
        node.parentNode.removeChild(node)
      }
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
      const dims = gridiron.image.dimensions()
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

    // External API.
    exports.renderGridlines = function () {
      // Remove existing gridlines, in case this gets called multiple times.
      clear()

      renderGridlines('x')
      draggableGridlines('x')

      renderGridlines('y')
      draggableGridlines('y')
    }
  })(gridiron)

  // int main(void), which for this is managed by the form in the page.
  const main = function () {
    const taskQueue = gridiron.async.waterfall([
      gridiron.crud.read,
      function (data, callback) {
        const src = data.mapURI
        if (src) {
          // Setup the page for grid editing.
          gridiron.image.load(src, function (error) {
            // Call passed in callback when done.
            callback(error)
          })
        }
      },
      gridiron.renderGridlines,
    ])
    // Originally had the idea of passing in some data, but not needed at the
    // moment. Kick off the task queue.
    taskQueue()
  }

  main()
})()
