/* global interact */

// Notes to future devs:
//
// - Choice of a non-transpiled, non-promise, non-import, callback style, older
//   code base is intentional due to where this sample code will get ported to.
//   Going old skool baby.
// - Callback (presumed async) based functions should attempt to adhere to an
//   arity of 2, with a signature of `f(data: object, callback: function (error, data))`.
//   Need more args? Wrap in an object (acting as associative array).
(function () {
  // Gridiron internals as old fashioned invoke immediate function.
  const gridiron = {};

  //
  // Async helper methods.
  //
  (function (exports) {
    exports.async = {}

    //
    // Chain callback style methods together.
    //
    // Taks `funcs` an array of functions, treated as a queue of workers, and
    // returns a function to begin the process.
    //
    // First call passes any args to first function in the queue, all additional
    // functions are called with the return value of the previous.
    //
    // If any error is encountered, the queue stops, and the error is passed
    // as `callbacks.error(error)`. `callbacks.error` is not included, error
    // is thrown. If included, `callbacks.done(data)` is
    // called with the final return value from the final function in the queue.
    //
    const waterfall = function (funcs, callbacks) {
      callbacks = callbacks || {}
      const next = function () {
        const f = funcs.shift()
        if (f) {
          // Support either first call or additional calls...
          const args = Array.prototype.slice.call(arguments)
          // ...assume standard callback is last signature...
          args.push(function (error, data) {
            // ...if error, then throw...
            if (error) {
              if (typeof callbacks.error === 'function') {
                callbacks.error(error)
              } else {
                throw error
              }
            }
            // ...otherwise next call until task queue is empty.
            next(data)
          })
          // Call the task with the arguments.
          f.apply(null, args)
        } else if (typeof callbacks.done === 'function') {
          callbacks.done.apply(null, Array.prototype.slice.call(arguments))
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
    // `src: string` is URI to read from, and assumed to be all we'll need.
    // Callback is invoked with `callback(error, data)`
    const read = function (src, callback) {
      //
      // Faux http request.
      //
      setTimeout(function () {
        // WARNING: Data structure not finalized, and this is faux data (in case
        // the placekitten reference didn't set off your warning signals).
        callback(null, {
          mapURI: src,
          coords: [],
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
      const loadingMessage = document.querySelector('#gridiron-map-image-loading')
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
        img.onload = function () {
          callback(null)
        }
      })
    }
    exports.image.load = load

    // What are the dimensions of the loaded map image?
    const dimensions = function () {
      const mapContainer = document.querySelector('#gridiron-map-image-container')
      const mapImage = document.querySelector('#gridiron-map-image')

      return {
        // Height and width for determining basic number of gridlines.
        height: mapImage.offsetHeight,
        width: mapImage.offsetWidth,

        // Determines full size of gridlines (they cut across the container)/
        container: {
          height: mapContainer.offsetHeight,
          width: mapContainer.offsetWidth,
        },

        // We ASSUME (danger danger) that image is center, or at least constrained
        // and that we'll need to offset the gridlines via math magic.
        offset: {
          // left, aka. x
          x: (mapContainer.offsetWidth - mapImage.offsetWidth) / 2,
          y: (mapContainer.offsetHeight - mapImage.offsetHeight) / 2,
        }
      }
    }
    exports.image.dimensions = dimensions
  })(gridiron);

  // Grid controllers for the prototype.
  (function (exports) {
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

    //
    // `axis: string` is `x` or `y`
    // `num: number` is integer value of how many gridlines to draw on the image
    // if included, or if not included lets the app decide a default number of
    // gridlines.
    //
    // TODO: Switch to default num? 6 gridlines?
    //
    const renderGridlines = function (axis, num) {
      const dims = gridiron.image.dimensions()
      const imageWidth = axis === 'x' ? dims.width : dims.height
      // Length of gridline cuts across entire container.
      const gridlineLength = axis === 'x' ? dims.container.height : dims.container.width
      // Calculate number of gridlines and the space between them.
      let distanceBetweenGridlines = 100
      if (!num) {
        // Assume default distance, calculate default number of gridlines.
        num = Math.floor(imageWidth / distanceBetweenGridlines)
      } else {
        // Fit all of the requested gridlines in as best as possible.
        distanceBetweenGridlines = Math.floor(imageWidth / num)
      }

      // Gridline container that will hold our gridlines.
      const container = document.querySelector('#gridiron-map-gridlines-' + axis)
      // Grid contains start and end boundaries.
      for (let i = 0; i < num + 1; i++) {
        const gridline = document.createElement('div')
        gridline.className = 'gridiron-gridline-' + axis
        // Dynamically set height since gridline is child of a positioned container.
        gridline.style[axis === 'x' ? 'height' : 'width'] = gridlineLength + 'px'
        gridline.style[axis === 'x' ? 'left' : 'top'] = (dims.offset[axis] + i * distanceBetweenGridlines) + 'px'
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
      // Unwrap the data we need and pass down the pipeline.
      function (data, callback) {
        // if we don't have this, it's a problem.
        callback(null, data.mapURI)
      },
      gridiron.image.load,
      gridiron.renderGridlines,
    ], {
      // Let it throw for now. If errors become a problem, which they will
      // with HTTP, we should notify with a problem.
      // error: function (error) {console.log('you haz error:', error)},
      //
      // We don't need done, since the final function in the queue doesn't
      // return anything we need.
      // done: function (data) {console.log('you haz data:', data)},
    })
    // Originally had the idea of passing in some data, but not needed at the
    // moment. Kick off the task queue.
    // DEMO ONLY SRC.
    taskQueue('http://placekitten.com/800/600')
  }

  main()
})()
