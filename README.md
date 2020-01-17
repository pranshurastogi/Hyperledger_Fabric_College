# Hyperledger_Fabric_College
This project is build on Hyperledger Fabric to keep various college details decentralised.

## System requirements and tools to run this - 

```
1. Go lang
2. Node.js
3. docker and docker-compose
```

## Overview of Architecture ->
 We have setup with two Orgs - 1. Org1 and 2. Org2.
 So, you will find relatable chaincode and other files in respective folders. This is where whole Blockchain part resides.
 
 Now our aim is not to stay with the Blockchain part but also to represent it in a much better way. So I have created one more folder `API` in which you can go to connections folder and find `query.js` file . Here we have define two functions - 
      1. invokeChaincode()   -> This is to put data on Blockchain
      2. postTransaction()   -> This is to query data on Blockchain.
      
 I will suggest you to fork this and try running it, if you face any issues. Do let me know.
 
 ## How to run ->
 ```
 1. Open terminal
 2. cd Org1
 3. ./stop.sh
 4. ./start.sh
 5. cd ..
 6. cd Org2
 7. ./start.sh
 8. cd ..  and cd API
 9. npm install
 10. cd Connection
 11. node query.js [Go to line 327 - 334 to run functions accordingly.]
 ```
 
 ## Theme decided ->
 Now we need some project theme to implement all these functions, so I have decided college theme as most of us can relate to that and also it is quite vast and most of our things can be done.
Initially, I have just created two function to create `Student and Teacher`. You can always modify this to add more functions and complexity.

## ProblemAndSolution ->
Please add your problems in Problem.md and try to add Solution in Solution.md
These both files are present in ProblemAndSolution folder

## Rules ->
```
1. One of the most important rule is to comment and document it, as we are thinking to make it major resource for all Blockchain developer. So, comment as much as you can and document everything you can. Soon, we will be starting Medium blogs for all the hard work you all will do.

2. We will have one Problem.md file, in which we can commit major issues that we all face and we will also have solution.md in which we can write the solution of that problem by implementing that.

3. Initially Salman and I(Pranshu) will be the contributor and review all the pull requests, afterwards we will add more people's to make it a stronger community.

4. I have also created whatsapp group for blockchain community, you all can join this. We already are 100+ members
https://chat.whatsapp.com/D5glkD2qA8v3dPKSVm0fyq

5. please pro-actively participate and if you want to pull something that is much different from this setup, we can have additional folder of that in this repository with proper documentation.

6. All suggestions are welcome, do let us know.
```
