'use strict';
const shim = require('fabric-shim');
const util = require('util');

let Chaincode = class {

  async Init(stub) {
    console.info('=========== Instantiated College chaincode ===========');
    return shim.success();
  }

  async Invoke(stub) {
    let ret = stub.getFunctionAndParameters();
    console.info(ret);

    let method = this[ret.fcn];
    if (!method) {
      console.error('no function of name:' + ret.fcn + ' found');
      throw new Error('Received unknown function ' + ret.fcn + ' invocation');
    }
    try {
      let payload = await method(stub, ret.params, this);
      return shim.success(payload);
    } catch (err) {
      console.log(err);
      return shim.error(err);
    }
  }

  /**
   *
   * @param {*} stub
   * @param {*} args
   */

   // This function is used to query Incident by that particular INCIDENT id.
  async queryIncident(stub, args) {
    if (args.length != 1) {
      throw new Error('Incorrect number of arguments. Expecting IncidentNumber ex: INCIDENT01');
    }
    let incidentNumber = args[0];
    let incidentAsBytes = await stub.getState(incidentNumber); 
    if (!incidentAsBytes || incidentAsBytes.toString().length <= 0) {
      throw new Error(incidentNumber + ' does not exist: ');
    }
    console.log(incidentAsBytes.toString());
    return incidentAsBytes;
  }


  /**
   *
   * @param {*} stub
   * @param {*} args
   */
  // This function is used to query Case by that particular CASE id.
  async queryCase(stub, args) {
    if (args.length != 1) {
      throw new Error('Incorrect number of arguments. Expecting CaseNumber ex: CASE1');
    }
    let caseNumber = args[0];
    let caseAsBytes = await stub.getState(caseNumber); 
    if (!caseAsBytes || caseAsBytes.toString().length <= 0) {
      throw new Error(caseNumber + ' does not exist: ');
    }
    console.log(caseAsBytes.toString());
    return caseAsBytes;
  }




  /**
   *
   * @param {*} stub
   * @param {*} args
   */
 // This function is used to query Child by that particular CHILD id.
  async queryChild(stub, args) {
    if (args.length != 1) {
      throw new Error('Incorrect number of arguments. Expecting CarNumber ex: INCIDENT01');
    }
    let childNumber = args[0];
    let childAsBytes = await stub.getState(childNumber); 
      if (!childAsBytes || childAsBytes.toString().length <= 0) {
      throw new Error(childNumber + ' does not exist: ');
    }
    console.log(childAsBytes.toString());
    return childAsBytes;
  }




  //  // This is to append more than one incident in the case.

  //  async caseIncidentAppend(stub, args) {
  //   console.info('============= START : caseIncidentAppend ===========');
  //   if (args.length != 2) {
  //     throw new Error('Incorrect number of arguments. Expecting 2');
  //   }

  //   let caseAsBytes = await stub.getState(args[0]);
  //   let caseData = JSON.parse(caseAsBytes);
  //   let updatedIncidentID = args[1];
  //   var incidentArray = []
  //   incidentArray = caseData.incidentId;
  //   console.log(incidentArray);
  //   if ((incidentArray.indexOf(updatedIncidentID) > -1)){
  //     throw new Error('INCIDENT ID ALREADY PRESENT');
  //   }
  //   else {
  //     incidentArray.push(updatedIncidentID)
  //   }

  //   await stub.putState(args[0], Buffer.from(JSON.stringify(caseData)));
  //   console.info('============= END : update INCIDENT ID  ===========');
  // }

//   // This is to update the case status.

//  async caseStatusUpdate(stub, args) {
//   console.info('============= START : caseStatusUpdate ===========');
//   if (args.length != 2) {
//     throw new Error('Incorrect number of arguments. Expecting 2');
//   }

//   let caseAsBytes = await stub.getState(args[0]);
//   let caseData = JSON.parse(caseAsBytes);
//   let updatedCaseStatus = args[1];
//   caseData.caseStatus = updatedCaseStatus
//   console.log(updatedCaseStatus);



//   await stub.putState(args[0], Buffer.from(JSON.stringify(caseData)));
//   console.info('============= END : update Case Status ===========');
// }

// // If you want to remove incident id from any previous case.
//   async caseIncidentDelete(stub, args) {
//     console.info('============= START : caseIncidentDelete ===========');
//     if (args.length != 2) {
//       throw new Error('Incorrect number of arguments. Expecting 2');
//     }

//     let caseAsBytes = await stub.getState(args[0]);
//     let caseData = JSON.parse(caseAsBytes);
//     let updatedIncidentID = args[1];
//     var incidentArray = []
//     incidentArray = caseData.incidentId;
//     console.log(incidentArray);
//     // incidentArray.push(updatedIncidentID)
//     if (-1 != incidentArray.indexOf(updatedIncidentID)){
//       incidentArray.splice(incidentArray.indexOf(updatedIncidentID),1);
//     }
//     else{
//       throw new Error('INVALID INCIDENT ID,CHECK BEFORE REMOVING.');
//     }

//     await stub.putState(args[0], Buffer.from(JSON.stringify(caseData)));
//     console.info('============= END : changeIncidentID ===========');
//   }




  /**
   *
   * @param {*} stub
   * @param {*} args
   */
  // To create a new teacher details 
  async createTeacher(stub, args) {
    console.info('============= START : Create Teacher ===========');
    if (args.length != 7) {
      throw new Error('Incorrect number of arguments. Expecting 7');
    }

    var teacherDetails = {
      docType: 'teacher',
      teacherID: args[1],
      teacherDepartment: args[2],
      teacherQualification: args[3],
      classesAssigned:[args[4]] ,
      Status:args[5],
      dateofJoining:args[6]
    };

    await stub.putState(args[0], Buffer.from(JSON.stringify(teacherDetails)));
    console.info('============= END : Create teacher Details ===========');
  }





/**
 *
 * @param {*} stub
 * @param {*} args
 */

// To create a new student
  async createStudent(stub, args) {
    console.info('============= START : Create Student ===========');
    if (args.length != 5) {
      throw new Error('Incorrect number of arguments. Expecting 5');
    }

    var student = {
      docType: 'student',
      studentId : args[1],
      studentName:args[2],
      stream: args[3],
      currentYear: args[4]
    };

    await stub.putState(args[0], Buffer.from(JSON.stringify(student)));
    console.info('============= END : Create Student ===========');
  }

  // If you want to query all Incidents at once.
  async queryAll(stub, args) {
    if (args.length != 2) {
      throw new Error('Incorrect number of arguments. Expecting 2');
    }
    let startKey = args[0];
    let endKey = args[1];

    let iterator = await stub.getStateByRange(startKey, endKey);

    let allResults = [];
    while (true) {
      let res = await iterator.next();

      if (res.value && res.value.value.toString()) {
        let jsonRes = {};
        console.log(res.value.value.toString('utf8'));

        jsonRes.Key = res.value.key;
        try {
          jsonRes.Record = JSON.parse(res.value.value.toString('utf8'));
        } catch (err) {
          console.log(err);
          jsonRes.Record = res.value.value.toString('utf8');
        }
        allResults.push(jsonRes);
      }
      if (res.done) {
        console.log('end of data');
        await iterator.close();
        console.info(allResults);
        return Buffer.from(JSON.stringify(allResults));
      }
    }
  }



};

shim.start(new Chaincode());
