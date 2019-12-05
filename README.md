# Gridiron

Load an image, arrange 2d gridlines over the image.

## Local testing

```bash
# docs is github pages friendly
cd docs
python -m SimpleHTTPServer 8000
```

## TODO

- [X] Add/subtract total number of gridlines, recalculating the gridlines on the axis when done.
    - [X] Provide controls for the above.
- [X] Gridline labels: numbers across the top, letters down the side.
    - [X] Relabel on drag (or constrain elements more better so no relabeling needed).
    - [X] Relabel on redraws.
- [X] Bug: labeling needs to sort then label based on actual offset + dragging transform (stored in html data- attr).
- [ ] Bug: dragging is messed up when adding/subtracting gridlines. Maybe unregister events?
- [ ] Write as an interim JSON dump to console.
- [ ] Add in jquery.ajax for requests.
