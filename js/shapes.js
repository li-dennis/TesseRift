var shapes = {
  'tesseract' : {
    vertices : [
        { x:  50, y:  50, z:  50, w:  50 },
        { x:  50, y:  50, z:  50, w: -50 },
        { x:  50, y:  50, z: -50, w:  50 },
        { x:  50, y:  50, z: -50, w: -50 },
        { x:  50, y: -50, z:  50, w:  50 },
        { x:  50, y: -50, z:  50, w: -50 },
        { x:  50, y: -50, z: -50, w:  50 },
        { x:  50, y: -50, z: -50, w: -50 },
        { x: -50, y:  50, z:  50, w:  50 },
        { x: -50, y:  50, z:  50, w: -50 },
        { x: -50, y:  50, z: -50, w:  50 },
        { x: -50, y:  50, z: -50, w: -50 },
        { x: -50, y: -50, z:  50, w:  50 },
        { x: -50, y: -50, z:  50, w: -50 },
        { x: -50, y: -50, z: -50, w:  50 },
        { x: -50, y: -50, z: -50, w: -50 }],
    edges : [
      [ 0,  1], [ 0,  2], [ 0,  4], [ 0,  8],
                [ 1,  3], [ 1,  5], [ 1,  9],
                [ 2,  3], [ 2,  6], [ 2, 10],
                          [ 3,  7], [ 3, 11],
                [ 4,  5], [ 4,  6], [ 4, 12],
                          [ 5,  7], [ 5, 13],
                          [ 6,  7], [ 6, 14],
                                    [ 7, 15],
                [ 8,  9], [ 8, 10], [ 8, 12],
                          [ 9, 11], [ 9, 13],
                          [10, 11], [10, 14],
                                    [11, 15],
                          [12, 13], [12, 14],
                                    [13, 15],
                                    [14, 15]]
  },
  'simplex': {

//(1,1,1,-1), (1,-1,-1,-1), (-1,1,-1,-1), (-1,-1,1,-1), (0,0,0,√5 - 1)
    vertices : [
        { x:  50, y:  50, z:  50, w: -50 },
        { x:  50, y: -50, z: -50, w: -50 },
        { x: -50, y:  50, z: -50, w: -50 },
        { x: -50, y: -50, z:  50, w: -50 },
        { x:   0, y:   0, z:   0, w:  50*Math.sqrt(5)-50 },
      ],
    edges : [
      [ 0,  1], [ 0,  2], [ 0,  3], [ 0,  4],
                [ 1,  2], [ 1,  3], [ 1,  4],
                          [ 2,  3], [ 2,  4],
                                    [ 3,  4]]
  },
  'hypercone':{}
};
