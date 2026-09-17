This is one of my side projects: a port of the classic Raven Software game "MageSlayer". This is a project to learn how to better handle memory and learn a new language.

Written in the Odin programming language, using SDL3 and OpenGL.

So far, I have managed to: 

- Implement the "Vampire Package" virtual file system for loading all the assets that the game used.
- Load and parse most of the level geometry and project textures onto the faces.
- Set up a very rudimentary physics / collision system.
- Hook up audio.
- Implement my own gameplay that resembles the original game.
- Implement a simple particle system with a circular array ring buffer.
- Implement a debug menu.


What is still missing:

- Still trying to figure out how to parse the compiled scripting language they used (this is probably beyond my current knowledge).
- The scripting language seems to run on a bytecode VM, which will take some research and learning to implement.
- Implement the core gameplay loop.
- Datamine the game extensively to find all the information I need.

::youtube(https://youtu.be/4_3CL51V-g4)