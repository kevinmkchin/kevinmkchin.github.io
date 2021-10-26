
uniform vec3 lightPosition;

uniform mat4 rotationMatrix;

out vec3 colour;

#define PELVIS_HEIGHT 25.0


void main() {
    // HINT: Q1(d and e) You will need to change worldPos to make the Armadillo move.
    // modelMatrix only contains scale and translation info
    // Use rotationMatrix for rotation info
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vec3 vertexNormal = vec3(1.0);
    float skinning_alpha = (worldPos.y - 4.0) / 4.0;
    if(skinning_alpha < 0.0)
    {
        worldPos = modelMatrix * vec4(position, 1.0);
        vertexNormal = normalize(normalMatrix * normal);
    }
    else if(skinning_alpha > 1.0)
    {
        worldPos = modelMatrix * rotationMatrix * vec4(position, 1.0);
        vertexNormal = normalize(normalMatrix * mat3(inverse(transpose(rotationMatrix))) * normal);
    }
    else // transition zone
    {
        vec4 blended_pos = skinning_alpha * rotationMatrix * vec4(position, 1.0) 
                            + (1.0 - skinning_alpha) * vec4(position, 1.0);
        worldPos = modelMatrix * blended_pos;
        vertexNormal = normalize(normalMatrix * mat3(inverse(transpose(rotationMatrix))) * normal);
    }

    vec3 lightDirection = normalize(vec3(viewMatrix*(vec4(lightPosition - worldPos.xyz, 0.0))));

    float vertexColour = dot(lightDirection, vertexNormal);
    colour = vec3(vertexColour);

    gl_Position = projectionMatrix * viewMatrix * worldPos;
    
}