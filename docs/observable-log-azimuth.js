// https://observablehq.com/@fil/log-azimuthal
function LogAzimuthal() {
  AzimuthalRaw;
  let S = 1, B = 180; // scale(1 to 900), clipAngle(45  to 179.999)
  const acos = Math.acos, exp = Math.exp, log = Math.log, sin = Math.sin;

  const b = B * Math.PI / 180; // clipAngle in radians (0 < b < PI)
  const s = S**2;
  const Rb = 1; // this is due to the way d3.fitExtent works, I think
  const factor = log(1 + s * b);
  const s_1 = s ? 1 / s : 0; // if s == 0, s_1 == 0 else s_1 == 1 / s

  var p = d3.geoAzimuthalRaw(function(r) {
    var z = acos(r);
    return z ? log(1 + s * z) / factor / sin(z) : 1; // if z == 0, return 1
  });

  p.invert = d3.geoAzimuthalInvert(function(a) {
    if (s == 0) return a;
    return (exp(a * factor / Rb) - 1) * s_1;
  });

  return d3.geoLogAzimuthal = p;
}
r = sin(a) * scale(cos(a))


function SIMPLIF() {
  let S = 1 // scale(1 to 900)
  const s = S**2; // (1 to 810000)

  const pi = 3.14;
  const factor = log(1 + s * b);

  var p = d3.geoAzimuthalRaw(function(r) {
    var z = acos(r);  
    return log(1 + s * z) / factor / sin(z);
    // return z ? log(1 + s * z) / factor / sin(z) : 1; // if z == 0, return 1
  });

  p.invert = d3.geoAzimuthalInvert(function(a) {
    return (exp(a * factor) - 1) * s;
  });

  return d3.geoLogAzimuthal = p;
}

function SIMPLIFIIIII() {
  let S = 1 // scale(1 to 900)
  const s = S**2; // (1 to 810000)

  const pi = 3.14;
  const factor = log(1 + s * b);

  var p = d3.geoAzimuthalRaw(function(r) {
    var z = acos(r);  
    return log(1 + acos(r)) / log(1 + pi) / sin(acos(r));
    // return z ? log(1 + s * z) / factor / sin(z) : 1; // if z == 0, return 1
  });

  p.invert = d3.geoAzimuthalInvert(function(a) {
    return (exp(a * factor) - 1) * s;
  });

  return d3.geoLogAzimuthal = p;
}


// // https://stackoverflow.com/questions/20729757/glsl-determine-if-vector-is-not-zero
// float PRECISION 0.000001

// float val = ...;
// // returns 1.0 if it's in the range, 0.0 otherwise
// float is_not_too_close_to_zero = step(-PRECISION, val) * (1.0 - step(PRECISION, val));
