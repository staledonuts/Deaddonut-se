This is one of my side projects, I am working on a port of the old Ravensoft game "MageSlayer". This is a project to learn how ot better handle memory and learning a new language.

Written in Odin lang and using SDL3 OpenGL.

so far i have managed to: 

- Implement the "Vampire Package" virtual file system for loading all the assets that the game used.
- Load and parse most of the level geometry and projecting textures to the faces.
- Set up a very rudimentary physics / collision system.
- Hook up audio.
- implement my own gameplay that looks a little like the old game.
- Implement a simple particle system with a circular array ring buffer.
- Debug Menu.


What i am missing:

- Still trying to figure out how to parse the compiled scripting language they used. (this is probably beyond my current knowledge)
- The scripting language seems to be a bytecode VM which needs a lot of learning to figure out how to actually do.
- Implement the actual gameplay loop.
- Data mine the game extensively to find all the information i need.