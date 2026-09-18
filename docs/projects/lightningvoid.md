This game was a early attempt to create a 2D game engine in C# and Raylib_cs.
I got pretty far, but the codebase turned into a horrendous mess to work in. Too many ordering of execution issues and taught me the importance of the chain of responsibility.
In that version of the game i managed to set up a: 
- Particle systems:
    - Texture / Quad based or DrawLine functions
    - SIMD
    - Json created emitters.
- A simpler ECS architecture
- Renderpipline with Shader management for 2D sprites.
Mistakes were made, but knowledge was gained.

I am currently rewriting the game in Odin and SDL3. You can download the current game version in the Downloads section
This time the codebase is quite a bit easier to manage as i am not trying to be too fancy with how i handle Entites and Rendering.
- One Level container that i can empty by clearing the memory arena i am using for it.
- A simpler 2D particle system:
    - 


::youtube(https://youtu.be/ggxBnS5H-Eo)


- [Windows Download](downloads/LightningVoid-Windows.zip)
- [Linux Download](downloads/LightningVoid-Linux.zip)
- [MacOS Download](downloads/LightningVoid-macOS-universal.zip)