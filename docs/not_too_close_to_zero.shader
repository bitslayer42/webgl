// // https://stackoverflow.com/questions/20729757/glsl-determine-if-vector-is-not-zero
float epsilon = 0.00000001;

float val = ...;
// returns 1.0 if it's in the range, 0.0 otherwise
float is_not_too_close_to_zero = step(-epsilon, val) * (1.0 - step(epsilon, val)); 