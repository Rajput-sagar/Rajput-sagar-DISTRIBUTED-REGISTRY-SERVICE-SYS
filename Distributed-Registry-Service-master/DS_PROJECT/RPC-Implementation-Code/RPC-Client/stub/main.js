let request = require('request');
let fs = require('fs');
let serviceRequestStatus = require('../request');
let clientIP = serviceRequestStatus.ip;  
function typeOf( obj ) {
  return ({}).toString.call( obj ).match(/\s(\w+)/)[1].toLowerCase();
}

//for getting parameter's type
function getArguementTypes(argValues) {
  let argTypes = [];

  for (let count = 0; count < argValues.length; count++ ) {
    if (typeOf(argValues[count]) == 'string' && argValues[count].length == 1) {
      argTypes.push('char');
    } else {
      argTypes.push(typeOf(argValues[count]));
    }
  }

  return argTypes;
}

//mapping of data to data type
let idl = {			
  number: 'int',
  boolean: 'boolean',
  int: 'int',
  string: 'string',
  char: 'char'
};

//getting client ip if not present
function getClientIP() {
  return new Promise(function (resolve, reject) //promise=call(refer net)
{
    request.get('http://myip.dnsomatic.com/', function (err, res) 
       {
      if(res.body != null && res.body != '' && res.body) {
        clientIP = res.body;
      }

      resolve(clientIP);
    });
  })
}

//converting arguments and parameter into json object
function marshall(procedure, argTypes, returnType) {
  let allParams = [];

  for(let count in argTypes) {
    let position = parseInt(count, 10) + 1;  //
    let param = {
      parameterPosition: position,
      parameterType: idl[argTypes[count]]
    };

    allParams.push(param);
  }

  let data = { serviceName: procedure,
    parameters: allParams
  };

  return data;
}
//converting arguments and parameter and values into json object

function marshallValue(procedure, argTypes, argValues, returnType) {
  let allParams = [];

  for(let count in argTypes) {
    let position = parseInt(count, 10) + 1;
    let param = {
      parameterPosition: position,
      parameterType: idl[argTypes[count]],
      parameterValue: argValues[count]
    };

    allParams.push(param);
    
  }

  let data = { serviceName: procedure,
    parameters: allParams,
    requestID: serviceRequestStatus.services[procedure],
    clientIp: clientIP
  };

  return data;
}

// calling of the registry service and then server
let rpcCall=function(xdrData, xdrDataValues) {
  return new Promise(function (resolve, reject) {
    let options = {
      url: 'http://localhost:8000/service-provider', 
      headers: {
        'data': JSON.stringify(xdrData)		//into jso
n format
      }
    };
    request.get(options, function (err, res)
	{
      if(err) {
        console.log(err);
      }
     
      let data = JSON.parse(res.body);		
      let serverAddress = data.serverAddress;

		    let options = {               
          method: 'post',     
          body: xdrDataValues,
          json: true,
          
          url: serverAddress
        };
        request(options, function (err, resp)
        {
          if (err) {
            console.log(err);
          } else {
            let data = resp.body;
           
            resolve(data);
          }
        })
      });
    });
  
};


//driver function
async function callProcedure(procedure, returnType,  ... arguments) {
  if(serviceRequestStatus.ip == null) {
    await getClientIP();
  }
let argValues = Array.prototype.slice.call(arguments); //…  means all value,put value in array.
  let argTypes = getArguementTypes(argValues);
  let xdrData = marshall(procedure, argTypes, returnType);
  let xdrDataValues = marshallValue(procedure, argTypes, argValues, returnType);
  let result = rpcCall(xdrData, xdrDataValues);

  result.then(() => {
    let requestID = serviceRequestStatus.services[procedure];

    requestID+= 1;
    serviceRequestStatus.services[procedure] = requestID;
    serviceRequestStatus.ip = clientIP;

    fs.writeFileSync('../request.json', JSON.stringify(serviceRequestStatus), (err, res) => {

    });
  });

  return result;
}

module.exports = {
  callProcedure: callProcedure
};













