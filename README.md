API Breadboard

Designed to help developers visualize and analyze API chains in one tool, API Breadboard is a simple yet innovative product where users can manipulate and experiment with API requests, chain their inputs and outputs, and allow for API exploration. Not only are users able to craft complex chains of API requests, they are also be able to view and dissect each request’s parameters and outputs, and generate Javascript code that can be exported and executed outside of the API breadboard environment and successfully replicate the output of the chaining process.


How to build the application from source:

	1. install the latest version of node.js and npm on your system.
	2. run 'npm i' to install dependencies (in the folder that this README was found in)
	3. run 'npm run build' to build the webpack (in the folder that this README was found in)
	4. run 'npm run make' to build the executables (in the folder that this README was found in)

The built executables will appear in the 'out/' directory of the program. By default, electron-builder will build for the operating system it's being run on. To override this default, use the command 'npm run make -- <TARGETOS>' where <TARGETOS> is either '--mac', '--win', or '--linux' respectively.

When building for linux, you can add an additional argument to specify which package manager you want to target (e.g '--linux pacman', '--linux deb', '--linux rpm').

