using Microsoft.AspNetCore.Components;
using Microsoft.JSInterop;
using System.Threading.Tasks;

namespace DonutPortfolio.Pages
{
    public partial class Portfolio : ComponentBase
    {
        // This injects the JSRuntime service so we can call JavaScript.
        // It's an alternative to injecting in the .razor file.
        [Inject]
        private IJSRuntime JSRuntime { get; set; } = null!;

        // A reference to the div that will contain the WebGL canvas.
        // The `@ref` in the .razor file will populate this field.
        private ElementReference webglCanvasContainer;

        // A module reference for our JavaScript file to improve performance
        private IJSObjectReference? jsModule;

        // This method is called after the component has finished rendering.
        // It's the perfect place to initialize JavaScript libraries.
        protected override async Task OnAfterRenderAsync(bool firstRender)
        {
            if (firstRender)
            {
                // Load the JavaScript module. This syntax is correct.
                jsModule = await JSRuntime.InvokeAsync<IJSObjectReference>(
                    "import", "./js/webgl-init.js");

                // Load the default shader on first load
                await LoadDefaultShader();
            }
        }

        // This method loads the default vertex and fragment shaders.
        private async Task LoadDefaultShader()
        {
            if (jsModule is not null)
            {
                // This call passes the container reference and shaders to our JS function.
                await jsModule.InvokeVoidAsync("initWebGL", webglCanvasContainer, VertexShaderDefault, FragmentShaderDefault);
            }
        }

        // This method loads an alternative, more colorful shader.
        private async Task LoadPsychedelicShader()
        {
            if (jsModule is not null)
            {
                await jsModule.InvokeVoidAsync("initWebGL", webglCanvasContainer, VertexShaderDefault, FragmentShaderPsychedelic);
            }
        }

        // You can easily swap out these shaders with your own GLSL code.

        // Default Vertex Shader: Standard perspective transformation.
        private const string VertexShaderDefault = @"
            attribute vec4 aVertexPosition;
            attribute vec3 aVertexNormal;

            uniform mat4 uModelViewMatrix;
            uniform mat4 uProjectionMatrix;
            uniform mat4 uNormalMatrix;

            varying highp vec3 vLighting;

            void main(void) {
                gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;

                // Apply lighting effect
                highp vec3 ambientLight = vec3(0.3, 0.3, 0.3);
                highp vec3 directionalLightColor = vec3(1, 1, 1);
                highp vec3 directionalVector = normalize(vec3(0.85, 0.8, 0.75));

                highp vec4 transformedNormal = uNormalMatrix * vec4(aVertexNormal, 1.0);

                highp float directional = max(dot(transformedNormal.xyz, directionalVector), 0.0);
                vLighting = ambientLight + (directionalLightColor * directional);
            }";

        // Default Fragment Shader: Applies lighting and a solid color.
        private const string FragmentShaderDefault = @"
            varying highp vec3 vLighting;
            
            void main(void) {
                gl_FragColor = vec4(vec3(0.1, 0.5, 0.8) * vLighting, 1.0);
            }";

        // Psychedelic Fragment Shader: A more dynamic shader using time.
        private const string FragmentShaderPsychedelic = @"
            precision highp float;
            varying highp vec3 vLighting;
            uniform float uTime; // Time in seconds

            void main(void) {
                vec3 color = 0.5 + 0.5 * cos(uTime + vLighting + vec3(0, 2, 4));
                gl_FragColor = vec4(color, 1.0);
            }";
    }
}
