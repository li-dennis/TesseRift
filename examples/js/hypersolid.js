 function Shape(argv) {
    var self = this,
      vertices = argv[0],
      edges = argv[1];

    // Rotations will always be relative to the original shape to avoid rounding errors.
    // This is a structure for caching the rotated vertices.
    var rotatedVertices = new Array(vertices.length);
    copyVertices();

    // This is where we store the current rotations about each axis.
    var rotations = { xy: 0, xz: 0, xw: 0, yz: 0, yw: 0, zw: 0 };

    var rotationOrder = {
      yz: 1,
      xw: 1,
      yw: 1,
      zw: 1,
      xy: 1,
      xz: 1,
    };

    // Multiplication by vector rotation matrices of dimension 4
    var rotateVertex = {
      xy: function(v, s, c) {
        tmp = c * v.x + s * v.y;
        v.y = -s * v.x + c * v.y;
        v.x = tmp;
      },
      xz: function(v, s, c) {
        tmp = c * v.x + s * v.z;
        v.z = -s * v.x + c * v.z;
        v.x = tmp;
      },
      xw: function(v, s, c) {
        tmp = c * v.x + s * v.w;
        v.w = -s * v.x + c * v.w;
        v.x = tmp;
      },
      yz: function(v, s, c) {
        tmp = c * v.y + s * v.z;
        v.z = -s * v.y + c * v.z;
        v.y = tmp;
      },
      yw: function(v, s, c) {
        tmp = c * v.y - s * v.w;
        v.w = s * v.y + c * v.w;
        v.y = tmp;
      },
      zw: function(v, s, c) {
        tmp = c * v.z - s * v.w;
        v.w = s * v.z + c * v.w;
        v.z = tmp;
      }
    };

    var eventCallbacks = {};

    self.getOriginalVertices = function() {
      return vertices;
    };

    self.getVertices = function() {
      return rotatedVertices;
    };

    self.getEdges = function() {
      return edges;
    };

    self.getRotations = function() {
      return rotations;
    };

    // This will copy the original shape and put a rotated version into rotatedVertices
    self.rotate = function(axis, theta)  {
      addToRotation(axis, theta);
      applyRotations();
      triggerEventCallbacks('rotate');
    };

    self.on = function(eventName, callback) {
      if (eventCallbacks[eventName] === undefined) {
        eventCallbacks[eventName] = [];
      }
      eventCallbacks[eventName].push(callback);
    };

    function triggerEventCallbacks(eventName) {
      if (eventCallbacks[eventName] !== undefined) {
        for (index in eventCallbacks[eventName]) {
          eventCallbacks[eventName][index].call(self);
        }
      }
    }

    function addToRotation(axis, theta) {
      rotations[axis] = (rotations[axis] + theta) % (2 * Math.PI);
    }

    function applyRotations() {
      copyVertices();

      for (var axis in rotationOrder) {
        // sin and cos precomputed for efficiency
        var s = Math.sin(rotations[axis]);
        var c = Math.cos(rotations[axis]);

        for (var i in vertices)
        {
          rotateVertex[axis](rotatedVertices[i], s, c);
        }
      }
    }

    function copyVertices() {
      for (var i in vertices) {
        var vertex = vertices[i];
        rotatedVertices[i] = {
          x: vertex.x,
          y: vertex.y,
          z: vertex.z,
          w: vertex.w
        };
      }
    }
  }


