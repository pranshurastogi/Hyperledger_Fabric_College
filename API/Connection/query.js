var Fabric_Client = require('fabric-client');
var path = require('path');
var Fabric_CA_Client = require('fabric-ca-client');
var util = require('util');
var log4js = require('log4js');
var log = log4js.getLogger();
var constants = require('../constants.json');
//fabric dependency
var fabric_client = new Fabric_Client();
var channel = fabric_client.newChannel('mychannel');
var peer = fabric_client.newPeer(constants.fabric.peerAddress);
channel.addPeer(peer);
var order = fabric_client.newOrderer(constants.fabric.ordererAddress);
channel.addOrderer(order);
var fabric_ca_client = null;
var admin_user = null;
var member_user = null;
var store_path = path.join(__dirname, 'hfc-key-store');
var tx_id = null;




/**
 * 
 * @param {*} adminUser 
 */
function registerAdmin(adminUser, cb) {
    Fabric_Client.newDefaultKeyValueStore({
        path: store_path
    }).then((state_store) => {
        fabric_client.setStateStore(state_store);
        var crypto_suite = Fabric_Client.newCryptoSuite();
         var crypto_store = Fabric_Client.newCryptoKeyStore({ path: store_path });
        crypto_suite.setCryptoKeyStore(crypto_store);
        fabric_client.setCryptoSuite(crypto_suite);
        var tlsOptions = {
            trustedRoots: [],
            verify: false
        };
       // console.log("1", constants.fabric.caServerAddress)
        // be sure to change the http to https when the CA is running TLS enabled
        fabric_ca_client = new Fabric_CA_Client(constants.fabric.caServerAddress, tlsOptions, 'ca.example.com', crypto_suite);

        // first check to see if the admin is already enrolled
        return fabric_client.getUserContext(adminUser, true);
    }).then((user_from_store) => {
        if (user_from_store && user_from_store.isEnrolled()) {
            log.info('Successfully loaded admin from persistence');
            admin_user = user_from_store;
            return null;
        } else {
            // need to enroll it with CA server
            return fabric_ca_client.enroll({
                enrollmentID: adminUser,
                enrollmentSecret: 'adminpw'
            }).then((enrollment) => {
                log.info('Successfully enrolled admin user "admin"');
                return fabric_client.createUser(
                    {
                        username: adminUser,
                        mspid: 'Org1MSP',
                        cryptoContent: { privateKeyPEM: enrollment.key.toBytes(), signedCertPEM: enrollment.certificate }
                    });
            }).then((user) => {
                admin_user = user;
                return fabric_client.setUserContext(admin_user);
            }).catch((err) => {
                cb("Failed to enroll admin: "+ err);
                log.error('Failed to enroll and persist admin. Error: ' + err.stack ? err.stack : err);
                throw new Error('Failed to enroll admin');
            });
        }
    }).then(() => {
        cb(null, admin_user.toString());
        console.log('Assigned the admin user to the fabric client ::' + admin_user.toString());
    }).catch((err) => {
        cb("Failed to enroll admin: "+ err);
        console.error('Failed to enroll admin: ' + err);
    });

}



/**
 * 
 * @param {*} adminUser 
 * @param {*} username 
 * @param {function} cb
 */
function registerUser(adminUser, username, cb) {
    Fabric_Client.newDefaultKeyValueStore({
        path: store_path
    }).then((state_store) => {
        fabric_client.setStateStore(state_store);
        var crypto_suite = Fabric_Client.newCryptoSuite();
        var crypto_store = Fabric_Client.newCryptoKeyStore({ path: store_path });
        crypto_suite.setCryptoKeyStore(crypto_store);
        fabric_client.setCryptoSuite(crypto_suite);
        fabric_ca_client = new Fabric_CA_Client(constants.fabric.caServerAddress, null, '', crypto_suite);
        return fabric_client.getUserContext(adminUser, true);
    }).then((user_from_store) => {
        if (user_from_store && user_from_store.isEnrolled()) {
            log.info('Successfully loaded admin from persistence');
            admin_user = user_from_store;
        } else {
            cb("Failed to enroll user... run enrollemnt.js")
        }
        return fabric_ca_client.register({ enrollmentID: username, affiliation: 'org1.department1', role: 'client' }, admin_user);
    }).then((secret) => {
        // next we need to enroll the user with CA server
        log.info('Successfully registered user3 - secret:' + secret);

        return fabric_ca_client.enroll({ enrollmentID: username, enrollmentSecret: secret });
    }).then((enrollment) => {
        log.info('Successfully enrolled member user "user3" ');
        return fabric_client.createUser(
            {
                username: username,
                mspid: 'Org1MSP',
                cryptoContent: { privateKeyPEM: enrollment.key.toBytes(), signedCertPEM: enrollment.certificate }
            });
    }).then((user) => {
        member_user = user;

        return fabric_client.setUserContext(member_user);
    }).then(() => {
        cb(null, true);
        console.log('user3 was successfully registered and enrolled and is ready to interact with the fabric network');

    }).catch((err) => {
        cb("Failed to register:"+username)
        console.error('Failed to register: ' + err);
        if (err.toString().indexOf('Authorization') > -1) {
            console.error('Authorization failures may be caused by having admin credentials from a previous CA instance.\n' +
                'Try again after deleting the contents of the store directory ' + store_path);
        }
    });
}

function invokeChaincode(username, chaincodeId, fcn, channelName, args, cb) {
    //  create the key value store as defined in the fabric-client/config/default.json 'key-value-store' setting
    Fabric_Client.newDefaultKeyValueStore({
        path: store_path
    }).then((state_store) => {
        fabric_client.setStateStore(state_store);
        var crypto_suite = Fabric_Client.newCryptoSuite();
        var crypto_store = Fabric_Client.newCryptoKeyStore({ path: store_path });
        crypto_suite.setCryptoKeyStore(crypto_store);
        fabric_client.setCryptoSuite(crypto_suite);
        return fabric_client.getUserContext(username, true);
    }).then((user_from_store) => {
        if (user_from_store && user_from_store.isEnrolled()) {
            log.info('Successfully loaded user3 from persistence');
            member_user = user_from_store;
        } else {
            throw new Error(' to get user3.... rFailedun registerUser.js');
        }

        tx_id = fabric_client.newTransactionID();
        console.log(">>>>>>>>>TRANSACTION>>>>>>>>>>>>",tx_id);
        var request = {
            chaincodeId: chaincodeId,
            fcn: fcn,
            args: args,
            chainId: channelName,
            txId: tx_id
        };

        return channel.sendTransactionProposal(request);
    }).then((results) => {
        var proposalResponses = results[0];
        var proposal = results[1];
	console.log("Proposal :",proposalResponses);
	console.log("*******",proposal);
        let isProposalGood = false;
        if (proposalResponses && proposalResponses[0].response &&
            proposalResponses[0].response.status === 200) {
            isProposalGood = true;
            console.log('Transaction proposal was good');
        } else {
            console.error('Transaction proposal was bad');
        }
        if (isProposalGood) {
            console.log(util.format(
                'Successfully sent Proposal and received ProposalResponse: Status - %s, message - "%s"',
                proposalResponses[0].response.status, proposalResponses[0].response.message));

            // build up the request for the orderer to have the transaction committed
            var request = {
                proposalResponses: proposalResponses,
                proposal: proposal
            };

            var transaction_id_string = tx_id.getTransactionID(); //Get the transaction ID string to be used by the event processing
            // console.log("Assigning transaction_id: ", tx_id._transaction_id);
            var promises = [];

            var sendPromise = channel.sendTransaction(request);
            promises.push(sendPromise); //we want the send transaction first, so that we know where to check status

            // get an eventhub once the fabric client has a user assigned. The user
            // is required bacause the event registration must be signed
            let event_hub = channel.newChannelEventHub(peer);

            // using resolve the promise so that result status may be processed
            // under the then clause rather than having the catch clause process
            // the status
            let txPromise = new Promise((resolve, reject) => {
                let handle = setTimeout(() => {
                    event_hub.unregisterTxEvent(transaction_id_string);
                    event_hub.disconnect();
                    resolve({ event_status: 'TIMEOUT' }); //we could use reject(new Error('Trnasaction did not complete within 30 seconds'));
                }, 3000);
                event_hub.registerTxEvent(transaction_id_string, (tx, code) => {
                    // this is the callback for transaction event status
                    // first some clean up of event listener
                    clearTimeout(handle);

                    // now let the application know what happened
                    var return_status = { event_status: code, tx_id: transaction_id_string };
                    if (code !== 'VALID') {
                        console.error('The transaction was invalid, code = ' + code);
                        resolve(return_status); // we could use reject(new Error('Problem with the tranaction, event status ::'+code));
                    } else {
                        console.log('The transaction has been committed on peer ' + event_hub.getPeerAddr());
                        resolve(return_status);
                    }
                }, (err) => {
                    //this is the callback if something goes wrong with the event registration or processing
                    reject(new Error('There was a problem with the eventhub ::' + err));
                },
                    { disconnect: true } //disconnect when complete
                );
                event_hub.connect();

            });
            promises.push(txPromise);

            return Promise.all(promises);
        } else {
            console.error('Failed to send Proposal or receive valid response. Response null or status is not 200. exiting...');
            throw new Error('Failed to send Proposal or receive valid response. Response null or status is not 200. exiting...');
        }
    }).then((results) => {
        console.log('Send transaction promise and event listener promise have completed');
        // check the results in the order the promises were added to the promise all list
        if (results && results[0] && results[0].status === 'SUCCESS') {
            console.log('Successfully sent transaction to the orderer.');
        } else {
            console.error('Failed to order the transaction. Error code: ' + results[0].status);
        }

        if (results && results[1] && results[1].event_status === 'VALID') {
            cb(null, tx_id.getTransactionID());
            console.log('Successfully committed the change to the ledger by the peer');
        } else {
            cb('Transaction failed to be committed to the ledger due to ::' + results[1].event_status);
            console.log('Transaction failed to be committed to the ledger due to ::' + results[1].event_status);
        }
    }).catch((err) => {
        cb('Failed to invoke successfully :: ' + err);
        console.error('Failed to invoke successfully :: ' + err);
    });

}





function postTransaction(username, chaincodeId, fcn, args, cb) {
    // create the key value store as defined in the fabric-client/config/default.json 'key-value-store' setting
    Fabric_Client.newDefaultKeyValueStore({
        path: store_path
    }).then((state_store) => {
        // assign the store to the fabric client
        fabric_client.setStateStore(state_store);
        var crypto_suite = Fabric_Client.newCryptoSuite();
        // use the same location for the state store (where the users' certificate are kept)
        // and the crypto store (where the users' keys are kept)
        var crypto_store = Fabric_Client.newCryptoKeyStore({ path: store_path });
        crypto_suite.setCryptoKeyStore(crypto_store);
        fabric_client.setCryptoSuite(crypto_suite);

        // get the enrolled user from persistence, this user will sign all requests
        return fabric_client.getUserContext(username, true);
    }).then((user_from_store) => {
        if (user_from_store && user_from_store.isEnrolled()) {
            console.log('Successfully loaded user3 from persistence');
            member_user = user_from_store;
        } else {
            // cb("Failed to get user3.... run registerUser.js");
            throw new Error('Failed to get user3.... run registerUser.js');
        }
       // queryCar chaincode function - requires 1 argument, ex: args: ['CAR4'],
        // queryAllCars chainco	de function - requires no arguments , ex: args: [''],
        const request = {
            chaincodeId: chaincodeId,
            fcn: fcn,
            args: args
        };
        return channel.queryByChaincode(request);
    }).then((query_responses) => {
        // console.log("Query has completed, checking results", query_responses[0].toString());
        if (query_responses && query_responses.length == 1) {
            if (query_responses[0] instanceof Error) {
                cb("error from query = "+ query_responses[0])
                //console.error("error from query = ", query_responses[0]);
            } else {
                cb(null, query_responses[0].toString());
                // console.log(query_responses[0].toString());
            }
        } else {
            cb("No payloads were returned from query");
            console.log("No payloads were returned from query");
        }
    }).catch((err) => {
        cb('Failed to query successfully :: ' + err);
        console.error('Failed to query successfully :: ' + err);
    });
}



// invokeChaincode("user3", "college", "createStudent", "mychannel", ['STUDENT62','SKIT74','Salman','Electronics','3'], function(err,res){
//     console.log(err,res);
// });


//  postTransaction("user3", "college", "queryAll",["STUDENT1","STUDENT99"], function(err,res){
//     console.log(err,res);
//   });


postTransaction("user3", "college", "richQuery",["stream","Electronics"], function(err,res){
        console.log(err,res);
      });
    

// registerAdmin("admin",function(err,res){
//     if(res){
//          registerUser("admin","user3", function(err,res){

//          });
//      }
// });





module.exports = {
invokeChaincode,
registerAdmin,
registerUser,
postTransaction
}
