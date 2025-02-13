// https://www.shadertoy.com/view/mdVcWh
void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    // Normalized pixel coordinates (from 0 to 1)
    vec2 uv = fragCoord/iResolution.xy;
    
    // Center the coordinate system
    uv = uv * 2.0 - 1.0;
    
    // Calculate the radial distance from the center
    float r = length(uv);
    
    // If the radial distance is less than 1.0, we are inside the unit circle
    if(r < 1.0)
    {
        // Calculate the angle of the current pixel from the center
        float theta = atan(uv.y, uv.x);
        
        // Apply the fisheye effect by modifying the radial distance
        float fisheyeR = 2.0 * asin(r) / 3.14;
        
        // Convert the polar coordinates back to Cartesian coordinates
        vec2 fisheyeUV = vec2(cos(theta) * fisheyeR, sin(theta) * fisheyeR) * 0.5 + 0.5;
        
        // Sample the original image at the calculated coordinates and set the output color
        fragColor = texture(iChannel0, fisheyeUV);
    }
    else
    {
        // If we are outside the unit circle, set the output color to black
        fragColor = vec4(0.0);
    }
}
