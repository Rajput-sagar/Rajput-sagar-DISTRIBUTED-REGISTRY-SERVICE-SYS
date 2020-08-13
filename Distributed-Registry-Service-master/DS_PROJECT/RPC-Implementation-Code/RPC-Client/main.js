let proxy = require('./stub/main');		//entire file come under 								proxy,now we can its fun. 
async function main() {
    let addResult = await proxy.callProcedure('add', 'number', 4, 1);
    console.log('Addition result 4+1 => ' + addResult); //printing func.
    let subResult = await proxy.callProcedure('sub', 'number', 3, 5);
    console.log('Subtraction result 3-5 => ' + subResult);
    let mulResult = await proxy.callProcedure('mul', 'number', 1, 2);
    console.log('Multiplication result 1*2 => ' + mulResult);
}
main();
