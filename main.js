require('./hstABI');

var Web3 = require('web3');
var Tx = require('ethereumjs-tx');
web3 = new Web3("https://mainnet.infura.io/OuHDjJV7e6WGnTcmxJiU");
var Eth = require('web3-eth');
retok= new RegExp('^0x[a-fA-F0-9]{40}$');



var addr = '0x3f5ce5fbfe3e9af3971dd833d26ba9b5c936f0be';
var mAddr = '0x2375e9caa30aa76093e4a6c066434486faa491d9';
contractABI = human_standard_token_abi;


defTokenGas = 150000;
tokenDefGwei = 10;


function toFixed(x) {
  if (Math.abs(x) < 1.0) {
    var e = parseInt(x.toString().split('e-')[1]);
    if (e) {
        x *= Math.pow(10,e-1);
        x = '0.' + (new Array(e)).join('0') + x.toString().substring(2);
    }
  } else {
    var e = parseInt(x.toString().split('+')[1]);
    if (e > 20) {
        e -= 20;
        x /= Math.pow(10,e);
        x += (new Array(e+1)).join('0');
    }
  }
  return x;
}


tokenCheck = function(elem) {
  var liElem = elem.parentNode;
  var ulNode = liElem.parentNode;
  var gasNeeded = 0;
  for (var i = 0; i < ulNode.children.length; i++) {
    var inptBox = ulNode.children[i].querySelector('input');
    if (inptBox.checked) {
      gasNeeded+=defTokenGas;
    }
  }

  ulNode.parentNode.setAttribute('gascost', gasNeeded);
  getWholeCost();
}




searchForToken = function(symbol) {
  for (var t = 0; t < tokenAdds.length; t++) {
    if (tokenAdds[t].symbol == symbol) {
      return tokenAdds[t];
    }
  }
}


gweiToEth = function(estGass){
  return (estGass*0.00000001).toFixed(18);
}

ethDecim = function(ethu){
  return (ethu/(10**18)).toFixed(18);
}


async function checkTokenBal(ETHaddress, token, symbl, decimal){
  var contractAddress = token.address;

  tokenContract = new web3.eth.Contract(contractABI, contractAddress);


  await tokenContract.methods.balanceOf(ETHaddress).call({from: ETHaddress}, function(error, result){
    if (result > 0) {
      if (decimal > 0) {
        quanity = result/(10**decimal);
      }else {
        quanity = result;
      }

      var pubKeys= $('#adtokens')[0].getElementsByClassName('adtokens-public');
      for (var i = 0; i < pubKeys.length; i++) {
        if (pubKeys[i].value == ETHaddress) {
          keyElem = pubKeys[i];
          var tokNode = pubKeys[i].parentNode.getElementsByClassName('adtokens-toks')[0];

          var content2add = document.createElement('li');
          content2add.setAttribute('tokData', symbl+":"+result);
          content2add.innerHTML = symbl+': '+quanity+"<input type='checkbox' checked onclick='window.tokenCheck(this)'>";

          tokNode.appendChild(content2add);


          currgas = keyElem.parentNode.getAttribute('gascost');
          keyElem.parentNode.setAttribute('gascost', parseInt(currgas)+defTokenGas);
          getWholeCost();



          var prevv =pubKeys[i].parentNode.getAttribute('tokens');
          if (prevv == '') {
            pubKeys[i].parentNode.setAttribute('tokens', symbl+':'+result);
          }else {
            pubKeys[i].parentNode.setAttribute('tokens', prevv+','+symbl+':'+result);
          }
        }
      }
    }
  }).catch(function(error) {
    // console.log(error);
  });
}


checkTokens = function(addr) {
  var finallArr = [];

  var pubKeys= $('#adtokens')[0].getElementsByClassName('adtokens-public');
  for (var i = 0; i < pubKeys.length; i++) {
    if (pubKeys[i].value == addr) {
      var subNode = pubKeys[i].parentNode.getElementsByClassName('adtokens-sub')[0];
      web3.eth.getBalance(addr, function(err, balance) {
        subNode.textContent = 'eth balance: '+ethDecim(balance)+'    \n'+subNode.textContent;
      });
    }
  }

  for (var i = 0; i < tokenAdds.length; i++) {
    var ret = checkTokenBal(addr, tokenAdds[i], tokenAdds[i].symbol, tokenAdds[i].decimal);
    if (ret != null) {
      finallArr.push(ret);
    }
  }
  return finallArr;
}


getWholeCost = function(){
  tokenDefGwei = parseInt($('#useGwei').val());
  allTokWals = $('#adtokens')[0].getElementsByClassName('adtokens-itm');
  wholeCost = 0;

  for (var i = 0; i < allTokWals.length; i++) {
    wholeCost = parseInt(wholeCost) + parseInt(allTokWals[i].getAttribute('gascost'));
  }
  estGass = wholeCost * document.getElementsByClassName('sendtokens-itm').length;

  $('#estgas').text(estGass+'(gas) = '+gweiToEth(estGass*(tokenDefGwei/10))+'(eth)');//10 gwei
}


sendEth = async function(fromm, frommPUB){
  tokenDefGwei = parseInt($('#useGwei').val());
  fromAcc = web3.eth.accounts.privateKeyToAccount(fromm);
  allTokWals2 = $('#adtokens')[0].getElementsByClassName('adtokens-itm');
  var toAddLen = document.getElementsByClassName('sendtokens-itm').length;
  var nonceCo = await web3.eth.getTransactionCount(frommPUB, "pending");

  var gasToUse = 22000;


  if (fromm.substring(0, 2) != '0x') {
    fromm = '0x'+fromm;
  }

  for (var i = 0; i < allTokWals2.length; i++) {
    gCost = allTokWals2[i].getAttribute('gascost');
    if (toAddLen > 1) {
      gCost = gCost*toAddLen;
    }
    gCost = gCost*tokenDefGwei* 1e9;//10 gwei
    var pubKey= allTokWals2[i].getElementsByClassName('adtokens-public')[0].value;//send to

    if (retok.test(pubKey)) {
      await web3.eth.getBalance(frommPUB, (err, resp) => {
        if(err!=null){
          console.log(err)
        }else{
          console.log('eth balance:    '+web3.utils.fromWei(resp.toString(), 'ether'));
        }
      });

      console.log('eth to send  '+gCost+'         Tx fee  '+(21000*tokenDefGwei * 1e9));
      console.log('Actual cost in eth  '+web3.utils.fromWei(((gasToUse*tokenDefGwei * 1e9)+gCost).toString(), 'ether'));

      console.log('nonce  '+(nonceCo+i));
      // await web3.eth.accounts.privateKeyToAccount(fromm);
      web3.eth.accounts.signTransaction({
        to:pubKey,
        chainId: 1,
        value:gCost,
        gas: gasToUse,
        gasPrice: tokenDefGwei * 1e9,
        nonce: nonceCo+i
      }, fromm, function(err, r) {
          console.log(r);
          if (err != null) {
            console.log(err);
          }else {
            web3.eth.sendSignedTransaction(r.rawTransaction, function(errs, receipt) {
              if (errs != null) {
                console.log(errs);
              }else {
                console.log(receipt);
                web3.eth.getBalance(frommPUB, function(errr, balance) {
                  $('#ethRem').text('eth balance: '+window.ethDecim(balance));
                });
              }
            });
          }
      });
    }
  }
}



sendTokens = async function(fromArr, toArr, toksArr){
  var sendTo = document.getElementsByClassName('sendtokens-public'),
      sendToVal = [];
  tokenDefGwei = parseInt($('#useGwei').val());


  for (var p = 0; p < sendTo.length; p++) {
    sendToVal.push(sendTo[p].value);
  }

  for (var i = 0; i < fromArr.length; i++) {
    // toksArr = fromArr[i].getAttribute('tokens').split(',');
    let toksArr = [];
    let liElem = fromArr[i].querySelectorAll('li');
    for (var d = 0; d < liElem.length; d++) {
      if (liElem[d].querySelector('input').checked) {
        toksArr.push(liElem[d].getAttribute('tokData'));
      }
    }

    fromaddress = fromArr[i].getElementsByClassName('adtokens-public')[0].value;
    fromPriv = fromArr[i].getElementsByClassName('adtokens-private')[0].value;

    count = await web3.eth.getTransactionCount(fromaddress, "pending");
    console.log('-------------sending from: '+fromaddress+' -----------------');
    console.log('Used Gwei '+tokenDefGwei);

    if (fromPriv.substring(0, 2) == '0x') {
      fromPriv = fromPriv.substring(2);
    }


    tokensFinal = [];
    for (var c = 0; c < toksArr.length; c++) {
      //tokens per transaction
      var tokenObj =  toksArr[c].split(':');

      transfAm = toFixed((toFixed(tokenObj[1])/sendToVal.length).toFixed(0));
      tokensFinal[tokenObj[0]] = transfAm;

      var tokObj = await searchForToken(tokenObj[0]),
          tokenInst = await new web3.eth.Contract(contractABI, tokObj.address, {
              from: fromaddress, // default from address
          });








      for (var s = 0; s < sendToVal.length; s++) {
        toAddress= sendToVal[s];


        if (retok.test(toAddress)) {
          console.log('sending: '+tokenObj[0]+' '+(transfAm/(10**tokObj.decimal))+'  to  '+toAddress);

          let rawTx = {
              "nonce": web3.utils.toHex(count),
              "gas": web3.utils.toHex(defTokenGas),
              "gasPrice": web3.utils.toHex(tokenDefGwei * 1e9),
              "from": fromaddress,
              "to": tokObj.address,
              "value": "0x0",
              'chainId':  1,
              "data": tokenInst.methods.transfer(toAddress, transfAm).encodeABI()
          }
          console.log(rawTx);
          var privK = await Buffer.from(fromPriv, 'hex');
          var tx = new Tx(rawTx);
          tx.sign(privK);
          let serializedTx = await "0x" +tx.serialize().toString('hex');
          // console.log(serializedTx);

          web3.eth.sendSignedTransaction(serializedTx, function (err, txHash) {
            if (txHash != null) {
              console.log('txHash :::::');
              console.log(txHash);
            }
          }).then(function(re){
      	    console.log(re);
        	}).catch(function(error) {
            console.log(error);
          });

          count++;
        }
      }
    }
    // console.log(tokensFinal);
  }
}
