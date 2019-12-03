# Gridiron

Load an image, arrange 2d gridlines over the image.

## Local testing

```bash
# docs is github pages friendly
cd docs
python -m SimpleHTTPServer 8000
```

## TODO

- [ ] Add/subtract total number of gridlines, recalculating the gridlines on the axis when done.
    - [ ] Provide controls for the above.
- [ ] Label numbers across the top, letters down the side.
    - [ ] Relabel on drag (or constrain elements more better so no relabeling needed).
- [ ] Probably need templating...
- [ ] Write as an interim JSON dump to console.
- [ ] Add in jquery.ajax (since it's what we'll be using, not ky) and make an http request to data on the server.
