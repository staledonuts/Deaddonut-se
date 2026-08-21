## JellyDonut Engine

This is one of my many attempts of writing my own game engine.

I thoroughly enjoy the process of setting up a good base for a project. sadly one could argue i have some ways to go before i manage to create a good project foundation but i am learning constantly and enjoy doing it.

This engine has been a fun way of learning about Virtual File Systems, BSP parsing, SSBO and simple lighting implementation.
the rendering pipeline that I created is questionable and needs to be re-written. it uses a RenderCommand queue but i realized that it is fighting the Raylib batching and breaking it. performance acts funky.

One thing i realized that i am not the biggest fan of is actually Object-oriented programming languages for writing a game engine. you run in to a lot of chicken and egg issues with constructors and need to create a secondary initialization for the different classes and systems you set up. It is frustrating but i will figure something out eventually!